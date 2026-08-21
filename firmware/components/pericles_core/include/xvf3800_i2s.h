#pragma once

#include "xvf3800_common.h"
#include <stddef.h>
#include <stdint.h>

// XVF3800 I2S audio link (wiring verified against Seeed wiki + board docs):
//   BCLK=GPIO8, WS=GPIO7, DOUT(XIAO->XVF)=GPIO44, DIN(XIAO<-XVF)=GPIO43
#define XVF3800_I2S_SAMPLE_RATE      16000
#define XVF3800_I2S_BITS_PER_SAMPLE  16
#define XVF3800_I2S_BCLK_GPIO        8
#define XVF3800_I2S_WS_GPIO          7
#define XVF3800_I2S_DOUT_GPIO        44
#define XVF3800_I2S_DIN_GPIO         43

// Initialize the I2S standard-mode TX channel (controller role).
xvf_err_t xvf3800_i2s_init(void);

// Blocking write of interleaved stereo 16-bit samples.
xvf_err_t xvf3800_i2s_write(const int16_t *samples, size_t sample_count);

// Disable and free the TX channel.
xvf_err_t xvf3800_i2s_deinit(void);
