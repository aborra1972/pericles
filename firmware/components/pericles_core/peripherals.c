#include "peripherals.h"
#include <string.h>

// === Codec Implementation ===

pericles_err_t codec_init(codec_handle_t *codec) {
    if (!codec) return PERICLES_ERR_INVALID_ARG;
    
    memset(codec, 0, sizeof(codec_handle_t));
    codec->i2c_port = 1;
    codec->amp_enable_pin = 2;
    codec->initialized = true;
    codec->muted = false;
    codec->volume = 50;
    
    // In production: i2c_write to configure TLV320AIC3104
    return PERICLES_OK;
}

pericles_err_t codec_set_volume(codec_handle_t *codec, uint8_t volume) {
    if (!codec) return PERICLES_ERR_INVALID_ARG;
    if (volume > 100) volume = 100;
    
    codec->volume = volume;
    // In production: i2c_write to TLV320AIC3104 volume register
    return PERICLES_OK;
}

pericles_err_t codec_set_mute(codec_handle_t *codec, bool mute) {
    if (!codec) return PERICLES_ERR_INVALID_ARG;
    
    codec->muted = mute;
    // In production: i2c_write to TLV320AIC3104 mute register
    return PERICLES_OK;
}

pericles_err_t codec_set_amp_enable(codec_handle_t *codec, bool enable) {
    if (!codec) return PERICLES_ERR_INVALID_ARG;
    
    // In production: gpio_set_level(codec->amp_enable_pin, enable ? 1 : 0)
    return PERICLES_OK;
}

// === WS2812 Implementation ===

pericles_err_t ws2812_init(ws2812_handle_t *strip) {
    if (!strip) return PERICLES_ERR_INVALID_ARG;
    
    memset(strip, 0, sizeof(ws2812_handle_t));
    strip->gpio = WS2812_GPIO;
    strip->count = WS2812_MAX_LEDS;
    strip->brightness = 128;  // 50%
    strip->initialized = true;
    
    // In production: rmt_driver_install(), rmt_config(), etc.
    return PERICLES_OK;
}

pericles_err_t ws2812_set_pixel(ws2812_handle_t *strip, int index, led_rgb_t color) {
    if (!strip || !strip->initialized) return PERICLES_ERR_INVALID_ARG;
    if (index < 0 || index >= strip->count) return PERICLES_ERR_INVALID_ARG;
    
    strip->colors[index] = color;
    return PERICLES_OK;
}

pericles_err_t ws2812_fill(ws2812_handle_t *strip, led_rgb_t color) {
    if (!strip || !strip->initialized) return PERICLES_ERR_INVALID_ARG;
    
    for (int i = 0; i < strip->count; i++) {
        strip->colors[i] = color;
    }
    return PERICLES_OK;
}

pericles_err_t ws2812_update(ws2812_handle_t *strip) {
    if (!strip || !strip->initialized) return PERICLES_ERR_INVALID_ARG;
    
    // In production: rmt_write_sample(), etc.
    return PERICLES_OK;
}

pericles_err_t ws2812_set_brightness(ws2812_handle_t *strip, uint8_t brightness) {
    if (!strip) return PERICLES_ERR_INVALID_ARG;
    
    strip->brightness = brightness;
    return PERICLES_OK;
}

pericles_err_t ws2812_clear(ws2812_handle_t *strip) {
    if (!strip) return PERICLES_ERR_INVALID_ARG;
    
    return ws2812_fill(strip, (led_rgb_t){0, 0, 0});
}

// === Preset Patterns ===

pericles_err_t ws2812_status_solid(ws2812_handle_t *strip, led_rgb_t color) {
    return ws2812_fill(strip, color);
}

pericles_err_t ws2812_status_breathing(ws2812_handle_t *strip, led_rgb_t color, uint32_t period_ms) {
    if (!strip) return PERICLES_ERR_INVALID_ARG;
    
    // In production: use a timer to modulate brightness
    // For now, just set the color
    return ws2812_fill(strip, color);
}

pericles_err_t ws2812_status_spinning(ws2812_handle_t *strip, led_rgb_t color) {
    if (!strip) return PERICLES_ERR_INVALID_ARG;
    
    // In production: use a timer to rotate the color
    // For now, set first LED only
    ws2812_clear(strip);
    return ws2812_set_pixel(strip, 0, color);
}
