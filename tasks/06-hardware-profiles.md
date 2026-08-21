# Phase 6 - Hardware Profiles

- [ ] **HW-A1** Document and encode N16R8 GC9A01, INMP441, MAX98357, and button pinout. Verify continuity checklist.
- [ ] **HW-A2** Implement INMP441 capture adapter. Verify recorded reference tone.
- [ ] **HW-A3** Implement MAX98357 playback adapter. Verify reference tone output.
- [x] **HW-A4** Add N16R8 partition and sdkconfig defaults. Verify flash/PSRAM report and size gate. _(defaults merged; N16R8 size-gate report still pending — audited 2026-08-21)_
- [ ] **HW-A5** Run N16R8 display, buttons, audio, WiFi, and BLE smoke test.
- [x] **HW-B1** Document ReSpeaker/XIAO pinout, power budget, GC9A01 wiring, and enclosure constraints.
- [x] **HW-B2** Implement XVF3800 I2S audio adapter. Verify processed channel stream. _(real i2s_std TX driver on BCLK=8/WS=7/DOUT=44; 440Hz tone heard twice through XMOS→codec→amp→jack 2026-08-21; RX/capture direction DIN=43 still pending)_
- [x] **HW-B3** Implement XVF3800 I2C control and version read. Verify real-device response. _(done via XMOS servicer protocol: bus scan ACKs 0x18+0x2C, GPO write/read loopback verified on device; invented register map replaced — see DEVELOPMENT_PROGRESS 2026-08-21)_
- [ ] **HW-B4** Expose VAD and DoA diagnostics. Verify direction and speech fixtures. _(mute-button state read verified via X0D30 polling 2026-08-21; VAD/DoA need I2S RX path first)_
- [ ] **HW-B5** Control codec, mute, and WS2812 status LEDs. Verify each independently. _(mute ✅ both directions w/ physical cross-check; WS2812 rail ✅ register+physical; codec registers readable @0x18 but volume/mute control must route via XMOS commands — amp pin X0D31 is XMOS-owned (write overridden ~300ms); remaining: XMOS-side codec control)_
- [x] **HW-B6** Add XIAO 8 MB flash/8 MB PSRAM sdkconfig and size gate. Verify memory report.
- [ ] **HW-B7** Implement XVF3800 I2C DFU adapter. Verify Safe Mode recovery rehearsal. _(depends on real B3 I2C — audited 2026-08-21)_
- [ ] **HW-B8** Run ReSpeaker display, buttons, audio, WiFi, BLE, and dual-firmware smoke test. _(blocked until B2–B5 verified — audited 2026-08-21)_
