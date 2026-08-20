# HW-A1: ESP32-S3 N16R8 Hardware Reference

## ESP32-S3 N16R8 Specifications

| Parameter | Value |
|-----------|-------|
| Flash | 16MB (quad SPI) |
| PSRAM | 8MB (octal SPI) |
| CPU | Dual-core Xtensa LX7 @ 240MHz |
| USB | Native USB-OTG |
| WiFi | 802.11 b/g/n 2.4GHz |
| BLE | 5.0 |

## Pinout

| Pin | Function | Peripherals | Notes |
|-----|----------|-------------|-------|
| 0 | GPIO0 | Button (action) | Boot button, pull-up, active low |
| 1 | GPIO1 | — | ADC1_CH0 |
| 2 | GPIO2 | — | ADC1_CH1 |
| 3 | GPIO3 | — | ADC1_CH2 |
| 4 | GPIO4 | — | ADC1_CH3 |
| 5 | GPIO5 | — | ADC1_CH4 |
| 6 | GPIO6 | — | ADC1_CH5 |
| 7 | GPIO7 | — | ADC1_CH6 |
| 8 | GPIO8 | — | ADC1_CH7 |
| 9 | GPIO9 | — | ADC1_CH8 |
| 10 | GPIO10 | Display CS | SPI2 |
| 11 | GPIO11 | Display MOSI | SPI2 |
| 12 | GPIO12 | Display SCLK | SPI2 |
| 13 | GPIO13 | Display DC | — |
| 14 | GPIO14 | Display RST | — |
| 15 | GPIO15 | Button (volume up) | Pull-up, active low |
| 16 | GPIO16 | Button (volume down) | Pull-up, active low |
| 17 | GPIO17 | — | ADC2_CH0 |
| 18 | GPIO18 | — | ADC2_CH1 |
| 19 | GPIO19 | USB D- | Native USB |
| 20 | GPIO20 | USB D+ | Native USB |
| 21 | GPIO21 | Display BL | PWM backlight |

## GC9A01 Display Wiring

| GC9A01 | GPIO | Cable Color | Notes |
|--------|------|-------------|-------|
| VCC | 5V | Red | Power supply |
| GND | GND | Black | Ground |
| SCL/SCLK | GPIO12 | Yellow | SPI clock |
| SDA/MOSI | GPIO11 | Green | SPI data |
| CS | GPIO10 | White | Chip select |
| DC/RS | GPIO13 | Orange | Data/Command |
| RST | GPIO14 | Blue | Reset |
| BL | GPIO21 | Purple | Backlight PWM |

## Button Wiring

| Button | GPIO | Mode | Notes |
|--------|------|------|-------|
| Action | GPIO0 | Pull-up | Boot button (active low) |
| Volume Up | GPIO15 | Pull-up | Optional |
| Volume Down | GPIO16 | Pull-up | Optional |

- Use 10kΩ pull-up resistors to 3.3V
- Debounce: 50ms recommended

## Audio (Internal ADC/DAC)

| Signal | GPIO | Notes |
|--------|------|-------|
| ADC Input | GPIO1 | mono microphone (if added) |
| DAC Output | GPIO2 | mono speaker (if added) |

- Internal ADC: 12-bit, 0-3.3V
- Internal DAC: 8-bit, 0-3.3V
- No AEC, no beamforming, no VAD

## I2C (Not Available)

ESP32-S3 N16R8 has no external I2C devices in this configuration. I2C pins (GPIO8/GPIO9) are available but not wired.

## SPI (Display Only)

| Signal | GPIO | SPI Host |
|--------|------|----------|
| SCLK | GPIO12 | SPI2_HOST |
| MOSI | GPIO11 | SPI2_HOST |
| CS | GPIO10 | SPI2_HOST |
| MISO | — | Not connected |

- SPI clock: 40MHz recommended
- SPI mode: 0 (CPOL=0, CPHA=0)

## Power Budget

### N16R8 System

| Component | Voltage | Current (typ) | Current (max) | Power |
|-----------|---------|---------------|---------------|-------|
| ESP32-S3 N16R8 | 3.3V | 80mA | 350mA | 1.16W |
| GC9A01 Display | 5V | 20mA | 40mA | 0.20W |
| Backlight (max) | 5V | 40mA | 40mA | 0.20W |
| **TOTAL** | — | **140mA** | **430mA** | **1.56W** |

### Power Supply Requirements

- **Minimum**: 5V / 500mA (2.5W) — reduced brightness
- **Recommended**: 5V / 1A (5W) — full brightness
- **USB-C**: Supports up to 500mA from host port
- **External**: 5V/1A adapter for standalone operation

### Current Limiting

- Backlight: Use PWM to control brightness
- No speaker or LEDs to limit

## Enclosure Constraints

### Minimum Internal Dimensions

| Dimension | Value | Notes |
|-----------|-------|-------|
| Width | 50mm | ESP32-S3 dev board |
| Height | 20mm | Display + board |
| Depth | 50mm | Circular (GC9A01 240x240) |

### Mounting Points

- ESP32-S3: 2x M2.5 mounting holes (varies by dev board)
- Display: friction fit or 4x M2 standoffs

### Thermal Considerations

- ESP32-S3: passive cooling adequate (<500mW)
- No high-power peripherals
- Ensure ventilation for stable operation

## Reset Sequence

1. Power on ESP32-S3
2. Wait 100ms for boot
3. Initialize SPI for display
4. Initialize GPIO for buttons
5. Initialize WiFi (if configured)
6. Initialize BLE (if configured)
7. Start display with default skin

## Flash Memory Map

| Partition | Offset | Size | Purpose |
|-----------|--------|------|---------|
| Bootloader | 0x0 | 32KB | Bootloader |
| Partition Table | 0x8000 | 4KB | Partition table |
| Firmware | 0x10000 | 640KB | Application |
| Storage | 0xB0000 | 448KB | Config + skin cache |

## SPI Flash Configuration

| Parameter | Value |
|-----------|-------|
| Size | 16MB |
| Mode | Quad (QIO) |
| Speed | 80MHz |
| CS | GPIO10 (shared with display) |

Note: SPI flash shares pins with display CS. Use different CS pins or ensure proper multiplexing.

## PSRAM Configuration

| Parameter | Value |
|-----------|-------|
| Size | 8MB |
| Mode | Octal |
| Speed | 80MHz |
| Purpose | Display buffer, audio buffer |

## Partition Table (N16R8)

```csv
# Name,   Type, SubType, Offset,  Size,    Flags
nvs,      data, nvs,     0x9000,  0x5000,
otadata,  data, ota,     0xe000,  0x2000,
phy_init, data, phy,     0x10000, 0x1000,
ota_0,    app,  ota_0,   0x20000, 0x100000,
storage,  data, spiffs,  0x120000,0x80000,
```

## sdkconfig Defaults

See `sdkconfig.defaults.n16r8` for N16R8-specific configuration.
