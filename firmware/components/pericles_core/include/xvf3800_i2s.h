#pragma once

#include "xvf3800_common.h"
#include <stddef.h>
#include <stdint.h>

// XVF3800 I2S audio link (wiring verified against Seeed wiki + board docs):
//   BCLK=GPIO8, WS=GPIO7, DOUT(XIAO->XVF)=GPIO44, DIN(XIAO<-XVF)=GPIO43
// The XVF3800 INT variant runs as I2S slave with 32-bit slots (XMOS
// programming guide, Table 2.1; Seeed reference uses AUDIO_I2S_BITS=32).
#define XVF3800_I2S_SAMPLE_RATE      16000
#define XVF3800_I2S_BITS_PER_SAMPLE  32
#define XVF3800_I2S_BCLK_GPIO        8
#define XVF3800_I2S_WS_GPIO          7
#define XVF3800_I2S_DOUT_GPIO        44
#define XVF3800_I2S_DIN_GPIO         43

// Initialize the I2S standard-mode full-duplex link (controller role):
// TX drives the XVF3800 DAC input, RX captures the processed mic stream.
xvf_err_t xvf3800_i2s_init(void);

// Blocking write of interleaved stereo 32-bit samples.
xvf_err_t xvf3800_i2s_write(const int32_t *samples, size_t sample_count);

// Blocking read of interleaved stereo 32-bit samples captured from the
// XVF3800 (left = processed beam, right = raw mic by default). sample_count
// counts int32 slots, so a stereo frame pair consumes 2 slots.
xvf_err_t xvf3800_i2s_read(int32_t *samples, size_t sample_count);

// Disable and free both channels.
xvf_err_t xvf3800_i2s_deinit(void);
