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
