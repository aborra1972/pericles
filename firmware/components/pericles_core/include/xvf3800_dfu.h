#pragma once

#include "xvf3800_common.h"

// XVF3800 DFU Commands
#define XVF3800_DFU_CMD_ENTER     0x0001
#define XVF3800_DFU_CMD_EXIT      0x0002
#define XVF3800_DFU_CMD_ERASE     0x0003
#define XVF3800_DFU_CMD_WRITE     0x0004
#define XVF3800_DFU_CMD_VERIFY    0x0005
#define XVF3800_DFU_CMD_REBOOT    0x0006

// DFU States
typedef enum {
    DFU_STATE_IDLE = 0,
    DFU_STATE_ENTERED = 1,
    DFU_STATE_ERASING = 2,
    DFU_STATE_WRITING = 3,
    DFU_STATE_VERIFYING = 4,
    DFU_STATE_COMPLETE = 5,
    DFU_STATE_ERROR = 6,
} dfu_state_t;

// DFU Error Codes
typedef enum {
    DFU_OK = 0,
    DFU_ERR_NOT_ENTERED = -1,
    DFU_ERR_ERASE_FAILED = -2,
    DFU_ERR_WRITE_FAILED = -3,
    DFU_ERR_VERIFY_FAILED = -4,
    DFU_ERR_TIMEOUT = -5,
    DFU_ERR_BUSY = -6,
} dfu_err_t;

typedef struct {
    dfu_state_t state;
    xvf3800_control_t *ctrl;
    uint32_t bytes_written;
    uint32_t total_bytes;
    dfu_err_t last_error;
} dfu_handle_t;

// Initialize DFU handler
dfu_err_t dfu_init(dfu_handle_t *dfu, xvf3800_control_t *ctrl);

// Enter DFU mode
dfu_err_t dfu_enter(dfu_handle_t *dfu);

// Erase firmware
dfu_err_t dfu_erase(dfu_handle_t *dfu, uint32_t size);

// Write firmware chunk
dfu_err_t dfu_write(dfu_handle_t *dfu, const uint8_t *data, size_t len);

// Verify firmware
dfu_err_t dfu_verify(dfu_handle_t *dfu, const uint8_t *expected, size_t len);

// Exit DFU and reboot
dfu_err_t dfu_reboot(dfu_handle_t *dfu);

// Get DFU progress (0-100)
uint8_t dfu_get_progress(dfu_handle_t *dfu);

// Check if DFU is in progress
bool dfu_in_progress(dfu_handle_t *dfu);
