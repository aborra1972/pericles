#include <stdio.h>
#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "xvf3800_i2c.h"

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

        // Self-calibrating loop: toggle GPO30 by software (write path is
        // proven) and probe three split-transaction read framings, printing
        // any stream that reacts. If a framing's bytes track our own writes,
        // the read path is proven without human input.
        printf("[XVF] SELFTEST: toggling GPO30 + probing read framings\n");
        uint8_t level = 0;
        char last_a[24] = "", last_b[24] = "", last_c[24] = "";
        for (int i = 0; i < 60; i++) {  // 60 * 700ms ~= 42s
            level ^= 1;
            xvf_err_t w = xvf3800_gpo_write(&ctrl,
                                            XVF3800_GPO_MUTE_LED_MIC, level);
            vTaskDelay(pdMS_TO_TICKS(100));  // let XMOS latch before reads

            uint8_t rx[8];
            char cur[24];

            // A2: GPO_READ_VALUES, wiki example 1 shape [20, 0x80, 6] -> rx6
            if (xvf3800_servicer_read_split(&ctrl, 20, 0x80, 6,
                                            rx, 6) == XVF_OK)
                snprintf(cur, sizeof(cur), "%02X|%02X%02X%02X%02X%02X%02X",
                         level, rx[0], rx[1], rx[2], rx[3], rx[4], rx[5]);
            else
                snprintf(cur, sizeof(cur), "%02X|ERR", level);
            if (strcmp(cur, last_a) != 0) {
                printf("[XVF] A2 %s\n", cur);
                strcpy(last_a, cur);
            }

            // B2: GPI 3-byte values, wiki example 2 shape [36, 0x86, 4] -> rx4
            if (xvf3800_servicer_read_split(&ctrl, 36, 0x86, 4,
                                            rx, 4) == XVF_OK)
                snprintf(cur, sizeof(cur), "%02X|%02X %02X%02X%02X",
                         level, rx[0], rx[1], rx[2], rx[3]);
            else
                snprintf(cur, sizeof(cur), "%02X|ERR", level);
            if (strcmp(cur, last_b) != 0) {
                printf("[XVF] B2 %s\n", cur);
                strcpy(last_b, cur);
            }

            // C2: GPIO status u32, wiki example 3 shape [36, 6, 1] -> rx5
            if (xvf3800_servicer_read_split(&ctrl, 36, 6, 1,
                                            rx, 5) == XVF_OK)
                snprintf(cur, sizeof(cur), "%02X|%02X %02X%02X%02X%02X",
                         level, rx[0], rx[1], rx[2], rx[3], rx[4]);
            else
                snprintf(cur, sizeof(cur), "%02X|ERR", level);
            if (strcmp(cur, last_c) != 0) {
                printf("[XVF] C2 %s\n", cur);
                strcpy(last_c, cur);
            }

            vTaskDelay(pdMS_TO_TICKS(600));
        }
        printf("[XVF] SELFTEST END\n");
    } else {
        printf("[XVF] Control init result: err=%d (%s)\n", err,
               err == XVF_ERR_NOT_FOUND ? "no candidate address ACKed"
                                        : "I2C setup error");
    }

    printf("Ready\n");
}
