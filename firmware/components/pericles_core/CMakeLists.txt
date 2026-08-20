idf_component_register(SRCS "pericles_core.c" "manifest.c" "debounce.c" "session.c" "timeout.c" "display.c" "audio.c" "wifi_manager.c" "ble_manager.c" "xvf3800_i2s.c" "xvf3800_i2c.c" "xvf3800_diag.c" "peripherals.c" "xvf3800_dfu.c" "smoke_test.c"
                       INCLUDE_DIRS "include"
                       REQUIRES espressif__cjson)
