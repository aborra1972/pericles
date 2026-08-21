#include <stdio.h>
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

        // Real command-level transaction: read GPI inputs (mute button etc.)
        // through the XMOS IO_CONFIG servicer. X1D09 reads high when the
        // mute button is released.
        uint8_t gpi[3];
        uint8_t status = 0xFF;
        if (xvf3800_gpi_read_all(&ctrl, gpi, &status) == XVF_OK) {
            uint32_t bits = ((uint32_t)gpi[2] << 16) |
                            ((uint32_t)gpi[1] << 8) | gpi[0];
            printf("[XVF] GPI read: status=0x%02X raw=0x%06lX "
                   "(mute btn %s)\n",
                   status, (unsigned long)bits,
                   (bits >> 9) & 1 ? "released" : "pressed");
        } else {
            printf("[XVF] GPI read FAILED (bus error)\n");
        }
    } else {
        printf("[XVF] Control init result: err=%d (%s)\n", err,
               err == XVF_ERR_NOT_FOUND ? "no candidate address ACKed"
                                        : "I2C setup error");
    }

    printf("Ready\n");
}
