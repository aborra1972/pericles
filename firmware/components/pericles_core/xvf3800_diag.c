#include "xvf3800_diag.h"
#include "xvf3800_i2c.h"
#include <string.h>

void xvf_diag_init(xvf_diagnostics_t *diag, xvf3800_control_t *ctrl) {
    if (!diag) return;
    
    memset(diag, 0, sizeof(xvf_diagnostics_t));
    diag->ctrl = ctrl;
    diag->vad.threshold = XVF3800_VAD_THRESHOLD_DEFAULT;
    diag->doa.angle_degrees = XVF3800_DOA_UNKNOWN;
}

xvf_err_t xvf_diag_update_vad(xvf_diagnostics_t *diag) {
    if (!diag || !diag->ctrl) return XVF_ERR_I2C;
    
    uint16_t vad_raw;
    xvf_err_t err = xvf3800_read_reg(diag->ctrl, XVF_CMD_VAD, &vad_raw);
    if (err != XVF_OK) return err;
    
    // Convert raw value to speech probability (0.0 - 1.0)
    float probability = (float)vad_raw / 65535.0f;
    
    diag->vad.energy_level = probability;
    diag->vad.speech_detected = (probability >= diag->vad.threshold);
    
    if (diag->vad.speech_detected) {
        diag->vad.last_speech_time = diag->vad.current_time;
    }
    
    return XVF_OK;
}

xvf_err_t xvf_diag_update_doa(xvf_diagnostics_t *diag) {
    if (!diag || !diag->ctrl) return XVF_ERR_I2C;
    
    uint16_t doa_raw;
    xvf_err_t err = xvf3800_read_reg(diag->ctrl, XVF_CMD_DOA, &doa_raw);
    if (err != XVF_OK) return err;
    
    // Convert raw value to degrees (0-359)
    diag->doa.angle_degrees = (int16_t)(doa_raw & 0x01FF);  // 9-bit angle
    diag->doa.valid = (diag->doa.angle_degrees >= 0 && diag->doa.angle_degrees < 360);
    diag->doa.confidence = (uint8_t)((doa_raw >> 9) & 0x7F);  // 7-bit confidence
    
    return XVF_OK;
}

bool xvf_diag_speech_active(xvf_diagnostics_t *diag) {
    if (!diag) return false;
    return diag->vad.speech_detected;
}

int16_t xvf_diag_get_direction(xvf_diagnostics_t *diag) {
    if (!diag || !diag->doa.valid) return XVF3800_DOA_UNKNOWN;
    return diag->doa.angle_degrees;
}

void xvf_diag_set_vad_threshold(xvf_diagnostics_t *diag, float threshold) {
    if (!diag) return;
    diag->vad.threshold = threshold;
}

void xvf_diag_advance_time(xvf_diagnostics_t *diag, uint32_t ms) {
    if (!diag) return;
    diag->vad.current_time += ms;
}
