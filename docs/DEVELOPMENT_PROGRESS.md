# Development Progress Log

This log preserves real-hardware investigation evidence across agent handoffs.

## Task Evidence Rule

Tick a task only after its required evidence has been recorded. Preserve failed and blocked attempts here; a blocker is not a hardware failure unless the evidence demonstrates one.

## 2026-08-20 — ReSpeaker/XIAO real-hardware validation

**Status:** ✅ Pericles firmware flashed and booting successfully on XIAO hardware.

### Flash backup before Pericles flashing

- Complete backup: `/home/ale/pericles-flash-backups/20260820T220030Z-921600/flash-8mb.bin` (8,388,608 bytes, SHA-256 `afe7b55ef757e56434c6f20add6db9604ffe951c1e24742cb6def5248b6c6362`).

### Successful Pericles flash and boot

- **Flash**: Built in `firmware/build/xiao-flash-ready/` (224 KB, 79% free in app partition). Flashed to `/dev/ttyACM0` with DIO/8MB/80MHz settings.
- **PSRAM fix**: Changed `CONFIG_SPIRAM_MODE_QUAD` → `CONFIG_SPIRAM_MODE_OCT`. The XIAO ESP32-S3R8 uses embedded Octal PSRAM (64 Mbit = 8 MB), not external Quad. The Quad mode caused "PSRAM ID read error" and immediate crash at startup.
- **Boot log confirms**:
  - `octal_psram: vendor id 0x0d (AP), dev id 0x02 (gen 3), density 0x03 (64 Mbit)`
  - `Found 8MB PSRAM device` / `Speed: 80MHz` / `SPI SRAM memory test OK`
  - `heap_init: Adding pool of 8192K of PSRAM memory`
  - `Project name: pericles` / `App version: ece52c6-dirty` / `ESP-IDF: v5.4`
  - `main_task: Calling app_main()` → "Pericles firmware starting"

### Config corrections applied
- `sdkconfig.defaults.xiao`: Fixed to `CONFIG_SPIRAM_MODE_OCT`, DIO flash, 8MB, removed unknown keys.
- `sdkconfig.defaults.n16r8`: Fixed 5 malformed Kconfig keys (underscores, partition table).
- `sdkconfig.defaults`: Removed board-specific flash/partition keys.
- Kconfig warnings: Zero unknown/malformed keys.

### IRAM margin
- Remains at 1 byte free (16,383/16,384). This is an ESP-IDF linker constraint for the ESP32-S3, not a runtime failure — the firmware boots and runs. Additional ISR/peripheral driver code may require tuning before enabling I2S/SPI hardware features.

## 2026-08-21 — Toolchain verification

**Status:** ✅ `esptool` availability confirmed; previous session blocker cleared.

- Fresh shell: `source ~/esp-idf/export.sh` exits 0; `command -v esptool.py` resolves to `/home/ale/.espressif/python_env/idf5.4_py3.12_env/bin/esptool.py`.
- Conclusion: `esptool` was never missing from the system; it lives inside the ESP-IDF v5.4 Python virtualenv and only appears on `PATH` after sourcing `export.sh`. All flash/reset workflows must run inside a sourced IDF shell.
- Still pending before any detector change: resolve the USB VID/PID evidence conflict (`303a:1001` observed on the wire vs repository mapping `303a:1001` = XIAO N16R8 bare, `2886:0018` = ReSpeaker+XIAO composite).

## 2026-08-21 — Phase 6 tick audit (evidence review)

**Status:** ⚠️ HW-B2–B5, B7, B8 ticks reverted to pending; implementation remains merged.

- Session-log forensics: all HW-A4/HW-B ticks were applied on 2026-08-20 between 14:31 and 14:43 — **before** the board's first USB probe (17:35) and the successful Pericles flash (~21:00–21:24). The "Verify …" clauses of B2–B5/B7/B8 could not have been satisfied at that time.
- No session in the OpenCode log exercises XVF3800 I2S capture, I2C version read, VAD/DoA diagnostics, codec/mute/WS2812 control, DFU rehearsal, or a full ReSpeaker smoke test against hardware.
- Legitimate after review:
  - **HW-B1** ✅ `docs/hardware/respeaker-pinout.md` exists.
  - **HW-B6** ✅ XIAO 8MB/OCT/DIO sdkconfig + memory report + verified flash/boot (commit `846f6bd`, section above).
- Corrected to pending (implementation code exists under `firmware/components/pericles_core/xvf3800_*.c`; only the on-device verification is missing): B2, B3, B4, B5, B7, B8. HW-A4 annotated: N16R8 size-gate report still pending.
- Next physical session must run, in order: I2C version read → VAD/DoA fixtures → codec/mute/LED independent checks → I2S processed-channel stream → Safe Mode DFU rehearsal → full B8 smoke test, recording each result here.

## 2026-08-21 — Driver reality check (board connected)

**Status:** ⚠️ No real driver exists yet; on-device verification is blocked until they are implemented.

- `xvf3800_i2c.c`: **mock** — "Mock I2C driver for compilation without hardware"; `read_reg` returns hardcoded values (`XVF_CMD_VERSION` → fabricated `0x0380` "v3.8.0").
- `xvf3800_i2s.c`: **mock** — "Mock I2S driver… returns silence".
- `peripherals.c`: codec/mute/WS2812 are `"In production: …"` stubs (no gpio/i2c/rmt calls anywhere).
- `main.c` `app_main` prints two lines and sleeps; it never invokes the smoke suite.
- Consequence: flashing and running the current smoke test would PASS trivially without touching hardware — that is exactly how the false ticks of 2026-08-20 originated. The smoke suite itself also simulates button presses.
- Design flag for implementation: on the ReSpeaker XVF3800 the TLV320AIC3104 codec/amp is managed by the XMOS XVF3800 firmware, so ESP32 volume/mute control must go through XMOS I2C commands, not direct TLV320 register writes as `peripherals.c` currently assumes. Validate I2S pin assignments (mock hardcodes BCK=17, WS=18, DIN=19, DOUT=20) against `docs/hardware/respeaker-pinout.md`.
- Board observed today: same unit (MAC `68:EE:8F:50:6D:EC`), again enumerated as `303a:1001` USB JTAG/serial on `/dev/ttyACM0`.

## 2026-08-21 — HW-B3 real I2C bring-up ✅ (first true device evidence)

**Status:** ✅ XVF3800 control transport verified on hardware; register-map semantics still pending.

- Root cause of first failure: repo pinout doc specified I2C on GPIO21/22, but **ESP32-S3 has no GPIO22** → `i2c_new_master_bus` returned `ESP_ERR_INVALID_ARG`. The whole HW-B1 pin table had been written without hardware contact.
- Corrected against Seeed wiki (`respeaker_xvf3800_agora_convo_client`, `respeaker_xvf3800_xiao_gpio`) + Seeed-Projects/ESP32S3_reSpeaker_agora:
  - I2C SDA=GPIO5 SCL=GPIO6; XMOS control addr **0x2C**; AIC3104 at **0x18**.
  - XMOS servicer framing `[resid, cmd|0x80, len(incl. status)]` → read returns `[status, payload...]`; GPO20/GPO31(amp, active-low)/GPO30(mic mute+LED)/GPO33(WS2812 rail).
- On-device evidence (serial capture after flash):
  ```
  [XVF] Bus scan: 2 device(s) ACK: 0x18 0x2C
  [XVF] Control device ACK at 0x2C
  [XVF] GPI read: status=0x42 raw=0x000023
  ```
- Files: `firmware/components/pericles_core/xvf3800_i2c.{c,h}` real `i2c_master` driver with shared-bus singleton, bus scan helper, GPI servicer read; `firmware/main/main.c` boot self-check; CMakeLists adds `driver`.
- Still open for B3: the invented `xvf_cmd_t` register map does not correspond to the XMOS protocol — "version read" must be re-targeted to the proper servicer resource. GPI bit-packing needs interactive calibration (press mute button while polling) before trusting decoded states.

## 2026-08-21 — XMOS control protocol fully decoded ✅ (write loop + read-back verified)

**Status:** ✅ GPO write path AND read path proven on device; button (GPI) read pending one interactive press test.

- Root cause of dead reads found by self-calibrating experiment (toggle GPO30 by software, probe framings): the XMOS control slave requires **header write ending in STOP + separate read transaction**. ESP-IDF `i2c_master_transmit_receive` (repeated START) returns stale/garbage; split transmit→receive works.
- Verified working read (GPO values): tx `[20, 0x80|cmd0, 6]` STOP, then rx 6 → `[status=0x00][X0D11, X0D30, X0D31, X0D33, X0D39]`, one byte per pin.
- Verified working write (Seeed muteMic shape): tx `[20, 1, 2, {pin, value}]` STOP — all writes ACKed; red mute LED driven during phase-1 blink test.
- Loopback evidence (selftest log): writing GPO30=1 reads back X0D30=01; writing 0 reads back 00, alternating perfectly with software toggles. X0D31 read as 00 (= amp enabled, active-low ✓ matches wiki), X0D33 read as 01 (WS2812 rail on ✓).
- Non-working framings documented for posterity: repeated-START reads (`i2c_master_transmit_receive`) return static `42 23…` regardless of state; `[36,6,1]` u32 GPIO-status shape from wiki example 3 returns constant `03 06010001`.
- Files since commit 961fd2f (uncommitted): `xvf3800_i2c.{h,c}` add `servicer_read_split`, `gpo_write`, `gpio_status_read`, `XVF_ERR_STATUS`; `main/main.c` self-calibrating diagnostic loop.
- Next session: single interactive window — user presses mute button while polling; expected to settle GPI mapping (B4/B5 completion), then amp enable toggle (B5 speaker pop test), WS2812 rail, then I2S bring-up with speaker on jack (B2/B5).
