#include <stdio.h>
#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "xvf3800_i2c.h"

// HW-B4 verification after XMOS firmware upgrade to v1.0.7.
// 1. Confirm firmware identity via resource 48 command 0 (expect 1.0.7).
// 2. Poll resource 20 command 19 (DOA_VALUE): status + 4 bytes,
//    uint16 LE [azimuth_deg 0-359][speech_detected 0/1].
// A known-good GPO transaction guards the measurement methodology.
void app_main(void) {
    printf("Pericles firmware starting\n");
    vTaskDelay(pdMS_TO_TICKS(1000));

    printf("[XVF] DoA verify: SDA=GPIO%d SCL=GPIO%d @%dkHz\n",
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

    // Firmware identity after the DFU upgrade.
    {
        uint8_t b[4];
        xvf_err_t e = xvf3800_servicer_read_split(&ctrl, 48, 0x80, 4, b, 4);
        if (e == XVF_OK && b[0] == 0x00)
            printf("[XVF] FW VER r48c0: %u.%u.%u\n", b[1], b[2], b[3]);
        else
            printf("[XVF] FW VER read failed: err=%d st=%02X\n", e,
                   e == XVF_OK ? b[0] : 0xFF);
    }

    // Activate an LED effect: resource 20 command 12 (write-only, invisible
    // to read scans), payload = effect id. The Seeed DoA wiki calls
    // write_led_effect(4) during setup; on this firmware generation the
    // DOA_VALUE register only updates while an LED effect is running.
    {
        uint8_t effect = 4;
        xvf_err_t e = xvf3800_servicer_write(&ctrl, 20, 12, &effect, 1);
        printf("[XVF] LED EFFECT set(4): err=%d\n", e);
        vTaskDelay(pdMS_TO_TICKS(500));
    }

    // DOA_VALUE poll: r20 c19, reply = status + 2x uint16 LE.
    printf("[XVF] DOA POLL START (speak/move around the array)\n");
    for (int i = 0; i < 150; i++) {
        uint8_t b[5];
        xvf_err_t e = xvf3800_servicer_read_split(&ctrl, 20, 19 | 0x80, 5,
                                                  b, 5);
        vTaskDelay(pdMS_TO_TICKS(200));
        if (e != XVF_OK) {
            printf("[XVF] DOA err=%d\n", e);
            continue;
        }
        if (b[0] != 0x00) {
            printf("[XVF] DOA st=%02X\n", b[0]);
            continue;
        }
        uint16_t azimuth = (uint16_t)b[1] | ((uint16_t)b[2] << 8);
        uint16_t speech = (uint16_t)b[3] | ((uint16_t)b[4] << 8);
        printf("[XVF] DOA azimuth=%03u speech=%u\n", azimuth, speech);
    }

    printf("[XVF] DOA POLL DONE\n");
    printf("Ready\n");
}
