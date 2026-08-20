#pragma once

#include "xvf3800_common.h"

// XVF3800 I2C Control Interface
#define XVF3800_I2C_ADDR_DEFAULT 0x3C

typedef enum {
    XVF_CMD_VERSION = 0x0000,
    XVF_CMD_STATUS = 0x0001,
    XVF_CMD_VAD = 0x0002,
    XVF_CMD_DOA = 0x0003,
    XVF_CMD_MUTE = 0x0004,
    XVF_CMD_VOLUME = 0x0005,
    XVF_CMD_CONFIG = 0x0010,
    XVF_CMD_RESET = 0x00FF,
} xvf_cmd_t;

struct xvf3800_control {
    int i2c_port;
    int i2c_addr;
    bool initialized;
    uint16_t version;
    uint8_t status;
};

// Initialize I2C control
xvf_err_t xvf3800_control_init(xvf3800_control_t *ctrl);

// Read 16-bit register
xvf_err_t xvf3800_read_reg(xvf3800_control_t *ctrl, uint16_t reg, uint16_t *value);

// Write 16-bit register
xvf_err_t xvf3800_write_reg(xvf3800_control_t *ctrl, uint16_t reg, uint16_t value);

// Read firmware version
xvf_err_t xvf3800_get_version(xvf3800_control_t *ctrl, uint16_t *version);

// Read device status
xvf_err_t xvf3800_get_status(xvf3800_control_t *ctrl, uint8_t *status);

// Reset device
xvf_err_t xvf3800_reset(xvf3800_control_t *ctrl);
