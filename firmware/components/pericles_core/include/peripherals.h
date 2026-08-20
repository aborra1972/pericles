#pragma once

#include "pericles_core.h"
#include <stdint.h>
#include <stdbool.h>

// TLV320AIC3104 Codec Configuration
#define CODEC_I2C_ADDR 0x18

// WS2812 LED Configuration
#define WS2812_MAX_LEDS     12
#define WS2812_GPIO         38
#define WS2812_RMT_CHANNEL  0

typedef enum {
    LED_COLOR_OFF = 0x000000,
    LED_COLOR_RED = 0xFF0000,
    LED_COLOR_GREEN = 0x00FF00,
    LED_COLOR_BLUE = 0x0000FF,
    LED_COLOR_YELLOW = 0xFFFF00,
    LED_COLOR_CYAN = 0x00FFFF,
    LED_COLOR_MAGENTA = 0xFF00FF,
    LED_COLOR_WHITE = 0xFFFFFF,
} led_color_t;

typedef struct {
    uint8_t r;
    uint8_t g;
    uint8_t b;
} led_rgb_t;

typedef struct {
    int i2c_port;
    int amp_enable_pin;
    bool initialized;
    bool muted;
    uint8_t volume;
} codec_handle_t;

typedef struct {
    int gpio;
    int count;
    led_rgb_t colors[WS2812_MAX_LEDS];
    uint8_t brightness;  // 0-255
    bool initialized;
} ws2812_handle_t;

// === Codec Functions ===

// Initialize TLV320AIC3104 codec
pericles_err_t codec_init(codec_handle_t *codec);

// Set volume (0-100)
pericles_err_t codec_set_volume(codec_handle_t *codec, uint8_t volume);

// Mute/unmute
pericles_err_t codec_set_mute(codec_handle_t *codec, bool mute);

// Enable/disable amplifier
pericles_err_t codec_set_amp_enable(codec_handle_t *codec, bool enable);

// === WS2812 Functions ===

// Initialize WS2812 LED strip
pericles_err_t ws2812_init(ws2812_handle_t *strip);

// Set color of single LED
pericles_err_t ws2812_set_pixel(ws2812_handle_t *strip, int index, led_rgb_t color);

// Set all LEDs to same color
pericles_err_t ws2812_fill(ws2812_handle_t *strip, led_rgb_t color);

// Update LEDs (push data)
pericles_err_t ws2812_update(ws2812_handle_t *strip);

// Set brightness (0-255)
pericles_err_t ws2812_set_brightness(ws2812_handle_t *strip, uint8_t brightness);

// Clear all LEDs
pericles_err_t ws2812_clear(ws2812_handle_t *strip);

// === Preset Patterns ===

// Status pattern: solid color
pericles_err_t ws2812_status_solid(ws2812_handle_t *strip, led_rgb_t color);

// Status pattern: breathing effect
pericles_err_t ws2812_status_breathing(ws2812_handle_t *strip, led_rgb_t color, uint32_t period_ms);

// Status pattern: spinning
pericles_err_t ws2812_status_spinning(ws2812_handle_t *strip, led_rgb_t color);
