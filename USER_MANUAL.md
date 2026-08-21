# USER_MANUAL.md — Manual de usuario de Pericles

## 1. Bienvenida

Pericles es un asistente de voz con pantalla redonda, personalidad y memoria. Vive en un ESP32-S3 y se configura desde una aplicación Linux.

---

## 2. Hardware soportado

### Variante N16R8 (integrada)

| Componente | Detalle |
|------------|---------|
| Placa | ESP32-S3 N16R8 (16 MB flash, 8 MB PSRAM) |
| Pantalla | GC9A01 240×240 SPI |
| Micrófono | INMP441 I2S (ogenial integrado) |
| Speaker | MAX98357 I2S |
| Botón | GPIO 9 (action button) |

Ver [Pinout N16R8](docs/hardware/n16r8-pinout.md).

### Variante ReSpeaker + XIAO

| Componente | Detalle |
|------------|---------|
| Micrófono | ReSpeaker XVF3800 (4 mics, AEC, AGC, VAD, DoA) |
| Placa | XIAO ESP32-S3R8 (8 MB flash, 8 MB PSRAM) |
| Speaker | Amplificador integrado ReSpeaker |
| Pantalla | GC9A01 240×240 SPI |
| LEDs | WS2812 (built-in ReSpeaker) |
| Codec | TLV320AIC3104 |
| Botón | Mute (ReSpeaker hardware) |

Ver [Pinout ReSpeaker](docs/hardware/respeaker-pinout.md).

> **Estado de validación (agosto 2026):** la variante ReSpeaker está en
> validación sobre placa real. Ya verificado: comunicación I2C con el XVF3800,
> botón de mute (bidireccional), LEDs WS2812 y audio full-duplex (tono audible
> por el jack y captura de micrófonos con la voz visible en los datos).
> Pendiente: VAD/DoA y actualización DFU. Detalle en
> [docs/DEVELOPMENT_PROGRESS.md](docs/DEVELOPMENT_PROGRESS.md).

---

## 3. Instalación

### 3.1 Backend (Railway)

1. Clonar el repo:
   ```bash
   git clone https://github.com/aborra1972/pericles.git
   cd pericles
   ```
2. Instalar dependencias del workspace:
   ```bash
   npm install
   ```
3. Configurar variables de entorno (ver `.env.example`).
4. Levantar el backend:
   ```bash
   npm run dev --workspace=backend
   ```

### 3.2 Configurador Linux

```bash
npm run dev --workspace=configurator
```

La app abre una ventana con las pestanas: Profiles, Diagnostics, Settings, Update.

### 3.3 Firmware ESP32-S3

```bash
cd firmware
idf.py set-target esp32s3
idf.py menuconfig          # seleccionar variante (N16R8 o XIAO)
idf.py build flash monitor
```

---

## 4. Uso

### 4.1 Conversar

1. Presionar el **botón de acción** (o el botón Mute en ReSpeaker).
2. Esperar el sonido de "escuchando".
3. Hablar.
4. La transcripción aparece en pantalla.
5. Pericles responde con texto + cara animada.

### 4.2 Skins

Pericles tiene **5 skins** intercambiables desde el configurador:

| Skin | Estilo |
|------|--------|
| Bostero | Gorraetrás, azul y oro de Boca |
| Techie | Pantalla verde, estilo terminal |
| Gamer | Neón y morado |
| Minimal | Blanco y gris, limpio |
| Default | Azul suave, estándar |

### 4.3 Estados de ánimo

| Mood | Expresión | Cuándo |
|------|-----------|--------|
| 😊 Happy | Sonrisa + ojos brillantes | Respuesta exitosa |
| 🤔 Thinking | Ceja levantada | Procesando |
| 😮 Surprised | Ojos grandes | Pregunta inesperada |
| 😏 Funny | Sonrilla torcida | Haciendo chiste |
| 😤 Angry | Cejas fruncidas | Error |
| 🎙️ Listening | Ojos abiertos, atento | Grabando audio |
| 🗣️ Speaking | Boca animada | Responiendo |
| 😴 Idle | Cara relajada | En espera |

### 4.4 Modo invitado

Un invitado puede conversar sin crear memoria persistente. La sesión es completamente efímera.

### 4.5 Resumen

- **Primera sesión:** Pericles ofrece un resumen automático.
- **On demand:** "Dame un resumen", "¿Qué pasó hoy?", "Resume our conversation".

### 4.6 Offline

Los controles locales (skin, volumen, alarmas) funcionan sin internet. Los datos pendientes se sincronizan al reconectar.

---

## 5. Configurador

### 5.1 Profiles

- Crear, editar y eliminar perfiles de personas.
- Exportar/importar datos (solo owner).
- Gestionar skins por persona.

### 5.2 Diagnostics

- Estado de conexión WiFi.
- Nivel de batería (si aplica).
- Versión de firmware.
- Logs del sistema.

### 5.3 Settings

- Volumen por defecto.
- Idioma.
- Modo invitado (on/off).
- Error reporting (opt-in).

### 5.4 Update

- Verificar actualizaciones disponibles.
- Confirmar antes de flashear.
- Backup automático antes de actualizar.
- Rollback si falla.

---

## 6. Seguridad y privacidad

- **Memoria por persona:** cada persona tiene su propio store aislado.
- **Guest mode:** sin persistencia de datos.
- **Solo owner** puede exportar o borrar datos.
- **Audio:** se borra después de transcribir, nunca se almacena en DB.
- **Support bundles:** solo datos técnicos, sin memorias ni conversaciones.
- **Error reporting:** opt-in por dispositivo, desactivado por defecto.

---

## 7. Solución de problemas

| Problema | Solución |
|----------|----------|
| No conecta WiFi | Verificar credenciales en configurador |
| No reconoce voice | Verificar micrófono en Diagnostics |
| Pantalla negra | Revisar conexiones SPI, reiniciar ESP32 |
| Firmware update falla | Restaurar desde backup (Update → Rollback) |
| Perfil no aparece | Verificar que no estás en modo invitado |

---

## 8. Licencia

MIT
