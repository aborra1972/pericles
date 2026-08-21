cmake_minimum_required(VERSION 3.16)

set(EXTRA_COMPONENT_DIRS components)

# Pin the active board profile so sdkconfig regenerations keep the verified
# settings (Octal PSRAM + 8MB flash for the XIAO ESP32-S3R8). Without this,
# a regenerated sdkconfig falls back to IDF defaults (Quad PSRAM) and the
# board boot-loops. Mirror any manual sdkconfig tweak into the profile file.
set(SDKCONFIG_DEFAULTS "sdkconfig.defaults;sdkconfig.defaults.xiao")

include($ENV{IDF_PATH}/tools/cmake/project.cmake)
project(pericles)
