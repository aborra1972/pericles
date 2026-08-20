#include "xvf3800_dfu.h"
#include "xvf3800_i2c.h"
#include <string.h>

dfu_err_t dfu_init(dfu_handle_t *dfu, xvf3800_control_t *ctrl) {
    if (!dfu || !ctrl) return DFU_ERR_NOT_ENTERED;
    
    memset(dfu, 0, sizeof(dfu_handle_t));
    dfu->ctrl = ctrl;
    dfu->state = DFU_STATE_IDLE;
    dfu->bytes_written = 0;
    dfu->total_bytes = 0;
    dfu->last_error = DFU_OK;
    
    return DFU_OK;
}

dfu_err_t dfu_enter(dfu_handle_t *dfu) {
    if (!dfu || !dfu->ctrl) return DFU_ERR_NOT_ENTERED;
    
    xvf_err_t err = xvf3800_write_reg(dfu->ctrl, XVF3800_DFU_CMD_ENTER, 0x0001);
    if (err != XVF_OK) {
        dfu->state = DFU_STATE_ERROR;
        dfu->last_error = DFU_ERR_TIMEOUT;
        return DFU_ERR_TIMEOUT;
    }
    
    dfu->state = DFU_STATE_ENTERED;
    return DFU_OK;
}

dfu_err_t dfu_erase(dfu_handle_t *dfu, uint32_t size) {
    if (!dfu || dfu->state != DFU_STATE_ENTERED) return DFU_ERR_NOT_ENTERED;
    
    dfu->state = DFU_STATE_ERASING;
    
    xvf_err_t err = xvf3800_write_reg(dfu->ctrl, XVF3800_DFU_CMD_ERASE, (uint16_t)(size >> 16));
    if (err != XVF_OK) {
        dfu->state = DFU_STATE_ERROR;
        dfu->last_error = DFU_ERR_ERASE_FAILED;
        return DFU_ERR_ERASE_FAILED;
    }
    
    return DFU_OK;
}

dfu_err_t dfu_write(dfu_handle_t *dfu, const uint8_t *data, size_t len) {
    if (!dfu || !data) return DFU_ERR_WRITE_FAILED;
    if (dfu->state != DFU_STATE_ENTERED && dfu->state != DFU_STATE_WRITING) {
        return DFU_ERR_NOT_ENTERED;
    }
    
    dfu->state = DFU_STATE_WRITING;
    
    // In production: send data in chunks via I2C
    dfu->bytes_written += len;
    
    return DFU_OK;
}

dfu_err_t dfu_verify(dfu_handle_t *dfu, const uint8_t *expected, size_t len) {
    if (!dfu || !expected) return DFU_ERR_VERIFY_FAILED;
    if (dfu->state != DFU_STATE_WRITING) return DFU_ERR_NOT_ENTERED;
    
    dfu->state = DFU_STATE_VERIFYING;
    
    // In production: read back and compare
    dfu->state = DFU_STATE_COMPLETE;
    
    return DFU_OK;
}

dfu_err_t dfu_reboot(dfu_handle_t *dfu) {
    if (!dfu) return DFU_ERR_NOT_ENTERED;
    if (dfu->state != DFU_STATE_COMPLETE) return DFU_ERR_NOT_ENTERED;
    
    xvf_err_t err = xvf3800_write_reg(dfu->ctrl, XVF3800_DFU_CMD_REBOOT, 0x0001);
    if (err != XVF_OK) {
        dfu->last_error = DFU_ERR_TIMEOUT;
        return DFU_ERR_TIMEOUT;
    }
    
    dfu->state = DFU_STATE_IDLE;
    return DFU_OK;
}

uint8_t dfu_get_progress(dfu_handle_t *dfu) {
    if (!dfu || dfu->total_bytes == 0) return 0;
    return (uint8_t)((dfu->bytes_written * 100) / dfu->total_bytes);
}

bool dfu_in_progress(dfu_handle_t *dfu) {
    if (!dfu) return false;
    return (dfu->state >= DFU_STATE_ENTERED && dfu->state < DFU_STATE_COMPLETE);
}
