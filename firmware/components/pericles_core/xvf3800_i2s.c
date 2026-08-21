#include "xvf3800_i2s.h"
#include "driver/i2s_std.h"
#include "freertos/FreeRTOS.h"

// Real I2S standard-mode TX driver for the XVF3800 audio link.
// The ESP32-S3 is the I2S controller; the XVF3800 consumes DOUT on GPIO44.

static i2s_chan_handle_t s_tx_chan = NULL;

xvf_err_t xvf3800_i2s_init(void) {
    if (s_tx_chan) return XVF_OK;  // already initialized

    i2s_chan_config_t chan_cfg =
        I2S_CHANNEL_DEFAULT_CONFIG(I2S_NUM_0, I2S_ROLE_MASTER);
    if (i2s_new_channel(&chan_cfg, &s_tx_chan, NULL) != ESP_OK)
        return XVF_ERR_I2S;

    i2s_std_config_t std_cfg = {
        .clk_cfg = I2S_STD_CLK_DEFAULT_CONFIG(XVF3800_I2S_SAMPLE_RATE),
        .slot_cfg = I2S_STD_PHILIPS_SLOT_DEFAULT_CONFIG(
            I2S_DATA_BIT_WIDTH_16BIT, I2S_SLOT_MODE_STEREO),
        .gpio_cfg = {
            .mclk = I2S_GPIO_UNUSED,
            .bclk = XVF3800_I2S_BCLK_GPIO,
            .ws   = XVF3800_I2S_WS_GPIO,
            .dout = XVF3800_I2S_DOUT_GPIO,
            .din  = I2S_GPIO_UNUSED,
            .invert_flags = { false, false, false },
        },
    };
    if (i2s_channel_init_std_mode(s_tx_chan, &std_cfg) != ESP_OK ||
        i2s_channel_enable(s_tx_chan) != ESP_OK) {
        i2s_del_channel(s_tx_chan);
        s_tx_chan = NULL;
        return XVF_ERR_I2S;
    }
    return XVF_OK;
}

xvf_err_t xvf3800_i2s_write(const int16_t *samples, size_t sample_count) {
    if (!samples || !s_tx_chan) return XVF_ERR_I2S;

    size_t bytes_written = 0;
    if (i2s_channel_write(s_tx_chan, samples,
                          sample_count * sizeof(int16_t),
                          &bytes_written, portMAX_DELAY) != ESP_OK)
        return XVF_ERR_I2S;
    return XVF_OK;
}

xvf_err_t xvf3800_i2s_deinit(void) {
    if (!s_tx_chan) return XVF_OK;
    i2s_channel_disable(s_tx_chan);
    i2s_del_channel(s_tx_chan);
    s_tx_chan = NULL;
    return XVF_OK;
}
