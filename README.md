<p align="center">
  <img src="skins/backwards-cap/happy.svg" width="240" alt="Pericles wearing a backwards cap"/>
</p>

<h1 align="center">Pericles</h1>

<p align="center">
  <strong>Asistente AI con cara, personalidad y criterio propio</strong><br>
  <sub>Un ESP32-S3 con pantalla redonda, micrófono y una personalidad traviesa y entrañable</sub>
</p>

---

## ¿Qué es Pericles?

Un asistente técnico y general que vive en una placa ESP32-S3 con pantalla redonda. No es un chatbot aburrido — **tiene cara, estado de ánimo, carisma y sabe hacer chistes** cuando corresponde.

Su personaje está inspirado en **Pericles Addams**, de *Los Locos Addams*: travieso, excéntrico, con humor oscuro y afectuoso, nunca cruel.

## Demo de personajes

<p align="center">
  <a href="https://aborra1972.github.io/pericles/demo/"><strong>Abrir la galería interactiva</strong></a>
  ·
  <a href="USER_MANUAL.md">Leer el manual de usuario</a>
  ·
  <a href="PRD.md">Consultar el PRD</a>
  ·
  <a href="TASKS.md">Ver plan de implementación</a>
</p>

La demo permite comparar los **cinco modelos** y filtrar sus **ocho estados animados**. Se publica automáticamente desde `main` mediante GitHub Pages.

| Pixel | Expressive | Windswept | Knit beanie | Backwards cap |
|:-----:|:----------:|:---------:|:-----------:|:-------------:|
| <img src="skins/pixel/happy-anim.svg" width="130" alt="Modelo pixel feliz"> | <img src="skins/expressive/happy.svg" width="130" alt="Modelo expressive feliz"> | <img src="skins/windswept/happy.svg" width="130" alt="Modelo windswept feliz"> | <img src="skins/knit-beanie/happy.svg" width="130" alt="Modelo knit beanie feliz"> | <img src="skins/backwards-cap/happy.svg" width="130" alt="Modelo backwards cap feliz"> |

Para ejecutarla localmente:

```bash
python3 -m http.server 8000
```

Después abrí `http://localhost:8000/demo/`. El [manual de usuario](USER_MANUAL.md) explica cómo recorrer la galería, elegir un modelo e integrar sus estados.

## Hardware

### Variante N16R8 (integrada)

| Componente | Estado |
|------------|--------|
| ESP32-S3 N16R8 | ✅ Detectado (`1a86:55d3` CH343) |
| Pantalla GC9A01 240×240 | ✅ Driver implementado |
| Micrófono INMP441 I2S | ✅ Driver implementado |
| Speaker MAX98357 I2S | ✅ Driver implementado |
| Action button (GPIO 9) | ✅ Implementado |
| WiFi | ✅ Built-in |

### Variante ReSpeaker + XIAO

| Componente | Estado |
|------------|--------|
| ReSpeaker XVF3800 (4 mics, AEC, AGC) | ✅ Verificado en placa: I2C servicer @0x2C + I2S TX audible |
| XIAO ESP32-S3R8 (8MB flash, 8MB PSRAM) | ✅ sdkconfig defaults + flasheo verificado |
| WS2812 LEDs | ✅ Rail verificada físicamente; animaciones manejadas por el XMOS |
| TLV320AIC3104 Codec | ✅ Registros legibles @0x18; control vía comandos XMOS |
| Mute button (hardware) | ✅ Verificado bidireccional por I2C (X0D30) |
| WiFi | ✅ Built-in |

> **Validación en hardware real (2026-08-21):** audio full-duplex probado en
> placa — tono audible por el jack (TX) y captura de micrófonos con la voz del
> usuario visible en los datos (RX, beam procesado + mic crudo). Protocolo del
> servicer XMOS decodificado, mute y LEDs verificados. Pendiente: VAD/DoA y
> DFU. Detalle en [docs/DEVELOPMENT_PROGRESS.md](docs/DEVELOPMENT_PROGRESS.md).

## Arquitectura

```
┌────────────────────────────────────────────────────────────┐
│                    Linux Configurator                       │
│  (Electron + React)                                        │
│  Profiles · Diagnostics · Settings · Update                │
└────────────────────────────────────────────────────────────┘
                           │
                     HTTPS + REST + WebSocket + JWT + BLE
                           │
┌────────────────────────────────────────────────────────────┐
│                    Backend (Railway)                         │
│  Node.js + Express + PostgreSQL + Redis                     │
│  Memory (Markdown+PG) · AI Providers · Auth · OTA          │
└────────────────────────────────────────────────────────────┘
                           │
                        WiFi directo
                           │
┌────────────────────────────────────────────────────────────┐
│                    ESP32-S3 Firmware                         │
│  N16R8 (integrada) · ReSpeaker + XIAO (8MB/8MB)            │
│  Audio Capture → Whisper API → GPT-4o → Display            │
│  Skins (5) · States (8) · Buttons · LEDs                   │
└────────────────────────────────────────────────────────────┘
```

### Stack

| Capa | Tecnologías | Versión |
|------|-------------|---------|
| **Firmware** | ESP-IDF · C · LVGL | v5.4 |
| **Display** | GC9A01 round 240×240 | SPI |
| **Audio** | I2S (INMP441 · MAX98357) | Native |
| **ReSpeaker** | XVF3800 (4-mic, AEC, VAD, DoA) | I2S + I2C |
| **Backend** | Node.js · Express · TypeScript | v24+ |
| **Database** | PostgreSQL · Redis | — |
| **Memory** | Markdown + PostgreSQL | ADR-004 |
| **Auth** | JWT · BLE | ADR-005 |
| **Configurator** | Electron · React · TypeScript | ES2022 |
| **AI** | OpenAI Whisper + GPT-4o/4o-mini | API |
| **Build** | npm workspaces · CMake · Ninja | — |
| **Testing** | Vitest | v3.2 |
| **CI/CD** | GitHub Actions | — |

#### Dependencias principales

**Backend** (`package.json`):
- `express` — HTTP server
- `pg` — PostgreSQL client
- `ioredis` — Redis client
- `jsonwebtoken` — JWT auth
- `openai` — OpenAI SDK
- `marked` — Markdown parsing
- `vitest` — testing

**Configurator** (`package.json`):
- `electron` — desktop shell
- `react` — UI framework
- `react-dom` — DOM rendering
- `esbuild` — bundler
- `electron-builder` — packaging
- `vitest` — testing

**Firmware** (`CMakeLists.txt`):
- `espressif__lvgl` — display library
- `espressif__cjson` — JSON parsing
- `driver` — I2S, I2C, SPI
- `esp_wifi` — WiFi connectivity
- `nvs_flash` — persistent storage

## Personalidad

El [perfil canónico del personaje](CHARACTER.md) define los rasgos que deben conservar el firmware y los prompts.

Pericles no es un asistente genérico. Tiene:

- **Bostero desde la cuna** — es hincha de Boca desde que nació
- **Pasión por la cancha** — le gusta ir al estadio
- **Canciones y cantos de Boca** — los conoce, sin reproducir sus letras
- **Más de 17 años en San Telmo** — vive en el barrio y expresa pertenencia cuando corresponde
- **Humor inspirado en Pericles Addams** — travieso, excéntrico y oscuro, pero afectuoso, nunca cruel
- **Estados de ánimo** — su cara cambia según el contexto (feliz, pensativo, sorprendido, chistoso, enojado)
- **Lenguaje con personalidad** — responde en castellano con carácter
- **Cara animada** — sprites pixel art en la pantalla redonda

### Estados de ánimo

| Mood | Expresión | Cuándo |
|------|-----------|--------|
| 😊 Happy | Sonrisa + ojos brillantes | Respuesta exitosa, buena onda |
| 🤔 Thinking | Ceja levantada + ojos al lado | Procesando / razonando |
| 😮 Surprised | Ojos grandes + boca abierta | Pregunta inesperada |
| 😏 Funny | Sonrilla torcida + un ojo | Haciendo chiste |
| 😤 Angry | Cejas fruncidas + rojo | Error / algo falló |

### Prompt de sistema

```
Sos Pericles, un asistente inspirado en Pericles Addams de Los Locos Addams.
Tenés un humor travieso, excéntrico y oscuro, siempre afectuoso y nunca cruel.
Sos bostero e hincha de Boca desde la cuna; te gusta ir a la cancha y conocés sus canciones y cantos, sin reproducir letras.
Vivís en San Telmo desde hace más de 17 años.
Mostrá tu estado de ánimo y respondé en castellano con personalidad.
```

La API devuelve `mood` + `text`, y el ESP32:
1. `mood` → cambia el sprite de la cara
2. `text` → lo displaya con efecto typewriter

## Roadmap

- [x] Crear repo y definir arquitectura (ADR-001–008)
- [x] Detectar y configurar ESP32-S3 en Linux
- [x] npm workspaces + build scripts + CI/CD
- [x] Backend online (Railway) con memoria Markdown+PG
- [x] Configurador Linux (Electron + React) — rutas y tests
- [x] Firmware ESP-IDF v5.4 completo (30 módulos)
- [x] Drivers hardware (ReSpeaker XVF3800, I2S, I2C, codec, LEDs)
- [x] 5 skins animadas con 8 estados cada una
- [x] Auth (JWT + BLE) + perfiles por persona
- [x] 597+ tests (Backend + Configurator + Contracts + Acceptance)
- [x] Phase 7: Integración y aceptación (15/15 tasks ✅)
- [ ] Configurador UI completa (pendiente para MVP funcional)

## Desarrollo

### Prerequisitos

- Node.js v24+ (o v20 LTS)
- Python 3.12+ (para ESP-IDF)
- ESP-IDF v5.4
- Git

### Instalación rápida

```bash
git clone https://github.com/aborra1972/pericles.git
cd pericles
npm install
npm run build
npm test                # ejecuta los 447 tests
```

### Desarrollo

```bash
# Backend
npm run dev --workspace=backend

# Configurador
npm run dev --workspace=configurator

# Firmware (necesita ESP-IDF)
cd firmware
idf.py set-target esp32s3
idf.py build flash monitor
```

### Tests

```bash
npm test                # todos los tests
npm test --workspace=backend
npm test --workspace=configurator
```

### Permisos Linux

El ESP32-S3 necesita permisos de acceso al puerto serie:

```bash
sudo usermod -aG dialout $USER
newgrp dialout
```

## Licencia

MIT
