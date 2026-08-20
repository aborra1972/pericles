# Phase 1 - Architecture Decisions

Each ADR must state decision, rejected alternatives, consequences, test strategy, and rollback boundary.

- [x] **ADR-01** Create `docs/adr/001-repository-layout.md` for `backend/`, `configurator/`, `firmware/`, `contracts/`, and `tests/`. Verify links and tree.
- [x] **ADR-02** Create `docs/adr/002-technology-stack.md`; compare backend, GUI, and ESP-IDF options with a tiny build spike. Verify all three hello-world builds.
- [x] **ADR-03** Create `docs/adr/003-online-backend.md` defining deployment, config, health, and secrets. Verify local container health check.
- [x] **ADR-04** Create `docs/adr/004-memory-storage.md` for canonical Markdown plus indexed retrieval, tenant isolation, retention, and deletion. Verify sample query benchmark.
- [x] **ADR-05** Create `docs/adr/005-device-protocol.md` for HTTPS, temporary tokens, BLE pairing/control, and schema versioning. Verify sequence diagrams.
- [x] **ADR-06** Create `docs/adr/006-firmware-update.md` covering ESP32 USB recovery and XVF3800 I2C DFU/Safe Mode. Verify failure-state table.
- [x] **ADR-07** Create `docs/adr/007-hardware-profiles.md` defining common capabilities and variant pin/audio/display contracts. Verify both profile manifests.
- [x] **ADR-08** Create `docs/adr/008-ai-provider.md` defining OpenAI adapter and three stable quality profiles. Verify mock-provider contract test.
