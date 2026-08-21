#include "smoke_test.h"
#include "pericles_core.h"
#include <stdio.h>
#include <string.h>

smoke_result_t smoke_test_display(void) {
    display_handle_t display;
    pericles_err_t err = display_init(&display, 240, 240, 4);
    if (err != PERICLES_OK) return SMOKE_FAIL;
    
    err = display_set_backlight(&display, 50);
    if (err != PERICLES_OK) return SMOKE_FAIL;
    
    err = display_power(&display, DISPLAY_STATE_ON);
    if (err != PERICLES_OK) return SMOKE_FAIL;
    
    return SMOKE_PASS;
}

smoke_result_t smoke_test_buttons(void) {
    debounce_state_t action_btn, mute_btn;
    
    debounce_init(&action_btn, 50);
    debounce_init(&mute_btn, 50);
    
    // Simulate a press
    bool stable = debounce_check(&action_btn, true);
    if (!stable) return SMOKE_FAIL;
    
    stable = debounce_check(&mute_btn, true);
    if (!stable) return SMOKE_FAIL;
    
    return SMOKE_PASS;
}

smoke_result_t smoke_test_audio_i2s(void) {
    xvf_err_t err = xvf3800_i2s_init();
    if (err != XVF_OK) return SMOKE_FAIL;

    int16_t silence[256] = { 0 };
    err = xvf3800_i2s_write(silence, 256);

    xvf3800_i2s_deinit();
    if (err != XVF_OK) return SMOKE_FAIL;

    return SMOKE_PASS;
}

smoke_result_t smoke_test_audio_i2c(void) {
    xvf3800_control_t ctrl;
    xvf_err_t err = xvf3800_control_init(&ctrl);
    if (err != XVF_OK) return SMOKE_FAIL;
    
    uint16_t version;
    err = xvf3800_get_version(&ctrl, &version);
    if (err != XVF_OK) return SMOKE_FAIL;
    
    uint8_t status;
    err = xvf3800_get_status(&ctrl, &status);
    if (err != XVF_OK) return SMOKE_FAIL;
    
    return SMOKE_PASS;
}

smoke_result_t smoke_test_vad(void) {
    xvf3800_control_t ctrl;
    xvf3800_control_init(&ctrl);
    
    xvf_diagnostics_t diag;
    xvf_diag_init(&diag, &ctrl);
    
    xvf_err_t err = xvf_diag_update_vad(&diag);
    if (err != XVF_OK) return SMOKE_FAIL;
    
    // VAD result is valid regardless of speech state
    return SMOKE_PASS;
}

smoke_result_t smoke_test_doa(void) {
    xvf3800_control_t ctrl;
    xvf3800_control_init(&ctrl);
    
    xvf_diagnostics_t diag;
    xvf_diag_init(&diag, &ctrl);
    
    xvf_err_t err = xvf_diag_update_doa(&diag);
    if (err != XVF_OK) return SMOKE_FAIL;
    
    int16_t direction = xvf_diag_get_direction(&diag);
    if (direction < 0 || direction >= 360) return SMOKE_FAIL;
    
    return SMOKE_PASS;
}

smoke_result_t smoke_test_codec(void) {
    codec_handle_t codec;
    pericles_err_t err = codec_init(&codec);
    if (err != PERICLES_OK) return SMOKE_FAIL;
    
    err = codec_set_volume(&codec, 50);
    if (err != PERICLES_OK) return SMOKE_FAIL;
    
    err = codec_set_amp_enable(&codec, true);
    if (err != PERICLES_OK) return SMOKE_FAIL;
    
    return SMOKE_PASS;
}

smoke_result_t smoke_test_mute(void) {
    codec_handle_t codec;
    codec_init(&codec);
    
    pericles_err_t err = codec_set_mute(&codec, true);
    if (err != PERICLES_OK) return SMOKE_FAIL;
    
    err = codec_set_mute(&codec, false);
    if (err != PERICLES_OK) return SMOKE_FAIL;
    
    return SMOKE_PASS;
}

smoke_result_t smoke_test_ws2812(void) {
    ws2812_handle_t strip;
    pericles_err_t err = ws2812_init(&strip);
    if (err != PERICLES_OK) return SMOKE_FAIL;
    
    err = ws2812_fill(&strip, (led_rgb_t){255, 0, 0});
    if (err != PERICLES_OK) return SMOKE_FAIL;
    
    err = ws2812_update(&strip);
    if (err != PERICLES_OK) return SMOKE_FAIL;
    
    err = ws2812_clear(&strip);
    if (err != PERICLES_OK) return SMOKE_FAIL;
    
    return SMOKE_PASS;
}

smoke_result_t smoke_test_wifi(void) {
    wifi_handle_t wifi;
    pericles_err_t err = wifi_init(&wifi, 3);
    if (err != PERICLES_OK) return SMOKE_FAIL;
    
    // WiFi init succeeded (won't actually connect in mock)
    return SMOKE_PASS;
}

smoke_result_t smoke_test_ble(void) {
    ble_handle_t ble;
    pericles_err_t err = ble_init(&ble, "Pericles-Test");
    if (err != PERICLES_OK) return SMOKE_FAIL;
    
    ble_stop(&ble);
    return SMOKE_PASS;
}

smoke_result_t smoke_test_xvf_dfu(void) {
    xvf3800_control_t ctrl;
    xvf3800_control_init(&ctrl);
    
    dfu_handle_t dfu;
    dfu_err_t err = dfu_init(&dfu, &ctrl);
    if (err != DFU_OK) return SMOKE_FAIL;
    
    if (dfu_in_progress(&dfu)) return SMOKE_FAIL;
    
    return SMOKE_PASS;
}

smoke_result_t smoke_test_manifest(void) {
    // Test with ReSpeaker profile
    const char *profile = "{\"variant\":\"respeaker\",\"flash_mb\":8,\"psram_mb\":8}";
    manifest_t manifest;
    pericles_err_t err = pericles_manifest_validate(profile, &manifest);
    
    if (err != PERICLES_OK) return SMOKE_FAIL;
    if (strcmp(manifest.chip, "esp32s3") != 0) return SMOKE_FAIL;
    
    return SMOKE_PASS;
}

void smoke_report_init(smoke_report_t *report) {
    if (!report) return;
    memset(report, 0, sizeof(smoke_report_t));
    report->total = 13;
}

void smoke_run_all(smoke_report_t *report) {
    if (!report) return;
    
    smoke_report_init(report);
    
    report->display.name = "Display (GC9A01)";
    report->display.result = smoke_test_display();
    
    report->buttons.name = "Buttons (Action + Mute)";
    report->buttons.result = smoke_test_buttons();
    
    report->audio_i2s.name = "Audio I2S (XVF3800 capture)";
    report->audio_i2s.result = smoke_test_audio_i2s();
    
    report->audio_i2c.name = "Audio I2C (XVF3800 control)";
    report->audio_i2c.result = smoke_test_audio_i2c();
    
    report->vad.name = "VAD (Voice Activity)";
    report->vad.result = smoke_test_vad();
    
    report->doa.name = "DoA (Direction of Arrival)";
    report->doa.result = smoke_test_doa();
    
    report->codec.name = "Codec (TLV320AIC3104)";
    report->codec.result = smoke_test_codec();
    
    report->mute.name = "Mute Control";
    report->mute.result = smoke_test_mute();
    
    report->ws2812.name = "WS2812 LEDs";
    report->ws2812.result = smoke_test_ws2812();
    
    report->wifi.name = "WiFi";
    report->wifi.result = smoke_test_wifi();
    
    report->ble.name = "BLE";
    report->ble.result = smoke_test_ble();
    
    report->xvf_dfu.name = "XVF3800 DFU";
    report->xvf_dfu.result = smoke_test_xvf_dfu();
    
    report->manifest.name = "Manifest (ReSpeaker)";
    report->manifest.result = smoke_test_manifest();
    
    // Count results
    smoke_test_t *tests[] = {
        &report->display, &report->buttons, &report->audio_i2s, &report->audio_i2c,
        &report->vad, &report->doa, &report->codec, &report->mute,
        &report->ws2812, &report->wifi, &report->ble, &report->xvf_dfu, &report->manifest
    };
    
    for (int i = 0; i < 13; i++) {
        switch (tests[i]->result) {
            case SMOKE_PASS: report->passed++; break;
            case SMOKE_FAIL: report->failed++; break;
            case SMOKE_SKIP: report->skipped++; break;
        }
    }
}

void smoke_report_print(smoke_report_t *report) {
    if (!report) return;
    
    printf("\n=== ReSpeaker Smoke Test Report ===\n\n");
    
    smoke_test_t *tests[] = {
        &report->display, &report->buttons, &report->audio_i2s, &report->audio_i2c,
        &report->vad, &report->doa, &report->codec, &report->mute,
        &report->ws2812, &report->wifi, &report->ble, &report->xvf_dfu, &report->manifest
    };
    
    for (int i = 0; i < 13; i++) {
        const char *icon = "?";
        switch (tests[i]->result) {
            case SMOKE_PASS: icon = "✅"; break;
            case SMOKE_FAIL: icon = "❌"; break;
            case SMOKE_SKIP: icon = "⏭️"; break;
        }
        printf("%s %s\n", icon, tests[i]->name);
    }
    
    printf("\n--- Summary ---\n");
    printf("Passed:  %d/%d\n", report->passed, report->total);
    printf("Failed:  %d\n", report->failed);
    printf("Skipped: %d\n", report->skipped);
    
    if (report->failed == 0) {
        printf("\n🎉 ALL TESTS PASSED\n");
    } else {
        printf("\n⚠️  SOME TESTS FAILED\n");
    }
    printf("\n");
}

bool smoke_report_all_passed(smoke_report_t *report) {
    if (!report) return false;
    return report->failed == 0 && report->passed == report->total;
}
