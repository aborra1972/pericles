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

## 2026-08-21 — Mute button mapped, HW-B3 ticked ✅ (interactive window)

**Status:** ✅ Physical mute button fully characterized over I2C; HW-B3 closed with real-device evidence.

- Interactive capture (~20 clean transitions in 60s while user pressed the mute button):
  ```
  idle:      GPO 00 0000000100   (X0D30=0 unmuted)
  pressed:   GPO 00 0001000000   (X0D30=1 mic muted + LED on)
  ```
- Dual-stream confirmation: the same state appears in GPO values byte[1] (X0D30) and in the `[36,0x86,4]` GPIO status byte[1] — consistent cross-reads.
- Interpretation: the XMOS application handles button→mute internally; ESP32 can READ mute state (X0D30 poll) and SET it (GPO30 write, already loopback-verified). Both directions proven.
- HW-B3 ticked in tasks/06: bus scan + servicer write/read loopback = real-device response. The skeleton's invented "version register" was replaced by protocol-level verification.
- Remaining for B5 independence checklist: WS2812 rail X0D33 write toggle (read shows 01=on), amp X0D31 pop test (needs speaker on jack), codec/volume path via XMOS commands.

## 2026-08-21 — Audio path proven end-to-end ✅ (HW-B2 TX verified audibly)

**Status:** ✅ Real I2S driver streams audio through the full chain; user heard 440 Hz tone twice on headphones.

- Replaced the mock I2S driver (`xvf3800_i2s.{c,h}`) with a real `i2s_std` TX implementation: controller role, 16 kHz / 16-bit stereo Philips, **BCLK=GPIO8, WS=GPIO7, DOUT=GPIO44** (verified Seeed wiring). `smoke_test_audio_i2s()` updated to the new API.
- Tone test: 440 Hz sine @ ~24% amplitude streamed for 30 s. User confirmed hearing it clearly on two separate runs → chain **ESP32 I2S → XVF3800 XMOS → AIC3104 codec → amp → jack** works end-to-end.
- Codec probe (direct reads at 0x18): page=00, reset=00, ovr_cur=44, clkgen=10 — AIC3104 alive and answering with plausible register state.
- Amp enable X0D31 anomaly: writes ACK but read-back stays 00 (enabled) — the XMOS application re-asserts the pin within ~300 ms. Conclusion: amp power is XMOS-owned on this firmware; host-side amp control must go through XMOS commands, not direct GPO31 writes. Pop test inconclusive by design (transient too short); superseded by the audible tone test.
- WS2812 rail X0D33: toggle verified at register level AND physically (user saw ring blink 4×). Key product insight: when the board is MUTED the XMOS stops driving WS2812 data, so the ring stays dark regardless of rail state — first rail test was invisible because the board was left muted from the button test.
- Mute state gates RGB animations — relevant for Pericles UX later.

## 2026-08-21 — Mic capture proven end-to-end ✅ (HW-B2 complete, both directions)

**Status:** ✅ Real mic audio captured from the XVF3800 over I2S; user speech/claps clearly visible in data.

- Root cause of silent RX found: the XVF3800 **INT variant requires 32-bit I2S slots** (XMOS Programming Guide Table 2.1: Integrated device = I2S slave, Data Bit Depth 32). Seeed's reference confirms it (`AUDIO_I2S_BITS 32` in their common.h). Our initial 16-bit config produced no data.
- Driver upgraded to full-duplex: TX+RX channel pair created via one `i2s_new_channel` call on `I2S_NUM_0`, sharing BCLK/WS (controller role), Philips 32-bit stereo @16 kHz. API now uses `int32_t` buffers.
- Diagnostic chain that got us there (all evidence in serial captures):
  - Line-ownership probe (I2S off, pulldowns on): bclk/ws/din all 0% high → XMOS is a **pure I2S slave**, never drives the bus. Host-controller role confirmed electrically.
  - First RX attempt showed sparse spikes (16384/32767/-1) with constant RMS even in silence → floating-pin crosstalk, not audio. Pull-down test gave exact zeros → line genuinely undriven.
  - Mute ruled out as gate: board already unmuted (`x0d30=00`), still zeros at 16-bit.
  - After switching to 32-bit slots: real audio. Quiet baseline rmsL ≈ 19–50 M; user speech pushed rmsL to 71–118 M; clap peaked at full-scale clip (2^31). Right channel (raw mic) reacted in parallel (8 M → 123 M).
- Channel layout matches XMOS docs: **left = processed beamforming output, right = raw mic after amplification**.
- User confirmed audibly: tone heard at 32-bit TX, spoke during capture window.
- Note: `peakL=-2147483648` in one log line is a printf cast artifact on Xtensa (long is 32-bit); true peak was +2^31. Cosmetic only.

## 2026-08-21 — Session close snapshot

- Ticked this session: HW-B3 (I2C control, servicer protocol decoded), HW-B2 (I2S TX audibly verified).
- Still open: HW-B2 RX/capture direction (DIN=GPIO43), HW-B4 (VAD/DoA — needs RX path), HW-B5 codec-control half (volume/mute via XMOS commands; direct register reads OK), HW-B7 (DFU rehearsal), HW-B8 (full smoke).
- Working tree at close: main.c still carries diagnostic sequences (codec probe + tone test) — fine for bring-up, to be replaced by the real app loop later.

## 2026-08-21 — HW-B4 diagnosis: DoA/VAD blocked on XMOS firmware v1.0.4

**Status:** ⛔ Blocked by device firmware version, NOT by our code. Evidence below.

- Empirical command-map discovery over the control port (resid × cmd × reply-length sweeps, paced ~10 ms; flood scans misattribute responses due to a device-side response backlog — always calibrate against the known-good GPO read first).
- Verified landscape: **r20** = GPO servicer, commands 0x00–0x11 supported (c00 GPO values len6; c01 GPO write; c10/c11 LED params, big-endian float 2.5); **r36** = IO_CONFIG servicer (c00 → 3-byte GPI bitmap); **r48** = version info (c00 → `01 00 04` = **v1.0.4**; c05/c0B ASCII build strings); r49 scalar endpoint.
- Status-byte semantics established: `0x00` ok · `0x05` bad resource · `0x41` command unsupported · `0x42` reply-length mismatch (length validation is strict per command).
- Resource 20's command space **ends at c11**: c12–c1F all return st=41. Seeed's official DoA/VAD recipe (`wiki.seeedstudio.com/respeaker_xvf3800_xiao_doa_vad`) uses **r20 c19** (reply = status + 4 B, uint16 LE `[azimuth_deg][speech_detected]`) and requires firmware `i2s_dfu_firmware_v1.0.7` or `i2s_master_..._48k_test5`. Our board runs **v1.0.4**, which predates the DoA/LED-effect commands.
- Corroborating hits: r20 c12 currently st=41 too (LED effect also missing), while Seeed's GPIO/GPI/LED-brightness examples match our working commands exactly.
- Unblock path: XMOS firmware DFU update to v1.0.7+ (bins at `github.com/respeaker/reSpeaker_XVF3800_USB_4MIC_ARRAY/xmos_firmwares`). This doubles as the HW-B7 DFU rehearsal. I2C DFU works from the ESP32 host for I2S-variant firmware; USB DFU needs safe mode.

## 2026-08-21 — HW-B4 resolved: DoA/VAD live after XMOS firmware upgrade

**Status:** ✅ Working on device. Firmware upgraded v1.0.4 → `i2s_dfu_firmware_v1.0.7.bin` (reports internally as **1.0.5** via r48 c00 — Seeed's bin versioning, not a flash failure).

- DFU path used: USB DFU from the host PC (not the planned ESP32-hosted I2C DFU). Safe mode = full power cycle holding MUTE until the red LED blinks; board then enumerates as `2886:001a`; flash with `dfu-util -R -e -a 1 -D <bin>`. Bin archived at `~/pericles-flash-backups/` (sha256 `7f875e70…`).
- Gotcha: safe mode times out after a few minutes back to normal boot, where the XMOS side does not enumerate on USB at all (looks like a dead port). Flash immediately after entering safe mode.
- DoA recipe confirmed on device: r20 c19 read → st=00 + uint16 LE `[azimuth_deg][speech_detected]`. Azimuth tracked the user walking around the array (248→271→275→181→237→285→142), stable while stationary; speech flag toggled exactly with voice.
- Critical gate discovered: **DOA_VALUE only updates while an LED effect is running** on this firmware generation (v1.0.8 changelog decouples them). The effect is set with a WRITE-ONLY command r20 c12, payload `[effect_id]` — invisible to read-only command scans (reads of c12 return st=41). Seeed's wiki uses effect 4 in setup. Without it: azimuth/speech frozen at 0 and the LED ring stays dark.
- Driver addition: generic `xvf3800_servicer_write(ctrl, resid, cmd, payload, len)` ([resid, cmd, len, payload…] STOP framing), alongside the existing read_split.
- Behavior change observed by user: stock v1.0.4 booted with the voice-reactive LED ring active; v1.0.7 boots dark until an effect is selected via c12.

## 2026-08-21 — HW-B5 flash hit a boot loop: generated sdkconfig had Quad PSRAM, XIAO S3R8 needs Octal

**Status:** ✅ Fixed and verified on device (`octal_psram: Found 8MB PSRAM device`, memory test OK, app boots and runs the HW-B5 sequence).

- Symptom: right after flashing the HW-B5 build, the board rebooted forever: `E quad_psram: PSRAM ID read error: 0x00ffffff, PSRAM chip not found or not supported` → `E cpu_start: Failed to init external RAM!` → `abort()` → `rst:0xc (RTC_SW_CPU_RST)`. Crash happens before `app_main`, so an `idf.py monitor` piped through grep shows *nothing* — looks like a dead flash but isn't. Capture boot logs with a raw pyserial reader toggling RTS/DTR instead (worked every time; `idf.py monitor` through a pipe proved unreliable twice).
- Root cause: the generated (gitignored) `firmware/sdkconfig` carried `CONFIG_SPIRAM_MODE_QUAD=y`. The XIAO ESP32-S3**R8** has embedded **Octal** PSRAM, so quad probing can never find a chip. The correct octal config lives in `sdkconfig.defaults.xiao` since HW-B6, but `firmware/CMakeLists.txt` never wired that profile into `SDKCONFIG_DEFAULTS` — it had been applied by hand once, so any silent sdkconfig regeneration from plain defaults drifted back to IDF's quad default. Both `sdkconfig` and `sdkconfig.old` carried QUAD.
- Fix: flip the active sdkconfig to `CONFIG_SPIRAM_MODE_OCT=y` (QUAD unset). Boot then enumerates the AP-memory PSRAM correctly (vendor 0x0d, 64 Mbit, 80 MHz).
- **Prevention (why this entry exists):** `SDKCONFIG_DEFAULTS "sdkconfig.defaults;sdkconfig.defaults.xiao"` is now set in `firmware/CMakeLists.txt`, so every future sdkconfig regeneration includes the verified XIAO profile automatically. Rule: never hand-edit only the generated `sdkconfig`; mirror any manual tweak into the matching `sdkconfig.defaults.*` profile or it will be lost on regeneration. If a fresh checkout ever prints `quad_psram` errors on this board, check SPIRAM mode first.

### Observations from the same post-fix run

- `FW VER r48c0: 1.0.5` — expected, not a regression: Seeed's `v1.0.7` bin reports internally as 1.0.5 (documented above).
- GPO guard healthy pre-test: `CALIB st=00 pins=00 00 00 01 00` → mic-mute X0D30=0 (unmuted), WS2812 rail X0D33=1.
- Codec level read-backs (`r48 c11` HP, `r48 c12` LINEOUT) all fail with `err=-5` (nonzero servicer status byte) while the same framing works for r48 c00. Meanwhile the level *writes* ACK at I2C level — but `servicer_write` has no response frame, so an unsupported command ACKs identically. Effective volume changes are therefore unproven until confirmed audibly or via a successful read. Next diagnostic: log the raw status byte (per the established semantics: 41=unsupported, 42=length mismatch, 05=bad resource) before assuming these commands exist on the `i2s_dfu` variant.
- Audio path itself is alive: user heard the 440 Hz test tone at the jack plug during the sequence.

## 2026-08-21 — HW-B5 negative result: AIC3104 servicer commands are inert on i2s_dfu; output volume moved host-side

**Status:** ⛔→✅ Route closed with evidence; replacement route implemented (host-side digital gain).

- Reply-length sweep L=2..8 on `r48 c11`: **st=42 at every length**, and the trailing payload is always `01 00 05` — byte-for-byte the VERSION reply (`1.0.5`) read earlier via c00. The device never produces real c11 data here; after rejecting the command it echoes its previous valid response buffer.
- `r48 c12` (LINEOUT level): st=41 (unsupported) at every length.
- Writes ACK at transport level only (write-only framing carries no response frame), and produce **zero audible effect** — including value 0, which does not mute. Operator listened through the entire gradient: constant loudness start to finish.
- Conclusion: Seeed's `python_control` PARAMETERS map (`AIC3104_HP_LEVEL`/`LINEOUT_LEVEL`) belongs to the **USB-audio variant**, where the XMOS owns USB-stream volume. On `i2s_dfu` these parameters are dead ends. Do not burn more time on r48 codec-level commands against this firmware generation.
- **Architecture decision:** output loudness is controlled HOST-SIDE by scaling the I2S TX samples on the ESP32 (`s_amp_scale` in main.c). Division of labor now: ESP32 = loudness of what it sends; XMOS = mics, beamforming, DoA/VAD, mic-mute (GPO X0D30, proven), WS2812 rail (GPO X0D33, proven).
- Driver kept: `xvf3800_codec_level_get/set` remain in `pericles_core`, annotated UA-variant-only, useful if the board ever runs UA firmware.
- `main.c` HW-B5 sequence now proves host-side gain audibly: 0.25 → 1.00 → 0.08 → 0.00 (silence) → 0.50.

## 2026-08-21 — HW-B5 closed: host-side gain gradient confirmed by ear

**Status:** ✅ Operator confirmed the full digital-gain gradient (quieter/loudest/very-quiet/8 s silence/medium) on the jack output. Serial capture shows all five steps with exact timings.

- HW-B5 final state: mic mute ✅ (GPO X0D30), WS2812 rail ✅ (GPO X0D33), output volume ✅ (host-side `s_amp_scale`), AIC3104 servicer route documented as UA-variant-only.
- Phase 6 B-profile remaining: HW-B7 (ESP32-hosted I2C DFU adapter) and HW-B8 (full smoke test, now unblocked).
