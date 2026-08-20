#include "unity.h"
#include "pericles_core.h"
#include <string.h>

// Valid integrated profile JSON
static const char *VALID_INTEGRATED = 
    "{"
    "\"id\": \"integrated\","
    "\"name\": \"Pericles Integrado\","
    "\"mcu\": {"
    "\"chip\": \"ESP32-S3-N16R8\","
    "\"flash_mb\": 16,"
    "\"psram_mb\": 8,"
    "\"cpu_mhz\": 240"
    "},"
    "\"display\": {"
    "\"width\": 240,"
    "\"height\": 240"
    "},"
    "\"buttons\": {"
    "\"action\": {\"pin\": 0},"
    "\"volume_up\": {\"pin\": 15},"
    "\"volume_down\": {\"pin\": 16}"
    "},"
    "\"leds\": {"
    "\"count\": 0"
    "},"
    "\"connectivity\": {"
    "\"wifi\": true,"
    "\"ble\": true,"
    "\"usb\": true"
    "}"
    "}";

// Valid respeaker profile JSON
static const char *VALID_RESPEAKER =
    "{"
    "\"id\": \"respeaker\","
    "\"name\": \"Pericles ReSpeaker\","
    "\"mcu\": {"
    "\"chip\": \"XIAO-ESP32-S3R8\","
    "\"flash_mb\": 8,"
    "\"psram_mb\": 8,"
    "\"cpu_mhz\": 240"
    "},"
    "\"display\": {"
    "\"width\": 240,"
    "\"height\": 240"
    "},"
    "\"buttons\": {"
    "\"action\": {\"pin\": 1},"
    "\"mute\": {\"pin\": 3}"
    "},"
    "\"leds\": {"
    "\"count\": 12"
    "},"
    "\"connectivity\": {"
    "\"wifi\": true,"
    "\"ble\": true,"
    "\"usb\": true"
    "}"
    "}";

TEST_CASE("manifest validates valid integrated profile", "[pericles_core][manifest]") {
    manifest_t m;
    pericles_err_t err = pericles_manifest_validate(VALID_INTEGRATED, &m);
    TEST_ASSERT_EQUAL(PERICLES_OK, err);
    TEST_ASSERT_EQUAL_STRING("integrated", m.id);
    TEST_ASSERT_EQUAL_STRING("ESP32-S3-N16R8", m.chip);
    TEST_ASSERT_EQUAL(16, m.flash_mb);
    TEST_ASSERT_EQUAL(8, m.psram_mb);
    TEST_ASSERT_EQUAL(240, m.cpu_mhz);
    TEST_ASSERT_TRUE(m.wifi);
    TEST_ASSERT_TRUE(m.ble);
    TEST_ASSERT_EQUAL(240, m.display_width);
    TEST_ASSERT_EQUAL(240, m.display_height);
    TEST_ASSERT_EQUAL(3, m.button_count);
    TEST_ASSERT_EQUAL(0, m.led_count);
}

TEST_CASE("manifest validates valid respeaker profile", "[pericles_core][manifest]") {
    manifest_t m;
    pericles_err_t err = pericles_manifest_validate(VALID_RESPEAKER, &m);
    TEST_ASSERT_EQUAL(PERICLES_OK, err);
    TEST_ASSERT_EQUAL_STRING("respeaker", m.id);
    TEST_ASSERT_EQUAL_STRING("XIAO-ESP32-S3R8", m.chip);
    TEST_ASSERT_EQUAL(8, m.flash_mb);
    TEST_ASSERT_EQUAL(12, m.led_count);
    TEST_ASSERT_EQUAL(2, m.button_count);
}

TEST_CASE("manifest rejects NULL input", "[pericles_core][manifest]") {
    manifest_t m;
    pericles_err_t err = pericles_manifest_validate(NULL, &m);
    TEST_ASSERT_EQUAL(PERICLES_ERR_INVALID_ARG, err);
}

TEST_CASE("manifest rejects NULL output", "[pericles_core][manifest]") {
    pericles_err_t err = pericles_manifest_validate("{}", NULL);
    TEST_ASSERT_EQUAL(PERICLES_ERR_INVALID_ARG, err);
}

TEST_CASE("manifest rejects invalid JSON", "[pericles_core][manifest]") {
    manifest_t m;
    pericles_err_t err = pericles_manifest_validate("{broken", &m);
    TEST_ASSERT_EQUAL(PERICLES_ERR_INVALID_JSON, err);
}

TEST_CASE("manifest rejects JSON without id field", "[pericles_core][manifest]") {
    manifest_t m;
    pericles_err_t err = pericles_manifest_validate("{\"name\":\"test\"}", &m);
    TEST_ASSERT_EQUAL(PERICLES_ERR_MISSING_FIELD, err);
}

TEST_CASE("manifest parses connectivity flags correctly", "[pericles_core][manifest]") {
    manifest_t m;
    pericles_err_t err = pericles_manifest_validate(VALID_INTEGRATED, &m);
    TEST_ASSERT_EQUAL(PERICLES_OK, err);
    TEST_ASSERT_TRUE(m.wifi);
    TEST_ASSERT_TRUE(m.ble);
    TEST_ASSERT_TRUE(m.usb);
}

TEST_CASE("manifest defaults missing fields to zero", "[pericles_core][manifest]") {
    manifest_t m;
    pericles_err_t err = pericles_manifest_validate("{\"id\":\"minimal\"}", &m);
    TEST_ASSERT_EQUAL(PERICLES_OK, err);
    TEST_ASSERT_EQUAL_STRING("minimal", m.id);
    TEST_ASSERT_EQUAL(0, m.flash_mb);
    TEST_ASSERT_EQUAL(0, m.psram_mb);
    TEST_ASSERT_FALSE(m.wifi);
    TEST_ASSERT_FALSE(m.ble);
}
