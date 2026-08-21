#include <stdio.h>
#include <string.h>
#include <math.h>
#include "driver/gpio.h"
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

        // Line-ownership diagnostic: with the I2S peripheral OFF, are the
        // I2S lines driven by the XMOS (master) or idle/floating (slave)?
        printf("[XVF] LINE OWNERSHIP PROBE (I2S off, pulldowns on):\n");
        {
            gpio_config_t in_cfg = {
                .pin_bit_mask = (1ULL << XVF3800_I2S_BCLK_GPIO) |
                                (1ULL << XVF3800_I2S_WS_GPIO) |
                                (1ULL << XVF3800_I2S_DIN_GPIO),
                .mode = GPIO_MODE_INPUT,
                .pull_down_en = true,
            };
            gpio_config(&in_cfg);
            const int n = 200000;
            long hb = 0, hw = 0, hd = 0;
            for (int i = 0; i < n; i++) {
                hb += gpio_get_level(XVF3800_I2S_BCLK_GPIO);
                hw += gpio_get_level(XVF3800_I2S_WS_GPIO);
                hd += gpio_get_level(XVF3800_I2S_DIN_GPIO);
            }
            printf("[XVF]   bclk high=%ld%% ws high=%ld%% din high=%ld%%\n",
                   hb * 100 / n, hw * 100 / n, hd * 100 / n);
        }

        // The XMOS gates several outputs on mute (RGB data, likely the
        // host I2S stream too). Force unmute before probing RX.
        {
            uint8_t st[6];
            if (xvf3800_servicer_read_split(&ctrl, 20, 0x80, 6,
                                            st, 6) == XVF_OK) {
                printf("[XVF] pre-RX mute state: x0d30=%02X\n", st[2]);
                if (st[2] != 0) {
                    xvf3800_gpo_write(&ctrl, XVF3800_GPO_MUTE_LED_MIC, 0);
                    vTaskDelay(pdMS_TO_TICKS(300));
                    printf("[XVF] wrote UNMUTE before RX probe\n");
                }
            }
        }

        // B2 duplex test, part 1: short 440 Hz tone to confirm TX still
        // works with the full-duplex channel pair.
        printf("[XVF] TONE TEST: 440Hz ~5s - LISTEN\n");
        if (xvf3800_i2s_init() == XVF_OK) {
            const int rate = XVF3800_I2S_SAMPLE_RATE;
            static int32_t frame[64];  // 32 interleaved stereo frames
            for (int sec = 0; sec < 5; sec++) {
                for (int i = 0; i < rate; i += 32) {
                    for (int j = 0; j < 32; j++) {
                        float phase = 2.0f * 3.14159265f * 440.0f *
                                      ((i + j) / (float)rate);
                        int32_t s = (int32_t)(268435456.0f * sinf(phase));
                        frame[j * 2] = s;
                        frame[j * 2 + 1] = s;
                    }
                    xvf3800_i2s_write(frame, 64);
                }
                printf("[XVF] tone: %ds\n", sec + 1);
            }

            // B2 duplex test, part 2: capture the processed mic stream.
            // First 5 s: stay quiet (baseline). Then talk / clap near the
            // device for the remaining seconds.
            printf("[XVF] RX PROBE: quiet 5s, then TALK/CLAP ~7s\n");
            static int32_t buf[512];  // 256 stereo frames
            double sumsq_l = 0, sumsq_r = 0;
            int64_t peak_l = 0, peak_r = 0;
            long n_l = 0, n_r = 0;
            int frames_left = 8;  // hex-dump budget (first second)
            for (int sec = 0; sec < 12; sec++) {
                long consumed = 0;
                while (consumed < rate) {
                    if (xvf3800_i2s_read(buf, 512) != XVF_OK) break;
                    int frames = 512 / 2;
                    for (int i = 0; i < frames; i++) {
                        int64_t l = buf[i * 2], r = buf[i * 2 + 1];
                        sumsq_l += (double)l * l;
                        sumsq_r += (double)r * r;
                        if (l < 0) l = -l;
                        if (r < 0) r = -r;
                        if (l > peak_l) peak_l = l;
                        if (r > peak_r) peak_r = r;
                    }
                    n_l += frames;
                    n_r += frames;
                    consumed += frames;
                    if (frames_left > 0 && sec == 0) {
                        for (int i = 0; i < 4 && frames_left > 0; i++)
                            { printf("[XVF] rx[%d]=%11ld %11ld\n",
                                     8 - frames_left,
                                     (long)buf[i * 2],
                                     (long)buf[i * 2 + 1]);
                              frames_left--; }
                    }
                }
                double rms_l = n_l ? sqrt(sumsq_l / n_l) : 0.0;
                double rms_r = n_r ? sqrt(sumsq_r / n_r) : 0.0;
                printf("[XVF] rx %2ds: rmsL=%9.1f rmsR=%9.1f "
                       "peakL=%7ld peakR=%7ld\n",
                       sec + 1, rms_l, rms_r,
                       (long)peak_l, (long)peak_r);
                sumsq_l = sumsq_r = 0; peak_l = peak_r = 0;
                n_l = n_r = 0;
            }
            xvf3800_i2s_deinit();
            printf("[XVF] DUPLEX TEST END\n");
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
