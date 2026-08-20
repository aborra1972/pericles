# ADR-007: Hardware Profiles

## Status

Proposed

## Context

Pericles supports two hardware variants (established in PRD and BASE-02):

1. **Integrated**: ESP32-S3 N16R8 with direct peripheral connections
2. **ReSpeaker**: XVF3800 audio processor + XIAO ESP32-S3R8 (8 MB flash + 8 MB PSRAM)

Both variants must deliver the same user experience: voice conversation, round display, physical buttons, and animated skins. The firmware must abstract hardware differences behind a common interface so that application code is variant-agnostic.

The configurator must auto-detect which variant is connected and present the correct settings.

## Decision

### Profile Model: Capability-Based Abstraction

Each hardware variant is described by a **profile manifest** that declares:
- Hardware capabilities (what it can do)
- Pin mappings (how peripherals are connected)
- Audio configuration (microphone array, codec, amplifier)
- Display configuration (resolution, driver, SPI bus)
- Constraints (memory limits, flash size, processing power)

Application code queries capabilities at runtime rather than checking variant names.

### Profile Manifests

#### Integrated Profile (`profiles/integrated.json`)

```json
{
  "id": "integrated",
  "name": "Pericles Integrado",
  "description": "ESP32-S3 N16R8 with direct peripheral connections",
  "mcu": {
    "chip": "ESP32-S3-N16R8",
    "flash_mb": 16,
    "psram_mb": 8,
    "cpu_mhz": 240
  },
  "display": {
    "driver": "GC9A01",
    "width": 240,
    "height": 240,
    "bus": "SPI",
    "pins": {
      "mosi": 11,
      "sclk": 12,
      "cs": 10,
      "dc": 13,
      "rst": 14,
      "bl": 21
    },
    "spi_host": "SPI2_HOST"
  },
  "audio": {
    "input": "internal_adc",
    "output": "internal_dac",
    "codec": null,
    "microphones": 0,
    "speaker_watts": 1,
    "aec": false,
    "beamforming": false,
    "vad": false
  },
  "buttons": {
    "action": { "pin": 0, "mode": "pullup" },
    "volume_up": { "pin": 15, "mode": "pullup" },
    "volume_down": { "pin": 16, "mode": "pullup" }
  },
  "leds": {
    "count": 0,
    "type": null
  },
  "connectivity": {
    "wifi": true,
    "ble": true,
    "usb": true
  },
  "constraints": {
    "max_svg_size_kb": 50,
    "max_concurrentAnimations": 2,
    "ota_supported": false
  }
}
```

#### ReSpeaker Profile (`profiles/respeaker.json`)

```json
{
  "id": "respeaker",
  "name": "Pericles ReSpeaker",
  "description": "XVF3800 + XIAO ESP32-S3R8 with 4-mic array and amplified speaker",
  "mcu": {
    "chip": "XIAO-ESP32-S3R8",
    "flash_mb": 8,
    "psram_mb": 8,
    "cpu_mhz": 240
  },
  "display": {
    "driver": "GC9A01",
    "width": 240,
    "height": 240,
    "bus": "SPI",
    "pins": {
      "mosi": 10,
      "sclk": 8,
      "cs": 7,
      "dc": 6,
      "rst": 5,
      "bl": 4
    },
    "spi_host": "SPI2_HOST"
  },
  "audio": {
    "input": "xvf3800_i2s",
    "output": "tlv320aic3104",
    "codec": "TLV320AIC3104",
    "microphones": 4,
    "microphone_type": "pdm_circular_array",
    "speaker_watts": 5,
    "amp_enabled_pin": 2,
    "i2s_pins": {
      "bck": 17,
      "ws": 18,
      "data_in": 19,
      "data_out": 20
    },
    "i2c_pins": {
      "sda": 21,
      "scl": 22
    },
    "i2c_address": "0x3C",
    "aec": true,
    "beamforming": true,
    "vad": true,
    "doa": true,
    "dereverb": true,
    "noise_reduction": true
  },
  "buttons": {
    "action": { "pin": 1, "mode": "pullup" },
    "mute": { "pin": 3, "mode": "pullup" }
  },
  "leds": {
    "count": 12,
    "type": "WS2812",
    "pin": 38
  },
  "connectivity": {
    "wifi": true,
    "ble": true,
    "usb": true
  },
  "constraints": {
    "max_svg_size_kb": 30,
    "max_concurrentAnimations": 3,
    "ota_supported": false
  }
}
```

### Capability Query API

Firmware exposes a runtime API for capability checks:

```c
// Check if a capability is available
bool pericles_has_capability(pericles_capability_t cap);

// Get hardware-specific values
const pericles_profile_t* pericles_get_profile(void);
```

**Capability enum**:

```c
typedef enum {
    CAP_AEC,              // Acoustic Echo Cancellation
    CAP_BEAMFORMING,      // Microphone beamforming
    CAP_VAD,              // Voice Activity Detection
    CAP_DOA,              // Direction of Arrival
    CAP_DEREBERB,         // De-reverberation
    CAP_NOISE_REDUCTION,  // Noise reduction
    CAP_MULTI_MIC,        // Multiple microphone array
    CAP_AMPLIFIED_SPEAKER, // External amplifier
    CAP_WS2812_LEDS,      // Addressable LEDs
    CAP_MUTE_BUTTON,      // Hardware mute
} pericles_capability_t;
```

**Usage in application code**:

```c
// Application code is variant-agnostic
if (pericles_has_capability(CAP_AEC)) {
    // Use AEC-processed audio
    audio_source = audio_get_processed();
} else {
    // Use raw ADC audio
    audio_source = audio_get_raw();
}

// Display works the same on both variants
display_draw_face(current_emotion);

// LEDs only on ReSpeaker
if (pericles_has_capability(CAP_WS2812_LEDS)) {
    leds_set_color(0, LED_COLOR_BLUE);
    leds_show();
}
```

### Auto-Detection

The configurator detects the hardware variant via USB:

1. **USB descriptor**: each variant presents a different USB product string
   - Integrated: `"Pericles ESP32-S3"`
   - ReSpeaker: `"Pericles ReSpeaker"`
2. **I2C probe**: configurator probes I2C bus for XVF3800 at address `0x3C`
   - Found → ReSpeaker variant
   - Not found → Integrated variant
3. **Profile selection**: configurator loads the matching profile manifest and sends it to the device

### Display Abstraction

Both variants use the same GC9A01 round display (240×240). The SPI pins differ, but the driver is identical. The firmware abstracts this behind:

```c
// Initialize display with profile-specific pins
void display_init(const pericles_profile_t* profile);

// All rendering functions are variant-agnostic
void display_draw_face(emotion_t emotion);
void display_show_text(const char* text, int size);
void display_show_overlay(overlay_type_t overlay);
```

### Audio Abstraction

Audio is where variants differ most:

```c
// Initialize audio with profile-specific config
void audio_init(const pericles_profile_t* profile);

// Get audio input (processed or raw depending on capabilities)
audio_buffer_t* audio_get_input(void);

// Play audio output
void audio_play(const audio_buffer_t* buffer);
```

**Integrated variant**: raw ADC input, DAC output. No echo cancellation. User must be close to the device.

**ReSpeaker variant**: XVF3800-processed input with AEC, beamforming, VAD. TLV320AIC3104 codec output to 5W amplified speaker. Full far-field voice capture.

## Consequences

- **Variant-agnostic application code**: the main firmware logic never checks variant names; it queries capabilities.
- **Profile manifests are data**: adding a new hardware variant means adding a JSON file and implementing the hardware abstraction layer (HAL) for that variant. No changes to application code.
- **Auto-detection simplifies onboarding**: the configurator figures out what's connected; the user doesn't need to know their hardware variant.
- **Display is identical**: same driver, same resolution, same skins. Only pin mappings differ.
- **Audio is the key differentiator**: ReSpeaker gets full audio processing; Integrated gets raw audio. The application adapts via capability queries.

## Test Strategy

- Profile loading: load each profile manifest → verify all required fields are present
- Capability query: mock each profile → verify correct capability responses
- Display init: verify both pin configurations initialize the GC9A01 correctly
- Audio init: verify Integrated uses ADC/DAC, ReSpeaker uses I2S+codec
- Auto-detection: mock USB descriptor → verify correct profile is selected

## Rollback Boundary

This ADR defines the hardware abstraction layer. Reverting means removing the profile system and hardcoding variant-specific logic. Application code would need variant checks scattered throughout.
