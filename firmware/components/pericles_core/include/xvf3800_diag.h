#pragma once

#include "xvf3800_common.h"

// VAD (Voice Activity Detection) Configuration
#define XVF3800_VAD_THRESHOLD_DEFAULT 0.5f
#define XVF3800_VAD_TIMEOUT_MS        2000

// DoA (Direction of Arrival) Configuration
#define XVF3800_DOA_UNKNOWN           -1
#define XVF3800_DOA_FRONT             0
#define XVF3800_DOA_RIGHT             90
#define XVF3800_DOA_BACK              180
#define XVF3800_DOA_LEFT              270

typedef struct {
    bool speech_detected;
    float energy_level;
    uint32_t last_speech_time;
    uint32_t current_time;
    float threshold;
} vad_state_t;

typedef struct {
    int16_t angle_degrees;
    bool valid;
    uint8_t confidence;
} doa_state_t;

typedef struct {
    vad_state_t vad;
    doa_state_t doa;
    xvf3800_control_t *ctrl;
} xvf_diagnostics_t;

// Initialize diagnostics
void xvf_diag_init(xvf_diagnostics_t *diag, xvf3800_control_t *ctrl);

// Update VAD state from XVF3800 registers
xvf_err_t xvf_diag_update_vad(xvf_diagnostics_t *diag);

// Update DoA state from XVF3800 registers
xvf_err_t xvf_diag_update_doa(xvf_diagnostics_t *diag);

// Check if speech is active
bool xvf_diag_speech_active(xvf_diagnostics_t *diag);

// Get direction of arrival (degrees)
int16_t xvf_diag_get_direction(xvf_diagnostics_t *diag);

// Set VAD threshold
void xvf_diag_set_vad_threshold(xvf_diagnostics_t *diag, float threshold);

// Advance time (for simulation/testing)
void xvf_diag_advance_time(xvf_diagnostics_t *diag, uint32_t ms);
