#include "pericles_core.h"
#include <string.h>

pericles_err_t wifi_init(wifi_handle_t *wifi, int max_retries) {
    if (!wifi) return PERICLES_ERR_INVALID_ARG;
    
    wifi->state = WIFI_STATE_DISCONNECTED;
    wifi->retry_count = 0;
    wifi->max_retries = max_retries;
    wifi->backoff_ms = 1000;
    memset(wifi->ssid, 0, sizeof(wifi->ssid));
    
    return PERICLES_OK;
}

pericles_err_t wifi_connect(wifi_handle_t *wifi, const char *ssid, const char *password) {
    if (!wifi || !ssid) return PERICLES_ERR_INVALID_ARG;
    
    strncpy(wifi->ssid, ssid, sizeof(wifi->ssid) - 1);
    wifi->state = WIFI_STATE_CONNECTING;
    // In real code: esp_wifi_set_config() + esp_wifi_connect()
    return PERICLES_OK;
}

pericles_err_t wifi_on_connected(wifi_handle_t *wifi) {
    if (!wifi) return PERICLES_ERR_INVALID_ARG;
    wifi->state = WIFI_STATE_CONNECTED;
    wifi->retry_count = 0;
    return PERICLES_OK;
}

pericles_err_t wifi_on_disconnected(wifi_handle_t *wifi) {
    if (!wifi) return PERICLES_ERR_INVALID_ARG;
    
    wifi->retry_count++;
    if (wifi->retry_count >= wifi->max_retries) {
        wifi->state = WIFI_STATE_FAILED;
        return PERICLES_ERR_TIMEOUT;
    }
    
    wifi->state = WIFI_STATE_CONNECTING;
    wifi->backoff_ms *= 2;  // exponential backoff
    return PERICLES_OK;
}

pericles_err_t wifi_get_state(wifi_handle_t *wifi, wifi_state_t *state) {
    if (!wifi || !state) return PERICLES_ERR_INVALID_ARG;
    *state = wifi->state;
    return PERICLES_OK;
}
