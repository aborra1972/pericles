# Phase 6 - Hardware Profiles

- [ ] **HW-A1** Document and encode N16R8 GC9A01, INMP441, MAX98357, and button pinout. Verify continuity checklist.
- [ ] **HW-A2** Implement INMP441 capture adapter. Verify recorded reference tone.
- [ ] **HW-A3** Implement MAX98357 playback adapter. Verify reference tone output.
- [x] **HW-A4** Add N16R8 partition and sdkconfig defaults. Verify flash/PSRAM report and size gate. _(defaults merged; N16R8 size-gate report still pending — audited 2026-08-21)_
- [ ] **HW-A5** Run N16R8 display, buttons, audio, WiFi, and BLE smoke test.
- [x] **HW-B1** Document ReSpeaker/XIAO pinout, power budget, GC9A01 wiring, and enclosure constraints.
- [x] **HW-B2** Implement XVF3800 I2S audio adapter. Verify processed channel stream. _(full-duplex i2s_std on BCLK=8/WS=7/DOUT=44/DIN=43, 32-bit slots per XMOS INT spec; TX: 440Hz tone heard; RX: user speech/claps captured with clear SNR contrast, L=processed beam R=raw mic — 2026-08-21)_
- [x] **HW-B3** Implement XVF3800 I2C control and version read. Verify real-device response. _(done via XMOS servicer protocol: bus scan ACKs 0x18+0x2C, GPO write/read loopback verified on device; invented register map replaced — see DEVELOPMENT_PROGRESS 2026-08-21)_
- [x] **HW-B4** Expose VAD and DoA diagnostics. Verify direction and speech fixtures. _(resolved 2026-08-21 after XMOS fw upgrade to i2s_dfu_firmware_v1.0.7: r20 c19 returns uint16 LE [azimuth][speech], tracked user walking around array; requires LED effect active via write-only r20 c12 — see DEVELOPMENT_PROGRESS)_
- [ ] **HW-B5** Control codec, mute, and WS2812 status LEDs. Verify each independently. _(mute ✅ both directions w/ physical cross-check; WS2812 rail ✅ register+physical; codec registers readable @0x18 but volume/mute control must route via XMOS commands — amp pin X0D31 is XMOS-owned (write overridden ~300ms); remaining: XMOS-side codec control)_
- [x] **HW-B6** Add XIAO 8 MB flash/8 MB PSRAM sdkconfig and size gate. Verify memory report.
- [ ] **HW-B7** Implement XVF3800 I2C DFU adapter. Verify Safe Mode recovery rehearsal. _(safe-mode + USB DFU rehearsal done 2026-08-21, board now on i2s_dfu_firmware_v1.0.7; remaining: ESP32-hosted I2C DFU adapter)_
- [ ] **HW-B8** Run ReSpeaker display, buttons, audio, WiFi, BLE, and dual-firmware smoke test. _(blocked until B2–B5 verified — audited 2026-08-21)_
