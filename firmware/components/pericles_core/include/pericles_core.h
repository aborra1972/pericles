#pragma once

#include <stdbool.h>
#include <stdint.h>

typedef enum {
    PERICLES_OK = 0,
    PERICLES_ERR_INVALID_ARG = -1,
    PERICLES_ERR_INVALID_JSON = -2,
    PERICLES_ERR_MISSING_FIELD = -3,
    PERICLES_ERR_TIMEOUT = -4,
    PERICLES_ERR_NOT_FOUND = -5,
} pericles_err_t;

typedef struct {
    char id[32];
    char name[64];
    char chip[32];
    int flash_mb;
    int psram_mb;
    int cpu_mhz;
    bool wifi;
    bool ble;
    bool usb;
    int display_width;
    int display_height;
    int button_count;
    int led_count;
} manifest_t;

// === Manifest ===
void pericles_core_init(void);
pericles_err_t pericles_manifest_validate(const char *json_str, manifest_t *out);

// === Debounce ===
typedef struct {
    uint32_t debounce_ms;
    uint32_t last_change_time;
    bool last_state;
    bool stable_state;
    uint32_t current_time;
} debounce_state_t;

void debounce_init(debounce_state_t *state, uint32_t debounce_ms);
bool debounce_check(debounce_state_t *state, bool raw_input);
void debounce_advance_time(debounce_state_t *state, uint32_t ms);

// === Session ===
typedef enum {
    SESSION_IDLE = 0,
    SESSION_LISTENING = 1,
    SESSION_SPEAKING = 2,
    SESSION_THINKING = 3,
} session_type_t;

typedef struct {
    session_type_t state;
    uint32_t session_id;
} session_state_t;

void session_init(session_state_t *session);
void session_on_action_button(session_state_t *session);
void session_on_response_ready(session_state_t *session);
void session_on_response_complete(session_state_t *session);
void session_on_timeout(session_state_t *session);

// === Timeout ===
typedef struct {
    uint32_t timeout_ms;
    uint32_t start_time;
    bool running;
    uint32_t current_time;
} timeout_state_t;

void timeout_init(timeout_state_t *timeout, uint32_t timeout_ms);
void timeout_start(timeout_state_t *timeout);
void timeout_stop(timeout_state_t *timeout);
void timeout_reset(timeout_state_t *timeout);
void timeout_advance(timeout_state_t *timeout, uint32_t ms);
bool timeout_expired(timeout_state_t *timeout);

// === Display ===
typedef enum {
    DISPLAY_STATE_OFF = 0,
    DISPLAY_STATE_ON = 1,
    DISPLAY_STATE_LOW_POWER = 2,
} display_state_t;

typedef struct {
    int width;
    int height;
    int backlight_pin;
    display_state_t state;
    uint8_t brightness;
} display_handle_t;

pericles_err_t display_init(display_handle_t *disp, int width, int height, int backlight_pin);
pericles_err_t display_set_backlight(display_handle_t *disp, uint8_t brightness);
pericles_err_t display_power(display_handle_t *disp, display_state_t state);

// === Audio ===
typedef enum {
    AUDIO_MODE_IDLE = 0,
    AUDIO_MODE_CAPTURING = 1,
    AUDIO_MODE_PLAYING = 2,
} audio_mode_t;

typedef struct {
    int sample_rate;
    int channels;
    int bits_per_sample;
    audio_mode_t mode;
    int buffer_size;
} audio_handle_t;

pericles_err_t audio_init(audio_handle_t *audio, int sample_rate, int channels, int bits);
pericles_err_t audio_start_capture(audio_handle_t *audio);
pericles_err_t audio_stop_capture(audio_handle_t *audio);
pericles_err_t audio_start_playback(audio_handle_t *audio);
pericles_err_t audio_stop_playback(audio_handle_t *audio);

// === WiFi ===
typedef enum {
    WIFI_STATE_DISCONNECTED = 0,
    WIFI_STATE_CONNECTING = 1,
    WIFI_STATE_CONNECTED = 2,
    WIFI_STATE_FAILED = 3,
} wifi_state_t;

typedef struct {
    wifi_state_t state;
    char ssid[33];
    int retry_count;
    int max_retries;
    uint32_t backoff_ms;
} wifi_handle_t;

pericles_err_t wifi_init(wifi_handle_t *wifi, int max_retries);
pericles_err_t wifi_connect(wifi_handle_t *wifi, const char *ssid, const char *password);
pericles_err_t wifi_on_connected(wifi_handle_t *wifi);
pericles_err_t wifi_on_disconnected(wifi_handle_t *wifi);
pericles_err_t wifi_get_state(wifi_handle_t *wifi, wifi_state_t *state);

// === BLE ===
typedef enum {
    BLE_STATE_OFF = 0,
    BLE_STATE_ADVERTISING = 1,
    BLE_STATE_CONNECTED = 2,
    BLE_STATE_PAIRING = 3,
} ble_state_t;

typedef struct {
    ble_state_t state;
    char device_name[32];
    int pin;
    bool paired;
} ble_handle_t;

pericles_err_t ble_init(ble_handle_t *ble, const char *device_name);
pericles_err_t ble_start_advertising(ble_handle_t *ble);
pericles_err_t ble_on_connected(ble_handle_t *ble);
pericles_err_t ble_on_pairing_complete(ble_handle_t *ble, bool success);
pericles_err_t ble_stop(ble_handle_t *ble);
