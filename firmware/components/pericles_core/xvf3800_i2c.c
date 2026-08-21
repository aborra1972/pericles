#include "xvf3800_i2c.h"
#include <string.h>
#include <stdio.h>
#include "driver/i2c_master.h"
#include "esp_err.h"

// Real I2C control transport for the XVF3800 (XMOS) over the shared bus on
// GPIO21/SDA + GPIO22/SCL per docs/hardware/respeaker-pinout.md.
//
// The register semantics of xvf_cmd_t come from the original skeleton and are
// still unverified against the XMOS control protocol; the transport below is
// real (probe/transmit/receive with propagated errors) so bring-up evidence is
// trustworthy: an ACK here means the wire answered, not a mock.

static i2c_master_bus_handle_t s_bus = NULL;

xvf_err_t xvf3800_control_init(xvf3800_control_t *ctrl) {
    if (!ctrl) return XVF_ERR_I2C;

    memset(ctrl, 0, sizeof(*ctrl));
    ctrl->i2c_port = 0;
    ctrl->i2c_addr = 0;

    if (s_bus == NULL) {
        static const int ports[] = { I2C_NUM_0, I2C_NUM_1 };
        for (size_t p = 0; p < sizeof(ports) / sizeof(ports[0]) && s_bus == NULL; p++) {
            i2c_master_bus_config_t bus_cfg = {
                .i2c_port = ports[p],
                .sda_io_num = XVF3800_I2C_SDA_GPIO,
                .scl_io_num = XVF3800_I2C_SCL_GPIO,
                .clk_source = I2C_CLK_SRC_DEFAULT,
                .glitch_ignore_cnt = 7,
                // ReSpeaker carrier may lack external pullups; enable internal
                // ones as fallback. Replace with explicit pulls if flaky.
                .flags.enable_internal_pullup = true,
            };
            esp_err_t berr = i2c_new_master_bus(&bus_cfg, &s_bus);
            if (berr != ESP_OK) {
                printf("[XVF] i2c_new_master_bus port %d failed: %s\n",
                       ports[p], esp_err_to_name(berr));
                s_bus = NULL;
            } else {
                ctrl->i2c_port = ports[p];
                ctrl->bus_owner = true;
            }
        }
        if (s_bus == NULL) {
            return XVF_ERR_I2C;
        }
    }
    ctrl->bus_handle = s_bus;

    static const uint8_t candidates[] = { XVF3800_I2C_ADDR_DEFAULT,
                                          XVF3800_I2C_ADDR_ALT };
    for (size_t i = 0; i < sizeof(candidates); i++) {
        if (i2c_master_probe(s_bus, candidates[i], 50) == ESP_OK) {
            ctrl->i2c_addr = candidates[i];
            break;
        }
    }
    if (ctrl->i2c_addr == 0) {
        return XVF_ERR_NOT_FOUND;
    }

    i2c_device_config_t dev_cfg = {
        .dev_addr_length = I2C_ADDR_BIT_LEN_7,
        .device_address = ctrl->i2c_addr,
        .scl_speed_hz = XVF3800_I2C_FREQ_HZ,
    };
    i2c_master_dev_handle_t dev = NULL;
    if (i2c_master_bus_add_device(s_bus, &dev_cfg, &dev) != ESP_OK) {
        return XVF_ERR_I2C;
    }
    ctrl->dev_handle = dev;
    ctrl->initialized = true;
    return XVF_OK;
}

int xvf3800_i2c_bus_scan(const xvf3800_control_t *ctrl, uint8_t *found, int max_found) {
    if (!ctrl || !ctrl->bus_handle || !found || max_found <= 0) return -1;

    int n = 0;
    for (uint8_t addr = 0x08; addr <= 0x77 && n < max_found; addr++) {
        if (i2c_master_probe((i2c_master_bus_handle_t)ctrl->bus_handle, addr, 20) == ESP_OK) {
            found[n++] = addr;
        }
    }
    return n;
}

xvf_err_t xvf3800_read_reg(xvf3800_control_t *ctrl, uint16_t reg, uint16_t *value) {
    if (!ctrl || !value || !ctrl->initialized || !ctrl->dev_handle) return XVF_ERR_I2C;

    uint8_t tx[2] = { (uint8_t)(reg >> 8), (uint8_t)(reg & 0xFF) };
    uint8_t rx[2] = { 0 };
    esp_err_t err = i2c_master_transmit_receive(
        (i2c_master_dev_handle_t)ctrl->dev_handle,
        tx, sizeof(tx), rx, sizeof(rx), 100);
    if (err != ESP_OK) return XVF_ERR_I2C;

    *value = (uint16_t)((rx[0] << 8) | rx[1]);
    return XVF_OK;
}

xvf_err_t xvf3800_write_reg(xvf3800_control_t *ctrl, uint16_t reg, uint16_t value) {
    if (!ctrl || !ctrl->initialized || !ctrl->dev_handle) return XVF_ERR_I2C;

    uint8_t tx[4] = { (uint8_t)(reg >> 8), (uint8_t)(reg & 0xFF),
                      (uint8_t)(value >> 8), (uint8_t)(value & 0xFF) };
    if (i2c_master_transmit((i2c_master_dev_handle_t)ctrl->dev_handle,
                            tx, sizeof(tx), 100) != ESP_OK) {
        return XVF_ERR_I2C;
    }
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

xvf_err_t xvf3800_gpi_read_all(xvf3800_control_t *ctrl,
                               uint8_t gpi[3], uint8_t *status) {
    if (!ctrl || !gpi || !status || !ctrl->initialized || !ctrl->dev_handle)
        return XVF_ERR_I2C;

    // Seeed wiki framing: [resid, cmd|0x80, len(incl. status byte)] with
    // repeated START into a read of len bytes: [status, payload...].
    uint8_t tx[3] = { XVF3800_SERVICER_IO_CONFIG_RESID,
                      (uint8_t)(XVF3800_SERVICER_GPI_READ_VALUES | 0x80),
                      4 };  // 3 payload bytes + 1 status byte
    uint8_t rx[4] = { 0 };
    esp_err_t err = i2c_master_transmit_receive(
        (i2c_master_dev_handle_t)ctrl->dev_handle,
        tx, sizeof(tx), rx, sizeof(rx), 100);
    if (err != ESP_OK) return XVF_ERR_I2C;

    *status = rx[0];
    gpi[0] = rx[1];
    gpi[1] = rx[2];
    gpi[2] = rx[3];
    return XVF_OK;
}
