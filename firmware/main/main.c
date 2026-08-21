#include <stdio.h>
#include <string.h>
#include <math.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "xvf3800_i2c.h"
#include "xvf3800_i2s.h"

// HW-B5 verification: output volume control for the ReSpeaker XVF3800.
// The Seeed AIC3104 servicer commands (r48 c11/c12) proved INERT on the
// i2s_dfu firmware variant: reads answer st=42 at every length and writes
// have no audible effect (see docs/DEVELOPMENT_PROGRESS.md 2026-08-21).
// Volume therefore lives HOST-SIDE: scale the I2S TX samples digitally.
// Mic mute stays on GPO X0D30 and WS2812 rail on X0D33 (both proven).

static volatile bool s_tone_run;
static volatile float s_amp_scale = 1.0f;  // host-side digital gain 0..1

static void tone_task(void *arg) {
    static int32_t frame[64];  // interleaved stereo slots, HW-B2 pattern
    const int rate = XVF3800_I2S_SAMPLE_RATE;
    int n = 0;
    while (s_tone_run) {
        for (int j = 0; j < 32; j++) {
            float phase = 2.0f * 3.14159265f * 440.0f *
                          ((n % rate) / (float)rate);
            int32_t s =
                (int32_t)(268435456.0f * s_amp_scale * sinf(phase));
            frame[j * 2] = s;
            frame[j * 2 + 1] = s;
            n++;
        }
        xvf3800_i2s_write(frame, 64);
    }
    vTaskDelete(NULL);
}

// Reply length accepted by the servicer for r48 c11 reads (strictly
// validated per command: wrong expected length answers st=42). 0 = unknown.
static uint8_t s_hp_read_len = 0;

static void report_level(xvf3800_control_t *ctrl, const char *name,
                         bool lineout) {
    uint8_t cmd = (lineout ? XVF3800_SERVICER_AIC3104_LINEOUT_LEVEL_CMD
                           : XVF3800_SERVICER_AIC3104_HP_LEVEL_CMD);
    uint8_t len = s_hp_read_len ? s_hp_read_len : 2;
    uint8_t b[8] = {0};
    xvf_err_t e = xvf3800_servicer_read_split(
        ctrl, XVF3800_SERVICER_APP_RESID, (uint8_t)(cmd | 0x80), len, b,
        len);
    printf("[XVF] %s read L=%u err=%d st=%02X pay=%02X %02X %02X %02X\n",
           name, len, e, b[0], b[1], b[2], b[3], b[4]);
}

static void gain_step(const char *what, float scale, int listen_ms) {
    s_amp_scale = scale;
    printf("[XVF] STEP %s -> gain %.2f (%d ms)\n", what, (double)scale,
           listen_ms);
    vTaskDelay(pdMS_TO_TICKS(listen_ms));
}

void app_main(void) {
    printf("Pericles firmware starting\n");
    vTaskDelay(pdMS_TO_TICKS(1000));

    printf("[XVF] HW-B5 codec-level verify: SDA=GPIO%d SCL=GPIO%d @%dkHz\n",
           XVF3800_I2C_SDA_GPIO, XVF3800_I2C_SCL_GPIO,
           XVF3800_I2C_FREQ_HZ / 1000);

    xvf3800_control_t ctrl;
    xvf_err_t err = xvf3800_control_init(&ctrl);

    if (err != XVF_OK) {
        printf("[XVF] Control init result: err=%d (%s)\n", err,
               err == XVF_ERR_NOT_FOUND ? "no candidate address ACKed"
                                        : "I2C setup error");
        printf("Ready\n");
        return;
    }

    printf("[XVF] Control device ACK at 0x%02X\n", ctrl.i2c_addr);

    // Methodology guard: the known-good GPO transaction must still
    // return st=00 + five pin states before any new claim is made.
    {
        uint8_t b[6];
        xvf_err_t e =
            xvf3800_servicer_read_split(&ctrl, 20, 0x80, 6, b, 6);
        printf("[XVF] CALIB r20 c80 l6: err=%d st=%02X pins=%02X %02X "
               "%02X %02X %02X\n",
               e, b[0], b[1], b[2], b[3], b[4], b[5]);
    }

    // Firmware identity (r48 c0 also proves the app servicer answers).
    {
        uint8_t b[4];
        xvf_err_t e = xvf3800_servicer_read_split(&ctrl, 48, 0x80, 4, b, 4);
        if (e == XVF_OK && b[0] == 0x00)
            printf("[XVF] FW VER r48c0: %u.%u.%u\n", b[1], b[2], b[3]);
        else
            printf("[XVF] FW VER read failed: err=%d st=%02X\n", e,
                   e == XVF_OK ? b[0] : 0xFF);
    }

    // Discover the reply length the servicer accepts for the codec-level
    // reads (the fixed guess of 2 answered st=42). First st=00 wins; also
    // sweep LINEOUT c12 to confirm whether it exists at all on this variant.
    {
        uint8_t best = 0;
        printf("[XVF] probing r48 c11/c12 reply lengths L=2..8\n");
        for (uint8_t L = 2; L <= 8 && !best; L++) {
            uint8_t b[8] = {0}, c[8] = {0};
            xvf_err_t e11 = xvf3800_servicer_read_split(
                &ctrl, XVF3800_SERVICER_APP_RESID,
                (uint8_t)(XVF3800_SERVICER_AIC3104_HP_LEVEL_CMD | 0x80),
                L, b, L);
            xvf_err_t e12 = xvf3800_servicer_read_split(
                &ctrl, XVF3800_SERVICER_APP_RESID,
                (uint8_t)(XVF3800_SERVICER_AIC3104_LINEOUT_LEVEL_CMD | 0x80),
                L, c, L);
            printf("[XVF]  L=%u c11 err=%d st=%02X pay=%02X %02X %02X | "
                   "c12 err=%d st=%02X\n",
                   L, e11, b[0], b[1], b[2], b[3], e12, c[0]);
            if (e11 == XVF_OK && b[0] == 0x00)
                best = L;
            vTaskDelay(pdMS_TO_TICKS(10));
        }
        s_hp_read_len = best;
        printf("[XVF] c11 working read length: %u\n", best);
    }

    // Mic mute gates several XMOS outputs; force unmute so the tone is
    // audible before judging codec levels (learned in HW-B2/B5 sessions).
    {
        uint8_t st[6];
        if (xvf3800_servicer_read_split(&ctrl, 20, 0x80, 6, st, 6) ==
            XVF_OK) {
            printf("[XVF] pre-test mute state: x0d30=%02X\n", st[2]);
            if (st[2] != 0) {
                xvf3800_gpo_write(&ctrl, XVF3800_GPO_MUTE_LED_MIC, 0);
                vTaskDelay(pdMS_TO_TICKS(300));
                printf("[XVF] wrote UNMUTE before test\n");
            }
        }
    }

    // Defaults before touching anything.
    report_level(&ctrl, "HP (jack)", false);
    report_level(&ctrl, "LINEOUT (JST)", true);

    if (xvf3800_i2s_init() != XVF_OK) {
        printf("[XVF] I2S INIT FAILED - aborting audio steps\n");
        printf("Ready\n");
        return;
    }
    s_tone_run = true;
    if (xTaskCreate(tone_task, "tone", 4096, NULL, 5, NULL) != pdPASS) {
        printf("[XVF] tone task create FAILED\n");
        xvf3800_i2s_deinit();
        printf("Ready\n");
        return;
    }
    printf("[XVF] TONE STARTED: continuous 440 Hz on the jack path\n");

    // Host-side digital volume proof: the operator confirms each step by
    // ear. Same gradient the XMOS commands failed to produce.
    gain_step("1 quieter", 0.25f, 6000);
    gain_step("2 loudest", 1.0f, 6000);
    gain_step("3 very-quiet", 0.08f, 5000);
    gain_step("4 SILENCE(mute)", 0.0f, 8000);
    gain_step("5 restore medium", 0.5f, 4000);
    printf("[XVF] LINEOUT/JST path: not controllable on i2s_dfu (st=41)\n");

    s_tone_run = false;
    vTaskDelay(pdMS_TO_TICKS(300));
    xvf3800_i2s_deinit();
    printf("[XVF] TONE STOPPED - HW-B5 sequence done\n");
    printf("Ready\n");
}
