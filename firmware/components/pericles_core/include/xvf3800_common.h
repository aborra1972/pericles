#pragma once

#include <stdint.h>
#include <stddef.h>
#include <stdbool.h>

typedef enum {
    XVF_OK = 0,
    XVF_ERR_I2C = -1,
    XVF_ERR_I2S = -2,
    XVF_ERR_TIMEOUT = -3,
    XVF_ERR_NOT_FOUND = -4,
} xvf_err_t;

// Forward declaration
typedef struct xvf3800_control xvf3800_control_t;
