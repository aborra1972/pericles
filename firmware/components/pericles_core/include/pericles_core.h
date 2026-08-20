#pragma once

#include <stdbool.h>

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

void pericles_core_init(void);
pericles_err_t pericles_manifest_validate(const char *json_str, manifest_t *out);
