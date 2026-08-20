#pragma once

#include "xvf3800_common.h"

// XVF3800 I2S Configuration
#define XVF3800_I2S_SAMPLE_RATE     16000
#define XVF3800_I2S_BITS_PER_SAMPLE 16
#define XVF3800_I2S_CHANNELS        1  // Mono output (processed)
#define XVF3800_I2S_BUFFER_SIZE     4096

// XVF3800 I2C Register Map
#define XVF3800_REG_VERSION         0x0000
#define XVF3800_REG_STATUS          0x0001
#define XVF3800_REG_VAD             0x0002
#define XVF3800_REG_DOA             0x0003
#define XVF3800_REG_MUTE            0x0004
#define XVF3800_REG_VOLUME          0x0005

typedef struct {
    int i2c_port;
    int i2c_addr;
    int i2s_bck;
    int i2s_ws;
    int i2s_data_in;
    int i2s_data_out;
    bool initialized;
    uint16_t version;
} xvf3800_handle_t;

// Initialize XVF3800 I2S interface
xvf_err_t xvf3800_init(xvf3800_handle_t *handle);

// Start audio capture
xvf_err_t xvf3800_start_capture(xvf3800_handle_t *handle);

// Stop audio capture
xvf_err_t xvf3800_stop_capture(xvf3800_handle_t *handle);

// Read audio buffer (non-blocking)
xvf_err_t xvf3800_read_audio(xvf3800_handle_t *handle, int16_t *buffer, size_t samples, size_t *read);

// Get processed audio level (RMS)
xvf_err_t xvf3800_get_audio_level(xvf3800_handle_t *handle, float *level_db);
