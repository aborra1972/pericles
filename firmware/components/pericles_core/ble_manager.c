#include "pericles_core.h"
#include <string.h>

pericles_err_t ble_init(ble_handle_t *ble, const char *device_name) {
    if (!ble || !device_name) return PERICLES_ERR_INVALID_ARG;
    
    ble->state = BLE_STATE_OFF;
    strncpy(ble->device_name, device_name, sizeof(ble->device_name) - 1);
    ble->pin = 0;
    ble->paired = false;
    
    return PERICLES_OK;
}

pericles_err_t ble_start_advertising(ble_handle_t *ble) {
    if (!ble) return PERICLES_ERR_INVALID_ARG;
    ble->state = BLE_STATE_ADVERTISING;
    return PERICLES_OK;
}

pericles_err_t ble_on_connected(ble_handle_t *ble) {
    if (!ble) return PERICLES_ERR_INVALID_ARG;
    ble->state = BLE_STATE_PAIRING;
    return PERICLES_OK;
}

pericles_err_t ble_on_pairing_complete(ble_handle_t *ble, bool success) {
    if (!ble) return PERICLES_ERR_INVALID_ARG;
    
    if (success) {
        ble->state = BLE_STATE_CONNECTED;
        ble->paired = true;
    } else {
        ble->state = BLE_STATE_ADVERTISING;
    }
    return PERICLES_OK;
}

pericles_err_t ble_stop(ble_handle_t *ble) {
    if (!ble) return PERICLES_ERR_INVALID_ARG;
    ble->state = BLE_STATE_OFF;
    return PERICLES_OK;
}
