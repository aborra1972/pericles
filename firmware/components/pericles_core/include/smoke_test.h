#pragma once

#include "pericles_core.h"
#include "xvf3800_i2s.h"
#include "xvf3800_i2c.h"
#include "xvf3800_diag.h"
#include "peripherals.h"
#include "xvf3800_dfu.h"
#include <stdint.h>
#include <stdbool.h>

// Smoke Test Results
typedef enum {
    SMOKE_PASS = 0,
    SMOKE_FAIL = 1,
    SMOKE_SKIP = 2,  // Hardware not present
} smoke_result_t;

typedef struct {
    const char *name;
    smoke_result_t result;
    const char *message;
} smoke_test_t;

typedef struct {
    smoke_test_t display;
    smoke_test_t buttons;
    smoke_test_t audio_i2s;
    smoke_test_t audio_i2c;
    smoke_test_t vad;
    smoke_test_t doa;
    smoke_test_t codec;
    smoke_test_t mute;
    smoke_test_t ws2812;
    smoke_test_t wifi;
    smoke_test_t ble;
    smoke_test_t xvf_dfu;
    smoke_test_t manifest;
    uint8_t passed;
    uint8_t failed;
    uint8_t skipped;
    uint8_t total;
} smoke_report_t;

// Initialize smoke test report
void smoke_report_init(smoke_report_t *report);

// Run all ReSpeaker smoke tests
void smoke_run_all(smoke_report_t *report);

// Individual tests
smoke_result_t smoke_test_display(void);
smoke_result_t smoke_test_buttons(void);
smoke_result_t smoke_test_audio_i2s(void);
smoke_result_t smoke_test_audio_i2c(void);
smoke_result_t smoke_test_vad(void);
smoke_result_t smoke_test_doa(void);
smoke_result_t smoke_test_codec(void);
smoke_result_t smoke_test_mute(void);
smoke_result_t smoke_test_ws2812(void);
smoke_result_t smoke_test_wifi(void);
smoke_result_t smoke_test_ble(void);
smoke_result_t smoke_test_xvf_dfu(void);
smoke_result_t smoke_test_manifest(void);

// Print report to console
void smoke_report_print(smoke_report_t *report);

// Check if all tests passed
bool smoke_report_all_passed(smoke_report_t *report);
