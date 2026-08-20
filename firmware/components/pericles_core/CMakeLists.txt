idf_component_register(SRCS "pericles_core.c" "manifest.c" "debounce.c" "session.c" "timeout.c" "display.c" "audio.c" "wifi_manager.c" "ble_manager.c"
                       INCLUDE_DIRS "include"
                       REQUIRES espressif__cjson)
