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
</p>

La demo permite comparar los **cinco modelos** y filtrar sus **siete estados animados**. Se publica automáticamente desde `main` mediante GitHub Pages.

| Pixel | Expressive | Windswept | Knit beanie | Backwards cap |
|:-----:|:----------:|:---------:|:-----------:|:-------------:|
| <img src="skins/pixel/happy-anim.svg" width="130" alt="Modelo pixel feliz"> | <img src="skins/expressive/happy.svg" width="130" alt="Modelo expressive feliz"> | <img src="skins/windswept/happy.svg" width="130" alt="Modelo windswept feliz"> | <img src="skins/knit-beanie/happy.svg" width="130" alt="Modelo knit beanie feliz"> | <img src="skins/backwards-cap/happy.svg" width="130" alt="Modelo backwards cap feliz"> |

Para ejecutarla localmente:

```bash
python3 -m http.server 8000
```

Después abrí `http://localhost:8000/demo/`. El [manual de usuario](USER_MANUAL.md) explica cómo recorrer la galería, elegir un modelo e integrar sus estados.

## Hardware

| Componente | Estado |
|------------|--------|
| ESP32-S3 | ✅ Conectado (`1a86:55d3` CH343) |
| Pantalla redonda | ⏳ Pendiente (GC9A01 o similar) |
| Micrófono I2S | ⏳ Pendiente |
| WiFi | ✅ Built-in |
| Bluetooth | ✅ Built-in (no utilizado — WiFi directo a la nube) |

## Arquitectura

```
┌──────────────────────────────────────────┐
│              ESP32-S3                     │
│                                           │
│   🎤 Micrófono (I2S)                     │
│      ↓                                    │
│   Audio → Whisper API (transcripción)    │
│      ↓                                    │
│   Texto → GPT-4o / GPT-4o-mini          │
│      ↓                                    │
│   Respuesta + Mood → Pantalla            │
│                                           │
│   ┌──────────────────────────────┐        │
│   │  🟢 Pantalla Redonda (240px) │        │
│   │                              │        │
│   │   Cara de Pericles           │        │
│   │   Estado de ánimo animado    │        │
│   │   Texto scrollando           │        │
│   │                              │        │
│   └──────────────────────────────┘        │
└──────────────────────────────────────────┘
```

### Decisión de arquitectura: Cloud-first

Se evaluó procesamiento local vs nube. **Cloud gana** por:

- **El ESP32-S3 no tiene potencia** para inferencia de LLM local
- **La latencia WiFi es bajísima** (~20-50ms a la API)
- **No se necesita intermediario** — conexión directa WiFi → OpenAI API
- **Bluetooth descartado** — bandwidth limitado, OpenAI no habla BT

## Stack

- **Firmware:** Arduino core para ESP32-S3 (o ESP-IDF)
- **Pantalla:** TFT_eSPI / LovyanGFX
- **Audio:** driver I2S nativo
- **APIs:** OpenAI Whisper (STT) + GPT-4o/4o-mini (chat)
- **HTTPS:** ESP32 HTTPSClient

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

- [x] Crear repo y definir arquitectura
- [x] Detectar y configurar ESP32-S3 en Linux
- [ ] Levantar pantalla redonda y mostrar algo
- [ ] Conexión WiFi + primera llamada a la API
- [ ] Micrófono I2S + Whisper API
- [x] Cinco caras animadas con sprites por mood
- [ ] Streaming de respuestas (texto letra por letra)
- [x] Definir la personalidad canónica
- [ ] Carcaza / housing impreso en 3D

## Desarrollo

### Prerequisitos

- Arduino IDE 2.x o PlatformIO
- Chrome o Edge (para ESPConnect / Web Serial)
- API key de OpenAI

### Flash

```bash
# Por ESPConnect (navegador):
# Abrir https://thelastoutpostworkshop.github.io/ESPConnect/ en Chrome

# Por PlatformIO:
pio run -t upload
```

### Permisos Linux

El ESP32-S3 necesita permisos de acceso al puerto serie:

```bash
sudo usermod -aG dialout $USER
newgrp dialout
```

## Licencia

MIT
