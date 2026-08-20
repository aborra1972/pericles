# ADR-005: Device Protocol

## Status

Proposed

## Context

Pericles has two communication channels:
1. **Device ↔ Backend** (HTTPS): the ESP32 sends conversation data and receives AI responses, memory context, and configuration
2. **Configurator ↔ Device** (BLE): the Linux app pairs, configures, and updates the device

The device must never hold API keys (PRD: "the ESP32 receives only temporary tokens or credentials"). The protocol must handle:
- Initial pairing and token issuance
- Ongoing authenticated communication
- API schema evolution without breaking deployed devices
- BLE-based configuration and firmware update control

## Decision

### Device ↔ Backend: HTTPS + REST + WebSocket

**Chosen**: HTTPS REST for request/response; WebSocket for streaming AI responses.

**Alternatives considered**:
- **MQTT**: Rejected — adds broker dependency; HTTPS is simpler for a single-user device; WebSocket handles streaming
- **gRPC**: Rejected — ESP32 gRPC libraries are immature; adds protobuf complexity
- **HTTP polling**: Rejected — wasteful for real-time responses; higher latency

**Rationale**:
- HTTPS is universally supported on ESP32 (Arduino WiFiClientSecure, ESP-IDF esp_http_client)
- REST is simple to implement and debug
- WebSocket allows streaming AI responses token-by-token (like the ChatGPT experience)
- Railway serves both natively

### Authentication: Temporary Bearer Tokens

**Flow**:

```
1. Configurator pairs device via BLE
2. Configurator sends device ID + API key to backend: POST /api/pair
3. Backend validates API key, creates device record, returns JWT
4. JWT stored in ESP32 NVS (non-volatile storage)
5. ESP32 sends JWT in Authorization header on every HTTPS request
6. Backend validates JWT on each request
7. Token expires after TOKEN_TTL_SECONDS (default 24h)
8. ESP32 re-authenticates when token expires (silent refresh)
```

**Token structure** (JWT HS256):

```json
{
  "sub": "device-{uuid}",
  "device_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "profile_id": "p-uuid-or-null",
  "iat": 1724150400,
  "exp": 1724236800
}
```

**Security rules**:
- JWT signed with `DEVICE_TOKEN_SECRET` (ADR-003)
- Device never stores the API key after initial pairing
- Token refresh is automatic and silent (device hits `/api/token/refresh`)
- Stolen token is valid until expiry; owner can revoke via `POST /api/devices/:id/revoke`
- Rate limiting: 100 requests/minute per device (configurable)

### API Schema Versioning: URI Prefix

**Chosen**: `/api/v1/...` URI prefix for all device endpoints.

**Alternatives considered**:
- **Header-based versioning** (`Accept-Version: 1`): Rejected — harder to debug; ESP32 HTTP clients make header management cumbersome
- **Content negotiation**: Rejected — over-engineered for an embedded device

**Rationale**:
- Clear and debuggable: you can see the version in every request
- ESP32 just hardcodes the base URL with the version
- When v2 is needed, old devices keep working on `/api/v1/`; new devices use `/api/v2/`
- Backend can support multiple versions simultaneously during migration

### API Endpoints (v1)

#### Device Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/pair` | API key | Pair a new device, returns JWT |
| `POST` | `/api/v1/token/refresh` | JWT | Refresh an expiring token |
| `POST` | `/api/v1/devices/:id/revoke` | Owner | Revoke all tokens for a device |

#### Conversation

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/converse` | JWT | Send transcription, receive AI response |
| `GET` | `/api/v1/converse/stream` | JWT | WebSocket upgrade for streaming responses |

#### Memory

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/v1/memories` | JWT | List memories for current profile |
| `POST` | `/api/v1/memories` | JWT | Create a new memory |
| `DELETE` | `/api/v1/memories/:id` | JWT | Soft-delete a memory |

#### Configuration

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/v1/config` | JWT | Get device configuration |
| `PUT` | `/api/v1/config` | JWT | Update device configuration |

#### Health (unauthenticated)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/v1/health` | None | Liveness check |
| `GET` | `/api/v1/health/ready` | None | Readiness check |

### BLE Pairing Protocol

BLE is used only during initial setup and maintenance. It is NOT used for ongoing conversation.

**Pairing flow**:

```
Configurator                          ESP32
     |                                  |
     |--- BLE Scan & Connect --------->|
     |                                  |
     |--- Request device info --------->|
     |<-- Model, firmware version ------|
     |                                  |
     |--- Send WiFi credentials ------->|
     |    (SSID + password)             |
     |                                  |
     |--- Send backend URL ------------>|
     |    (https://api.pericles.dev)    |
     |                                  |
     |--- Send pairing token ---------->|
     |    (one-time, from backend)      |
     |                                  |
     |--- Disconnect ------------------>|
     |                                  |
     |   ESP32 connects to backend via WiFi
     |   Exchanges pairing token for JWT
     |                                  |
```

**BLE characteristics**:

| Characteristic | UUID | Properties | Description |
|----------------|------|------------|-------------|
| Device Info | `0x180A` | Read | Model, firmware version, MAC |
| WiFi Config | Custom | Write | SSID + password (encrypted) |
| Backend URL | Custom | Write | Backend endpoint URL |
| Pairing Token | Custom | Write | One-time pairing token |
| Status | Custom | Read/Notify | Connection status, errors |

BLE is encrypted via standard pairing (Just Works for MVP, Passkey in future).

### Request/Response Schema

**Converse request**:

```json
{
  "text": "¿De qué hora es el partido de Boca?",
  "context": {
    "time_of_day": "morning",
    "session_memories": ["memory-id-1", "memory-id-2"]
  },
  "schema_version": "1.0"
}
```

**Converse response** (non-streaming):

```json
{
  "text": "¡El partido es a las 21:00! Ya te preparé el mate para la previa.",
  "emotion": "happy",
  "memories_created": ["memory-id-3"],
  "schema_version": "1.0"
}
```

**Converse streaming** (WebSocket):

```json
{"type": "start", "emotion": "happy", "schema_version": "1.0"}
{"type": "token", "text": "¡El "}
{"type": "token", "text": "partido "}
{"type": "token", "text": "es "}
{"type": "token", "text": "a las 21:00!"}
{"type": "end", "memories_created": ["memory-id-3"]}
```

### Schema Version Negotiation

- Every request includes `schema_version` field
- Every response includes `schema_version` field
- Backend supports current and previous version
- Unknown version → `400 Bad Request` with supported versions
- Device checks response version and warns if outdated

```
Device: schema_version: "1.0"
Backend: supports ["1.0", "1.1"]
→ Proceeds with 1.0

Device: schema_version: "0.9"
Backend: supports ["1.0", "1.1"]
→ 400 { error: "unsupported_schema", supported: ["1.0", "1.1"] }
→ Device logs warning, upgrades firmware if available
```

## Consequences

- **Two channels, one backend**: BLE for setup, HTTPS for everything else. BLE is not a data channel.
- **Token lifecycle**: automatic refresh means the device stays connected without user intervention; revocation is a manual owner action.
- **Schema evolution**: URI versioning lets old devices keep working while new features roll out.
- **Streaming**: WebSocket gives the "ChatGPT experience" of token-by-token responses on the round display.
- **Security**: device holds only a JWT, never an API key. Stolen JWT is time-limited and revocable.

## Test Strategy

- Token lifecycle: issue token → use it → refresh it → verify old token is invalid
- Pairing flow: mock BLE → send credentials → verify JWT is issued
- Schema versioning: send v1 request → verify v1 response; send unknown version → verify 400
- Streaming: connect WebSocket → verify token-by-token delivery → verify end event
- Revocation: revoke device → verify all tokens are invalid → verify device must re-pair

## Rollback Boundary

This ADR defines the communication protocol. Reverting means choosing a different protocol (e.g., MQTT, gRPC) and rewriting device and backend communication layers.
