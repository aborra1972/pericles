#include "pericles_core.h"
#include <stdio.h>
#include <string.h>
#include "cJSON.h"

#define MAX_MANIFEST_SIZE 4096

static const char *TAG = "pericles_core";

pericles_err_t pericles_manifest_validate(const char *json_str, manifest_t *out) {
    if (!json_str || !out) {
        return PERICLES_ERR_INVALID_ARG;
    }

    cJSON *root = cJSON_Parse(json_str);
    if (!root) {
        return PERICLES_ERR_INVALID_JSON;
    }

    memset(out, 0, sizeof(manifest_t));

    // Required fields
    cJSON *id = cJSON_GetObjectItem(root, "id");
    if (!cJSON_IsString(id)) {
        cJSON_Delete(root);
        return PERICLES_ERR_MISSING_FIELD;
    }
    strncpy(out->id, id->valuestring, sizeof(out->id) - 1);

    cJSON *name = cJSON_GetObjectItem(root, "name");
    if (cJSON_IsString(name)) {
        strncpy(out->name, name->valuestring, sizeof(out->name) - 1);
    }

    // MCU section
    cJSON *mcu = cJSON_GetObjectItem(root, "mcu");
    if (mcu) {
        cJSON *chip = cJSON_GetObjectItem(mcu, "chip");
        if (cJSON_IsString(chip)) {
            strncpy(out->chip, chip->valuestring, sizeof(out->chip) - 1);
        }
        cJSON *flash = cJSON_GetObjectItem(mcu, "flash_mb");
        if (cJSON_IsNumber(flash)) {
            out->flash_mb = flash->valueint;
        }
        cJSON *psram = cJSON_GetObjectItem(mcu, "psram_mb");
        if (cJSON_IsNumber(psram)) {
            out->psram_mb = psram->valueint;
        }
        cJSON *cpu = cJSON_GetObjectItem(mcu, "cpu_mhz");
        if (cJSON_IsNumber(cpu)) {
            out->cpu_mhz = cpu->valueint;
        }
    }

    // Connectivity
    cJSON *conn = cJSON_GetObjectItem(root, "connectivity");
    if (conn) {
        cJSON *wifi = cJSON_GetObjectItem(conn, "wifi");
        out->wifi = cJSON_IsTrue(wifi);
        cJSON *ble = cJSON_GetObjectItem(conn, "ble");
        out->ble = cJSON_IsTrue(ble);
        cJSON *usb = cJSON_GetObjectItem(conn, "usb");
        out->usb = cJSON_IsTrue(usb);
    }

    // Display
    cJSON *disp = cJSON_GetObjectItem(root, "display");
    if (disp) {
        cJSON *w = cJSON_GetObjectItem(disp, "width");
        if (cJSON_IsNumber(w)) out->display_width = w->valueint;
        cJSON *h = cJSON_GetObjectItem(disp, "height");
        if (cJSON_IsNumber(h)) out->display_height = h->valueint;
    }

    // Count buttons
    cJSON *buttons = cJSON_GetObjectItem(root, "buttons");
    if (buttons) {
        out->button_count = cJSON_GetArraySize(buttons);
    }

    // LEDs
    cJSON *leds = cJSON_GetObjectItem(root, "leds");
    if (leds) {
        cJSON *count = cJSON_GetObjectItem(leds, "count");
        if (cJSON_IsNumber(count)) out->led_count = count->valueint;
    }

    cJSON_Delete(root);
    return PERICLES_OK;
}
