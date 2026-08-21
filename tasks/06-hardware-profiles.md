# Phase 6 - Hardware Profiles

- [ ] **HW-A1** Document and encode N16R8 GC9A01, INMP441, MAX98357, and button pinout. Verify continuity checklist.
- [ ] **HW-A2** Implement INMP441 capture adapter. Verify recorded reference tone.
- [ ] **HW-A3** Implement MAX98357 playback adapter. Verify reference tone output.
- [x] **HW-A4** Add N16R8 partition and sdkconfig defaults. Verify flash/PSRAM report and size gate. _(defaults merged; N16R8 size-gate report still pending — audited 2026-08-21)_
- [ ] **HW-A5** Run N16R8 display, buttons, audio, WiFi, and BLE smoke test.
- [x] **HW-B1** Document ReSpeaker/XIAO pinout, power budget, GC9A01 wiring, and enclosure constraints.
- [ ] **HW-B2** Implement XVF3800 I2S audio adapter. Verify processed channel stream. _(mock skeleton only — returns silence; real i2s_std driver required — audited 2026-08-21)_
- [x] **HW-B3** Implement XVF3800 I2C control and version read. Verify real-device response. _(done via XMOS servicer protocol: bus scan ACKs 0x18+0x2C, GPO write/read loopback verified on device; invented register map replaced — see DEVELOPMENT_PROGRESS 2026-08-21)_
- [ ] **HW-B4** Expose VAD and DoA diagnostics. Verify direction and speech fixtures. _(mute-button state read verified via X0D30 polling 2026-08-21; VAD/DoA need I2S audio path first)_
- [ ] **HW-B5** Control codec, mute, and WS2812 status LEDs. Verify each independently. _(mute VERIFIED both directions w/ physical-button cross-check 2026-08-21; WS2812 rail X0D33 read-only so far; codec/volume pending)_
- [x] **HW-B6** Add XIAO 8 MB flash/8 MB PSRAM sdkconfig and size gate. Verify memory report.
- [ ] **HW-B7** Implement XVF3800 I2C DFU adapter. Verify Safe Mode recovery rehearsal. _(depends on real B3 I2C — audited 2026-08-21)_
- [ ] **HW-B8** Run ReSpeaker display, buttons, audio, WiFi, BLE, and dual-firmware smoke test. _(blocked until B2–B5 verified — audited 2026-08-21)_
