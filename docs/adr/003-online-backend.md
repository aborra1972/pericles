# ADR-003: Online Backend Deployment

## Status

Proposed

## Context

Pericles needs an online backend that:
- Stores per-device, per-person memory (Markdown + indexed retrieval)
- Proxies AI provider calls (OpenAI) with server-side API keys
- Issues temporary device authentication tokens
- Exposes health endpoints for monitoring
- Is accessible over HTTPS from ESP32 devices on any network

The PRD establishes that complexity lives outside the device: memory, AI, and heavy data reside in the backend. The device communicates over HTTPS; the Linux configurator manages backend pairing and configuration.

For the MVP there is a single device owner. The backend must be internet-accessible (the ESP32 connects from arbitrary networks), simple to deploy, and low-cost to operate.

## Decision

### Deployment Platform: Railway

**Chosen**: Railway (railway.app)

**Alternatives considered**:
- **Render**: Rejected — similar simplicity but slower cold starts on free tier; less mature WebSocket support for future streaming
- **Fly.io**: Rejected — requires Dockerfile and container management; adds complexity for MVP
- **VPS (Hetzner/DigitalOcean)**: Rejected — more control but requires OS hardening, process management, TLS cert renewal; overkill for single-user MVP
- **Local-first + ngrok**: Rejected — device loses access when laptop sleeps; ngrok URLs change; not a production-ready story

**Rationale**:
- Git-push deployment from `main` branch
- Built-in environment variable management (dashboard + CLI)
- Native health check support (configured per service)
- Free tier covers MVP workload (512 MB RAM, shared CPU)
- Managed PostgreSQL addon available when memory indexing needs it
- Automatic HTTPS with custom domain support
- No Dockerfile required for Node.js services

### Configuration: Environment Variables (12-Factor)

All configuration flows through environment variables. No config files in the deployed artifact.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | Yes | `3000` | HTTP listen port (Railway sets this automatically) |
| `NODE_ENV` | Yes | `development` | `production` enables strict security headers |
| `OPENAI_API_KEY` | Yes | — | OpenAI API key (server-side only) |
| `OPENAI_MODEL` | No | `gpt-4o` | Default model for conversations |
| `DATABASE_URL` | Yes* | — | PostgreSQL connection string (*required for ADR-04 memory) |
| `DEVICE_TOKEN_SECRET` | Yes | — | Secret for signing temporary device auth tokens |
| `TOKEN_TTL_SECONDS` | No | `86400` | Device token lifetime (default 24h) |
| `CORS_ORIGINS` | No | `*` | Allowed CORS origins (restrict in production) |
| `LOG_LEVEL` | No | `info` | `debug` | `info` | `warn` | `error` |

**Local development**: a `.env` file (gitignored) loaded via `dotenv`. Committed `.env.example` documents required variables without values.

**Railway production**: variables set through Railway dashboard or `railway variables set`. No `.env` file on the server.

### Health Endpoints

Two endpoints with distinct responsibilities:

#### `GET /health` — Liveness

Always returns `200 OK` if the process is running. Used by Railway's health check and load balancers.

```json
{
  "status": "ok",
  "timestamp": 1724150400000,
  "uptime": 3600
}
```

#### `GET /health/ready` — Readiness

Returns `200 OK` only when the service can handle requests. Checks:
- Database connectivity (when `DATABASE_URL` is set)
- AI provider reachability (optional, controlled by `HEALTH_CHECK_AI=true`)

```json
{
  "status": "ok",
  "checks": {
    "database": "ok",
    "ai_provider": "ok"
  },
  "timestamp": 1724150400000
}
```

Returns `503 Service Unavailable` when any check fails. Railway routes traffic away from unready instances.

Railway is configured to ping `/health` for liveness. Readiness checks are used during deployment rollout.

### Secrets Management

**原则**: no secrets in code, no secrets in git, no secrets in logs.

| Secret | Storage | Access |
|--------|---------|--------|
| `OPENAI_API_KEY` | Railway env var | `process.env.OPENAI_API_KEY` |
| `DEVICE_TOKEN_SECRET` | Railway env var | `process.env.DEVICE_TOKEN_SECRET` |
| `DATABASE_URL` | Railway env var | `process.env.DATABASE_URL` |
| `.env` (local) | `.gitignore` | `dotenv` package |

**Rules**:
- `.env` is gitignored; `.env.example` commits only variable names and descriptions
- Secrets are never logged, included in error responses, or stored in localStorage
- Token signing uses HMAC-SHA256 with `DEVICE_TOKEN_SECRET`
- API keys are never sent to the device; the backend proxies all AI calls
- Railway access is limited to the repository owner

### Backend Structure

```
backend/
  src/
    server.ts          # HTTP server, routing, health endpoints
    config.ts          # Env var parsing and validation
    health.ts          # Health check logic
    routes/
      health.ts        # /health and /health/ready handlers
  .env.example         # Required variables (no values)
  .env                 # Local dev values (gitignored)
  Dockerfile           # Optional: for local Docker testing
```

**`config.ts`** validates all required env vars at startup and fails fast with a clear message if any are missing. This prevents runtime surprises from misconfigured deployments.

```typescript
// Pattern: fail-fast config validation
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  openaiApiKey: requireEnv('OPENAI_API_KEY'),
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o',
  deviceTokenSecret: requireEnv('DEVICE_TOKEN_SECRET'),
  tokenTtl: parseInt(process.env.TOKEN_TTL_SECONDS || '86400', 10),
  corsOrigins: process.env.CORS_ORIGINS || '*',
  logLevel: process.env.LOG_LEVEL || 'info',
};
```

## Consequences

- **Single deployment target**: Railway owns the production backend; no multi-cloud complexity
- **Secrets stay server-side**: the ESP32 never holds API keys; all AI calls proxy through the backend
- **Fail-fast startup**: misconfigured env vars crash the process immediately rather than producing silent runtime errors
- **Health-driven deployment**: Railway stops routing to unready instances during deploys
- **Local parity**: `.env` + `dotenv` gives identical config behavior in development
- **Cost**: free tier covers MVP; scales to ~$5/month with traffic growth

## Test Strategy

- Config validation: unit tests with `vitest` verifying required var enforcement
- Health endpoints: integration tests with `supertest` mocking database/provider
- Health check under failure: verify 503 when database is unreachable

## Rollback Boundary

This ADR defines deployment infrastructure only. Reverting means choosing a different platform and updating environment variable names. Application code is unaffected.
