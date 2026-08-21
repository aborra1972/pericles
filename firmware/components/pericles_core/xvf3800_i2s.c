#include "xvf3800_i2s.h"
#include "driver/i2s_std.h"
#include "freertos/FreeRTOS.h"

// Real I2S standard-mode full-duplex driver for the XVF3800 audio link.
// The ESP32-S3 is the I2S controller (the XVF3800 runs as I2S slave on
// this board - verified: host-generated clocks produce clean audio out).
//   TX: DOUT GPIO44 -> XVF3800 speaker path
//   RX: DIN  GPIO43 <- XVF3800 processed microphone stream

static i2s_chan_handle_t s_tx_chan = NULL;
static i2s_chan_handle_t s_rx_chan = NULL;

xvf_err_t xvf3800_i2s_init(void) {
    if (s_tx_chan) return XVF_OK;  // already initialized

    i2s_chan_config_t chan_cfg =
        I2S_CHANNEL_DEFAULT_CONFIG(I2S_NUM_0, I2S_ROLE_MASTER);
    chan_cfg.auto_clear = true;
    // Creating TX and RX in one call forms a full-duplex pair that shares
    // the BCLK/WS GPIOs instead of fighting over them.
    if (i2s_new_channel(&chan_cfg, &s_tx_chan, &s_rx_chan) != ESP_OK) {
        s_tx_chan = s_rx_chan = NULL;
        return XVF_ERR_I2S;
    }

    i2s_std_config_t std_cfg = {
        .clk_cfg = I2S_STD_CLK_DEFAULT_CONFIG(XVF3800_I2S_SAMPLE_RATE),
        .slot_cfg = I2S_STD_PHILIPS_SLOT_DEFAULT_CONFIG(
            I2S_DATA_BIT_WIDTH_32BIT, I2S_SLOT_MODE_STEREO),
        .gpio_cfg = {
            .mclk = I2S_GPIO_UNUSED,
            .bclk = XVF3800_I2S_BCLK_GPIO,
            .ws   = XVF3800_I2S_WS_GPIO,
            .dout = XVF3800_I2S_DOUT_GPIO,
            .din  = XVF3800_I2S_DIN_GPIO,
            .invert_flags = { false, false, false },
        },
    };
    if (i2s_channel_init_std_mode(s_tx_chan, &std_cfg) != ESP_OK ||
        i2s_channel_init_std_mode(s_rx_chan, &std_cfg) != ESP_OK ||
        i2s_channel_enable(s_tx_chan) != ESP_OK ||
        i2s_channel_enable(s_rx_chan) != ESP_OK) {
        if (s_tx_chan) i2s_del_channel(s_tx_chan);
        if (s_rx_chan) i2s_del_channel(s_rx_chan);
        s_tx_chan = s_rx_chan = NULL;
        return XVF_ERR_I2S;
    }
    return XVF_OK;
}

xvf_err_t xvf3800_i2s_write(const int32_t *samples, size_t sample_count) {
    if (!samples || !s_tx_chan) return XVF_ERR_I2S;

    size_t bytes_written = 0;
    if (i2s_channel_write(s_tx_chan, samples,
                          sample_count * sizeof(int16_t),
                          &bytes_written, portMAX_DELAY) != ESP_OK)
        return XVF_ERR_I2S;
    return XVF_OK;
}

xvf_err_t xvf3800_i2s_read(int32_t *samples, size_t sample_count) {
    if (!samples || !s_rx_chan) return XVF_ERR_I2S;

    size_t bytes_read = 0;
    if (i2s_channel_read(s_rx_chan, samples,
                         sample_count * sizeof(int16_t),
                         &bytes_read, portMAX_DELAY) != ESP_OK)
        return XVF_ERR_I2S;
    return XVF_OK;
}

xvf_err_t xvf3800_i2s_deinit(void) {
    if (s_tx_chan) {
        i2s_channel_disable(s_tx_chan);
        i2s_del_channel(s_tx_chan);
        s_tx_chan = NULL;
    }
    if (s_rx_chan) {
        i2s_channel_disable(s_rx_chan);
        i2s_del_channel(s_rx_chan);
        s_rx_chan = NULL;
    }
    return XVF_OK;
}
