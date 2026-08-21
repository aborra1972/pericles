#pragma once

#include "xvf3800_common.h"

// XVF3800 I2C Control Interface
// Wiring verified against Seeed Studio wiki (ReSpeaker XVF3800 + XIAO):
//   https://wiki.seeedstudio.com/respeaker_xvf3800_agora_convo_client/
//   I2C: SDA=GPIO5, SCL=GPIO6 | I2S: BCLK=GPIO8, WS=GPIO7, DIN=GPIO43, DOUT=GPIO44
// XMOS control address 0x2C confirmed by Seeed-Projects/ESP32S3_reSpeaker_agora.
#define XVF3800_I2C_ADDR_DEFAULT 0x2C
#define XVF3800_I2C_ADDR_ALT     0x3C
#define XVF3800_AIC3104_ADDR     0x18   // TLV320AIC3104 codec on the same bus
#define XVF3800_I2C_SDA_GPIO     5
#define XVF3800_I2C_SCL_GPIO     6
#define XVF3800_I2C_FREQ_HZ      400000

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
    int i2c_addr;      // resolved 7-bit address of the responding control device (0 = none)
    bool initialized;
    bool bus_owner;    // true if this instance created the shared master bus
    uint16_t version;
    uint8_t status;
    void *bus_handle;  // i2c_master_bus_handle_t
    void *dev_handle;  // i2c_master_dev_handle_t
};

// Initialize I2C control: brings up the shared master bus, probes candidate
// addresses and binds a device handle. Returns XVF_ERR_NOT_FOUND when no
// candidate address acknowledges (the bus stays usable for bus_scan).
xvf_err_t xvf3800_control_init(xvf3800_control_t *ctrl);

// Probe the full 7-bit address space (0x08..0x77) and store acknowledging
// addresses. Returns the number of devices found, or -1 on missing bus.
int xvf3800_i2c_bus_scan(const xvf3800_control_t *ctrl, uint8_t *found, int max_found);

// Read 16-bit register (big-endian register address, big-endian value)
xvf_err_t xvf3800_read_reg(xvf3800_control_t *ctrl, uint16_t reg, uint16_t *value);

// Write 16-bit register
xvf_err_t xvf3800_write_reg(xvf3800_control_t *ctrl, uint16_t reg, uint16_t value);

// Read firmware version
xvf_err_t xvf3800_get_version(xvf3800_control_t *ctrl, uint16_t *version);

// Read device status
xvf_err_t xvf3800_get_status(xvf3800_control_t *ctrl, uint8_t *status);

// Reset device
xvf_err_t xvf3800_reset(xvf3800_control_t *ctrl);

// ---- XMOS servicer protocol (Seeed wiki documented framing) ----
// Write phase: [resid, cmd|0x80 for reads, payload_len] then repeated-START
// read of (payload_len) bytes where the first byte is the status.
#define XVF3800_SERVICER_GPO_RESID        20  // GPIO output servicer
#define XVF3800_SERVICER_GPO_WRITE_VALUE   1  // cmd: write GPO values
#define XVF3800_SERVICER_IO_CONFIG_RESID  36  // IO configuration servicer
#define XVF3800_SERVICER_GPI_READ_VALUES   6  // cmd: read all GPI inputs

// XMOS GPO pin functions on the ReSpeaker carrier
#define XVF3800_GPO_MUTE_LED_MIC   30  // high = mic muted (+ mute LED)
#define XVF3800_GPO_AMP_ENABLE     31  // low = amplifier enabled
#define XVF3800_GPO_WS2812_POWER   33  // high = WS2812 rail on

// Servicer command IDs (Seeed wiki / XMOS IO_CONFIG resource 36, GPO resource 20)
#define XVF3800_SERVICER_GPO_VALUE_ALL  0  // GPO_READ_VALUES (read flag |0x80)
#define XVF3800_SERVICER_GPI_VALUE_ALL  6  // GPI_VALUE_ALL: [status][u32 LE]

// Generic XMOS servicer transaction: transmit [resid, cmd, len] then
// repeated-START read of rx_len bytes. Returns transport status only;
// protocol-level status arrives inside rx[0] (framing under calibration).
xvf_err_t xvf3800_servicer_read(xvf3800_control_t *ctrl,
                                uint8_t resid, uint8_t cmd,
                                uint8_t *rx, size_t rx_len);

// Split-transaction variant: transmit header ending in STOP, then a plain
// receive. Matches Seeed wiki read_gpo_values/read_gpi_values shape.
xvf_err_t xvf3800_servicer_read_split(xvf3800_control_t *ctrl,
                                      uint8_t resid, uint8_t cmd,
                                      uint8_t len_byte,
                                      uint8_t *rx, size_t rx_len);

// Write a GPO pin (Seeed wiki muteMic pattern): [20, 1, 2, {pin, value}].
xvf_err_t xvf3800_gpo_write(xvf3800_control_t *ctrl,
                            uint8_t pin, uint8_t value);

// Read the combined GPIO status register (Seeed readGPIOStatus pattern):
// [36, 6, 1] -> [status][u32 LE] where bit N = port N state (bit 9 = mute
// button X1D09, bit 30 = mute LED/mic control).
xvf_err_t xvf3800_gpio_status_read(xvf3800_control_t *ctrl,
                                   uint32_t *gpio_status);

// Read one TLV320AIC3104 codec register (8-bit addressing) at 0x18 on the
// shared bus. Uses a transient device handle; safe at low frequencies.
xvf_err_t xvf3800_codec_read_reg(xvf3800_control_t *ctrl,
                                 uint8_t reg, uint8_t *val);

// Read all GPI input bits (legacy framing kept for reference diagnostics).
xvf_err_t xvf3800_gpi_read_all(xvf3800_control_t *ctrl,
                               uint8_t gpi[3], uint8_t *status);
