# Phase 2 - Scaffold and Contracts

- [x] **SCAFF-01** Create root workspace tooling selected by `ADR-02`, `.editorconfig`, and build commands. Verify clean bootstrap.
- [x] **SCAFF-02** Create `backend/` health service and focused test. Verify backend test command from ADR.
- [x] **SCAFF-03** Create `configurator/` shell window and smoke test. Verify app launches without device.
- [x] **SCAFF-04** Create ESP-IDF project in `firmware/` with `pericles_core` component. Verify `idf.py build`.
- [x] **SCAFF-05** Add `firmware/profiles/esp32s3-n16r8.json` and `respeaker-xiao.json`. Verify schema validation.
- [x] **SCAFF-06** Add versioned schemas in `contracts/`: device config, profile, session, memory, and status. Verify valid/invalid fixtures.
- [x] **SCAFF-07** Generate or hand-code contract models in backend, configurator, and firmware. Verify round-trip fixture equality.
- [ ] **SCAFF-08** Add CI for contracts, backend, configurator, and both firmware builds. Verify workflow locally where possible.
