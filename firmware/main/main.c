#include <stdio.h>
#include <string.h>
#include <math.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "xvf3800_i2c.h"
#include "xvf3800_i2s.h"

// HW-B3 bring-up: real I2C bus scan + control transaction evidence.
// Per docs/hardware/respeaker-pinout.md reset sequence, allow the XVF3800
// ~1s to boot before touching the control bus.
void app_main(void) {
    printf("Pericles firmware starting\n");
    vTaskDelay(pdMS_TO_TICKS(1000));

    printf("[XVF] I2C bring-up: SDA=GPIO%d SCL=GPIO%d @%dkHz\n",
           XVF3800_I2C_SDA_GPIO, XVF3800_I2C_SCL_GPIO,
           XVF3800_I2C_FREQ_HZ / 1000);

    xvf3800_control_t ctrl;
    xvf_err_t err = xvf3800_control_init(&ctrl);

    // Bus scan runs regardless of whether a candidate address answered;
    // it is the primary bring-up evidence (which devices ACK on the wire).
    uint8_t devs[8];
    int found = xvf3800_i2c_bus_scan(&ctrl, devs, 8);
    if (found >= 0) {
        printf("[XVF] Bus scan: %d device(s) ACK:", found);
        for (int i = 0; i < found; i++) {
            printf(" 0x%02X", devs[i]);
        }
        printf("\n");
    } else {
        printf("[XVF] Bus scan unavailable (no bus)\n");
    }

    if (err == XVF_OK) {
        printf("[XVF] Control device ACK at 0x%02X\n", ctrl.i2c_addr);

        // Codec probe: read a few AIC3104 registers at 0x18 (page 0).
        printf("[XVF] CODEC PROBE @0x18:\n");
        const char *names[] = { "page", "reset", "ovr_cur", "clkgen" };
        uint8_t regs[] = { 0x00, 0x01, 0x02, 0x03 };
        for (int i = 0; i < 4; i++) {
            uint8_t v = 0xFF;
            if (xvf3800_codec_read_reg(&ctrl, regs[i], &v) == XVF_OK)
                printf("[XVF]   reg %02X (%s) = %02X\n", regs[i], names[i], v);
            else
                printf("[XVF]   reg %02X (%s) READ FAILED\n",
                       regs[i], names[i]);
        }

        // B2 tone test: 440 Hz sine on I2S TX (GPIO44 -> XVF3800), which
        // the XMOS routes to the AIC3104 codec and amplifier. Unmistakable
        // continuous tone on headphones or speaker.
        printf("[XVF] TONE TEST: 440Hz ~30s - LISTEN\n");
        if (xvf3800_i2s_init() == XVF_OK) {
            const int rate = XVF3800_I2S_SAMPLE_RATE;
            static int16_t frame[64];  // 32 interleaved stereo frames
            for (int sec = 0; sec < 30; sec++) {
                for (int i = 0; i < rate; i += 32) {
                    for (int j = 0; j < 32; j++) {
                        float phase = 2.0f * 3.14159265f * 440.0f *
                                      ((i + j) / (float)rate);
                        int16_t s = (int16_t)(8000.0f * sinf(phase));
                        frame[j * 2] = s;
                        frame[j * 2 + 1] = s;
                    }
                    xvf3800_i2s_write(frame, 64);
                }
                printf("[XVF] tone: %ds\n", sec + 1);
            }
            xvf3800_i2s_deinit();
            printf("[XVF] TONE TEST END\n");
        } else {
            printf("[XVF] I2S INIT FAILED\n");
        }
    } else {
        printf("[XVF] Control init result: err=%d (%s)\n", err,
               err == XVF_ERR_NOT_FOUND ? "no candidate address ACKed"
                                        : "I2C setup error");
    }

    printf("Ready\n");
}
