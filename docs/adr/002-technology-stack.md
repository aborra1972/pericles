# ADR-002: Technology Stack

## Status

Proposed

## Context

Pericles requires three main components with different runtime requirements:
1. **Backend**: Online API server handling memory, AI provider integration, and device communication
2. **Configurator**: Linux GUI for device setup, personality configuration, and firmware updates
3. **Firmware**: ESP32-S3 firmware for voice capture, display rendering, and connectivity

## Decision

### Backend: Node.js + TypeScript

**Chosen**: Node.js 24+ with TypeScript

**Alternatives considered**:
- **Go**: Rejected — not available in current environment; steeper learning curve for rapid prototyping
- **Python**: Rejected — slower runtime for streaming responses; weaker typing for API contracts

**Rationale**:
- Available in current environment (Node.js v24.18.0)
- Excellent ecosystem for HTTP servers, WebSocket streaming, and AI SDKs
- TypeScript provides type safety for API contracts
- Good testing ecosystem (Vitest, Jest)
- Simple deployment via Docker or standalone binary

### GUI: Electron

**Chosen**: Electron with TypeScript frontend

**Alternatives considered**:
- **Tauri**: Rejected — requires Rust toolchain (not available); lighter but adds complexity
- **GTK/Qt**: Rejected — requires native libraries; cross-platform is not needed (Linux only for MVP)
- **Flutter**: Rejected — not available; overkill for configuration tool

**Rationale**:
- Available via Node.js ecosystem
- System-level access via Node.js APIs (USB, file system, serial ports)
- Good for hardware interaction (USB device detection, firmware flashing)
- Can be packaged as AppImage for Linux distribution

### Firmware: ESP-IDF

**Chosen**: ESP-IDF with C/C++

**Alternatives considered**:
- **Arduino**: Rejected — less control over hardware peripherals; limited BLE/audio support
- **MicroPython**: Rejected — too slow for real-time audio processing; limited memory control

**Rationale**:
- Official Espressif framework for ESP32-S3
- Full control over I2S, BLE, display drivers, and memory management
- Required for XVF3800 integration (I2C control, DFU)
- Production-ready with OTA support

## Build Spikes

### Backend Spike (`backend/`)

Minimal HTTP server with health endpoint:

```typescript
// backend/src/server.ts
import http from 'node:http';

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

const port = parseInt(process.env.PORT || '3000', 10);
server.listen(port, () => console.log(`Backend listening on :${port}`));
```

### GUI Spike (`configurator/`)

Minimal Electron window:

```typescript
// configurator/src/main.ts
import { app, BrowserWindow } from 'electron';

app.whenReady().then(() => {
  const win = new BrowserWindow({ width: 800, height: 600 });
  win.loadFile('index.html');
});

app.on('window-all-closed', () => app.quit());
```

### Firmware Spike (`firmware/`)

Minimal ESP-IDF project with GC9A01 init:

```c
// firmware/main/main.c
#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/gpio.h"

void app_main(void) {
    printf("Pericles firmware starting\n");
    vTaskDelay(pdMS_TO_TICKS(1000));
    printf("Ready\n");
}
```

## Rejected Alternatives

See rationale above for each component.

## Consequences

- Backend and GUI share Node.js runtime and TypeScript tooling
- Firmware requires separate ESP-IDF installation (documented in setup guide)
- All components can be tested independently
- CI requires Node.js for backend/GUI and ESP-IDF Docker image for firmware

## Test Strategy

- Backend: Unit tests with Vitest; integration tests with supertest
- GUI: Unit tests with Vitest; E2E tests with Playwright (future)
- Firmware: Unit tests with ESP-IDF test framework; hardware tests on real devices

## Rollback Boundary

This ADR defines technology choices only. Build spikes are minimal and replaceable. Reverting means choosing different technologies and rewriting spikes.
