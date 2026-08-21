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

        // Calibration: the known-good GPO transaction must still return
        // st=00 + five pin states. Guards the scan methodology.
        {
            uint8_t b[6];
            xvf_err_t e = xvf3800_servicer_read_split(&ctrl, 20, 0x80, 6,
                                                      b, 6);
            printf("[XVF] CALIB r20 c80 l6: err=%d st=%02X pins=%02X %02X "
                   "%02X %02X %02X\n",
                   e, b[0], b[1], b[2], b[3], b[4], b[5]);
        }

        // HW-B4 diagnosis: map resource 20's entire command space on THIS
        // firmware. Per command, try plausible reply lengths; a clean
        // 10 ms pace avoids the response-backlog misattribution seen in
        // earlier flood scans.
        {
            static const int lens[] = { 2, 3, 4, 5, 6, 9, 17 };
            printf("[XVF] R20 CMD MAP:\n");
            for (int cmd = 0; cmd < 32; cmd++) {
                int best_st = 0xFF, best_len = 0;
                uint8_t bb[17];
                for (unsigned li = 0;
                     li < sizeof(lens) / sizeof(lens[0]); li++) {
                    int len = lens[li];
                    uint8_t b[17];
                    xvf_err_t e = xvf3800_servicer_read_split(&ctrl, 20,
                                                              cmd | 0x80,
                                                              len, b, len);
                    vTaskDelay(pdMS_TO_TICKS(10));
                    if (e != XVF_OK) continue;
                    uint8_t st = b[0];
                    if (st == 0x00) {
                        int echo = len >= 3 && b[1] == (cmd | 0x80) &&
                                   b[2] == len;
                        if (!echo) {
                            printf("[XVF]   c%02X l%02X OK:", cmd, len);
                            for (int k = 1; k < len; k++)
                                printf(" %02X", b[k]);
                            printf("\n");
                        }
                        if (best_st != 0x00 || len > best_len) {
                            memcpy(bb, b, len);
                            best_len = len;
                        }
                        best_st = 0x00;
                    } else if (best_st != 0x00 &&
                               (best_st == 0xFF || st == 0x42)) {
                        best_st = st;
                    }
                }
                if (best_st != 0x00)
                    printf("[XVF]   c%02X: no valid len (st=%02X)\n", cmd,
                           best_st);
            }

            // Firmware identity: version triplet + build strings.
            {
                uint8_t b[33];
                if (xvf3800_servicer_read_split(&ctrl, 48, 0x80, 4,
                                                b, 4) == XVF_OK)
                    printf("[XVF] FW VER r48c0: %02X %02X %02X\n",
                           b[1], b[2], b[3]);
                if (xvf3800_servicer_read_split(&ctrl, 48, 5 | 0x80, 33,
                                                b, 33) == XVF_OK &&
                    b[0] == 0x00) {
                    printf("[XVF] FW STR r48c5:");
                    for (int k = 1; k < 33; k++) printf(" %02X", b[k]);
                    printf("\n");
                }
            }
        }
        printf("[XVF] SCAN DONE\n");
    } else {
        printf("[XVF] Control init result: err=%d (%s)\n", err,
               err == XVF_ERR_NOT_FOUND ? "no candidate address ACKed"
                                        : "I2C setup error");
    }

    printf("Ready\n");
}
