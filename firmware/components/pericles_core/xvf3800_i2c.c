#include "xvf3800_i2c.h"
#include <string.h>

// Mock I2C driver for compilation without hardware
// In production, replace with real esp-idf i2c driver calls

xvf_err_t xvf3800_control_init(xvf3800_control_t *ctrl) {
    if (!ctrl) return XVF_ERR_I2C;
    
    memset(ctrl, 0, sizeof(xvf3800_control_t));
    ctrl->i2c_port = 1;
    ctrl->i2c_addr = XVF3800_I2C_ADDR_DEFAULT;
    ctrl->initialized = true;
    ctrl->version = 0;
    ctrl->status = 0;
    
    // In production: i2s_driver_install(), i2s_set_pin(), etc.
    return XVF_OK;
}

xvf_err_t xvf3800_read_reg(xvf3800_control_t *ctrl, uint16_t reg, uint16_t *value) {
    if (!ctrl || !value) return XVF_ERR_I2C;
    if (!ctrl->initialized) return XVF_ERR_I2C;
    
    // In production: i2c_master_write_read_device()
    // Mock: return register values
    switch (reg) {
        case XVF_CMD_VERSION:
            *value = 0x0380;  // v3.8.0
            break;
        case XVF_CMD_STATUS:
            *value = 0x0001;  // ready
            break;
        case XVF_CMD_VAD:
            *value = 0x0000;  // no speech
            break;
        case XVF_CMD_DOA:
            *value = 0x0000;  // 0 degrees
            break;
        case XVF_CMD_MUTE:
            *value = 0x0000;  // unmuted
            break;
        case XVF_CMD_VOLUME:
            *value = 0x0080;  // 50%
            break;
        default:
            *value = 0x0000;
            break;
    }
    
    return XVF_OK;
}

xvf_err_t xvf3800_write_reg(xvf3800_control_t *ctrl, uint16_t reg, uint16_t value) {
    if (!ctrl) return XVF_ERR_I2C;
    if (!ctrl->initialized) return XVF_ERR_I2C;
    
    // In production: i2c_master_write_device()
    // Mock: accept all writes
    return XVF_OK;
}

xvf_err_t xvf3800_get_version(xvf3800_control_t *ctrl, uint16_t *version) {
    if (!ctrl || !version) return XVF_ERR_I2C;
    
    return xvf3800_read_reg(ctrl, XVF_CMD_VERSION, version);
}

xvf_err_t xvf3800_get_status(xvf3800_control_t *ctrl, uint8_t *status) {
    if (!ctrl || !status) return XVF_ERR_I2C;
    
    uint16_t val;
    xvf_err_t err = xvf3800_read_reg(ctrl, XVF_CMD_STATUS, &val);
    if (err == XVF_OK) {
        *status = (uint8_t)(val & 0xFF);
    }
    return err;
}

xvf_err_t xvf3800_reset(xvf3800_control_t *ctrl) {
    if (!ctrl) return XVF_ERR_I2C;
    
    return xvf3800_write_reg(ctrl, XVF_CMD_RESET, 0x0001);
}
