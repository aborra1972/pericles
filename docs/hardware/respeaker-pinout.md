# HW-B1: ReSpeaker/XIAO Hardware Reference

> ⚠️ **CORRECTED 2026-08-21**: The original pin tables below were written without
> hardware contact and are WRONG for I2C/I2S (they used nonexistent ESP32-S3 pins).
> Verified mappings from Seeed Studio wiki + confirmed by on-device bus scan:
>
> | Interface | Verified mapping |
> |-----------|------------------|
> | I2C (XVF3800 control + AIC3104) | **SDA=GPIO5, SCL=GPIO6**, XMOS addr **0x2C**, TLV320AIC3104 addr **0x18** |
> | I2S audio | **BCLK=GPIO8, WS=GPIO7, DIN(XIAO←XVF)=GPIO43, DOUT(XIAO→XVF)=GPIO44** |
> | Buttons/mute LED/amp/WS2812 power | Routed through XMOS GPO/GPI servicer (GPO30=mic mute+LED, GPO31=amp enable active-low, GPO33=WS2812 rail; GPI X1D09=mute button) |
>
> Source: https://wiki.seeedstudio.com/respeaker_xvf3800_agora_convo_client/
> Evidence: `Bus scan: 2 device(s) ACK: 0x18 0x2C` on SDA=GPIO5/SCL=GPIO6 @400kHz.
> The tables below are kept for the display/WS2812 wiring sections only where not
> contradicted; treat any ESP32-S3 pin ≥22 as invalid on this SoC.

## XIAO ESP32-S3R8 Pinout

| Pin | Function | Peripherals | Notes |
|-----|----------|-------------|-------|
| 0 | GPIO0 | — | Boot button (active low) |
| 1 | GPIO1 | Button (action) | Pull-up, active low |
| 2 | GPIO2 | Amp Enable | HIGH = amplifier ON |
| 3 | GPIO3 | Button (mute) | Pull-up, active low |
| 4 | GPIO4 | Display BL | PWM backlight control |
| 5 | GPIO5 | Display RST | Active low reset |
| 6 | GPIO6 | Display DC | Data/Command select |
| 7 | GPIO7 | Display CS | SPI chip select |
| 8 | GPIO8 | Display SCLK | SPI clock |
| 10 | GPIO10 | Display MOSI | SPI data |
| 17 | GPIO17 | I2S BCK | Bit clock |
| 18 | GPIO18 | I2S WS | Word select |
| 19 | GPIO19 | I2S DATA_IN | Mic data (from XVF3800) |
| 20 | GPIO20 | I2S DATA_OUT | Speaker data (to XVF3800) |
| 21 | GPIO21 | I2C SDA | XVF3800 control |
| 22 | GPIO22 | I2C SCL | XVF3800 control |
| 38 | GPIO38 | WS2812 DATA | RGB status LEDs |

## XVF3800 Connections

| XVF3800 Pin | XIAO Pin | Function |
|-------------|----------|----------|
| I2S_BCK | GPIO17 | I2S bit clock |
| I2S_WS | GPIO18 | I2S word select |
| I2S_DOUT | GPIO19 | Audio to XIAO (mic data) |
| I2S_DIN | GPIO20 | Audio from XIAO (speaker) |
| I2C_SDA | GPIO21 | I2C data |
| I2C_SCL | GPIO22 | I2C clock |
| MUTE | GPIO3 | Mute button |
| INT | GPIO0 | Interrupt (optional) |

## TLV320AIC3104 Codec (on ReSpeaker board)

| Signal | XVF3800 Pin | Function |
|--------|-------------|----------|
| SDA | I2C shared | Codec I2C address 0x18 |
| SCL | I2C shared | I2C clock |
| BCLK | I2S shared | Bit clock |
| WCLK | I2S shared | Word clock |
| DIN | I2S shared | Data in from XVF3800 |
| DOUT | I2S shared | Data out to XVF3800 |

## GC9A01 Display Wiring

| GC9A01 | XIAO Pin | Cable Color | Notes |
|--------|----------|-------------|-------|
| VCC | 5V | Red | Power supply |
| GND | GND | Black | Ground |
| SCL/SCLK | GPIO8 | Yellow | SPI clock |
| SDA/MOSI | GPIO10 | Green | SPI data |
| CS | GPIO7 | White | Chip select |
| DC/RS | GPIO6 | Orange | Data/Command |
| RST | GPIO5 | Blue | Reset |
| BL | GPIO4 | Purple | Backlight PWM |

## WS2812 LED Wiring

| WS2812 | XIAO Pin | Notes |
|--------|----------|-------|
| DIN | GPIO38 | Data input |
| VCC | 5V | Power supply |
| GND | GND | Ground |

- 12 LEDs in series
- Use RMT driver for precise timing
- Max brightness: ~60mA per LED (720mA total at full white)

## Power Budget

### ReSpeaker + XIAO System

| Component | Voltage | Current (typ) | Current (max) | Power |
|-----------|---------|---------------|---------------|-------|
| XIAO ESP32-S3R8 | 3.3V | 80mA | 350mA | 1.16W |
| XVF3800 | 3.3V | 50mA | 100mA | 0.33W |
| TLV320AIC3104 | 3.3V | 10mA | 30mA | 0.10W |
| GC9A01 Display | 5V | 20mA | 40mA | 0.20W |
| Backlight (max) | 5V | 40mA | 40mA | 0.20W |
| WS2812 (12 LEDs) | 5V | 60mA | 720mA | 3.60W |
| Speaker amp | 5V | 100mA | 500mA | 2.50W |
| **TOTAL** | — | **360mA** | **1.78A** | **8.09W** |

### Power Supply Requirements

- **Minimum**: 5V / 1A (5W) — reduced brightness, no speaker
- **Recommended**: 5V / 2A (10W) — full functionality
- **USB-C**: Supports up to 500mA from host port
- **External**: 5V/2A adapter for standalone operation

### Current Limiting

- WS2812: Limit to 50% brightness (~360mA) if using USB power
- Speaker: Reduce volume if on USB power
- Use `ledc_set_duty()` to control backlight and LED brightness

## Enclosure Constraints

### Minimum Internal Dimensions

| Dimension | Value | Notes |
|-----------|-------|-------|
| Width | 85mm | XIAO + ReSpeaker + wiring |
| Height | 25mm | Display + components |
| Depth | 85mm | Circular (GC9A01 240x240) |

### Mounting Points

- XIAO: 2x M2.5 mounting holes (18mm spacing)
- Display: friction fit or 4x M2 standoffs
- ReSpeaker: no standard mounting (use adhesive or clips)

### Thermal Considerations

- XVF3800: passive cooling adequate (<100mW)
- Speaker amp: may need heatsink if sustained high volume
- Ensure ventilation holes for speaker airflow

## I2C Address Map

| Device | Address | Notes |
|--------|---------|-------|
| XVF3800 | 0x3C | Main control interface |
| TLV320AIC3104 | 0x18 | Audio codec |
| GC9A01 | 0x3C (I2C) | If using I2C mode (not SPI) |

Note: XVF3800 and GC9A01 cannot share I2C bus if both at 0x3C. Use SPI for display.

## Reset Sequence

1. Power on XIAO
2. Wait 100ms for XVF3800 boot
3. Initialize I2C at 400kHz
4. Read XVF3800 version register (0x0000)
5. Initialize I2S at 16kHz/16-bit
6. Configure codec (TLV320AIC3104)
7. Initialize display (GC9A01 via SPI)
8. Initialize WS2812 via RMT
9. Start BLE advertising
