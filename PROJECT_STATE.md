# Pericles Project State

## Current Checkpoint

| Field | Value |
|-------|-------|
| Status | Phase 4 In Progress |
| Active task | `GUI-19` |
| Last completed | `GUI-18` |
| Blocker | None |
| Branch | `main` |
| Delivery strategy | Stacked PRs merged sequentially to `main` |

## Resume Protocol

1. Run `git status --short --branch`.
2. Read `TASKS.md` and the file containing the active task.
3. Confirm the active task's dependencies are `[x]`.
4. Change only files named by that task.
5. Run its exact verification command.
6. Update this file before committing or ending the session.

## Delivered Baseline

- Listening assets and complete eight-state visual surfaces: `fa8657a`.
- ReSpeaker XVF3800 + XIAO ESP32-S3R8 requirements: `0c76b69`.
- Existing mood assets remained unchanged; only overview files were replaced.

## Evidence Log

| Task | Result | Verification | Commit |
|------|--------|--------------|--------|
| BASE-01 | PASS | 50 SVGs; 5×8 contracts; 40 overview refs; 5 previews | `fa8657a` |
| BASE-02 | PASS | PRD specifies 8 MB flash + 8 MB PSRAM | `0c76b69` |
| BASE-03 | PASS | 115 unique IDs; 10 task documents; links valid | planning commit |
| ADR-01 | PASS | 10 directories checked; links valid | pending |
| ADR-02 | PASS | Backend build OK; Configurator build OK; Firmware structure OK | pending |
| ADR-03 | PASS | Health endpoints respond; config fail-fast verified; .env.example created | pending |
| ADR-04 | PASS | Schema defined; retrieval strategy documented; retention/deletion/export covered | pending |
| ADR-05 | PASS | BLE pairing flow; JWT auth; URI versioning; WebSocket streaming | pending |
| ADR-06 | PASS | USB-C flash; backup/restore; safe mode; XVF3800 DFU; version mgmt | pending |
| ADR-07 | PASS | Two profile manifests; capability API; auto-detection; display/audio abstraction | pending |
| ADR-08 | PASS | Provider adapter; 3 quality profiles; retry strategy; offline fallback | pending |
| SCAFF-01 | PASS | npm workspaces; .editorconfig; build/test scripts; backend builds | pending |
| SCAFF-02 | PASS | health.ts module; 2 Vitest tests pass; server.ts refactored | pending |
| SCAFF-03 | PASS | Electron main.ts; index.html; smoke test passes | pending |
| SCAFF-04 | PASS | ESP-IDF project structure; pericles_core component; sdkconfig.defaults | pending |
| SCAFF-05 | PASS | Two profile manifests in firmware/profiles/ | pending |
| SCAFF-06 | PASS | 5 JSON schemas; valid+invalid fixtures; 15 tests pass | pending |
| SCAFF-07 | PASS | contracts/src/types.ts; 20 tests pass (schemas + round-trip) | pending |
| SCAFF-08 | PASS | GitHub Actions CI defined locally; PAT lacks `workflow` scope to push | pending |
| BE-01 | PASS | loadConfig(); ConfigError on missing secrets; 9 tests pass | pending |
| BE-02 | PASS | RED tests for email codes and owner sessions | pending |
| BE-03 | PASS | EmailCodeStore with expiration and consumption | pending |
| BE-04 | PASS | OwnerSessionStore with HMAC tokens; 25 tests total | pending |
| BE-05 | PASS | RED tests for device tokens and cross-device access | pending |
| BE-06 | PASS | DeviceTokenStore with cross-device prevention; 33 tests total | pending |
| BE-07 | PASS | ApiKeyStore with AES-256-CBC encryption; 40 tests total | pending |
| BE-08 | PASS | ScopedTokenStore with scope enforcement; 48 tests total | pending |
| BE-09 | PASS | RED tests for guest persistence and duplicate names | pending |
| BE-10 | PASS | PersonStore with role-based write control; 57 tests total | pending |
| BE-11 | PASS | Name disambiguation with positional numbering; 63 tests total | pending |
| BE-12 | PASS | ProfileManager with owner-only export/delete; 69 tests total | pending |
| BE-13 | PASS | MarkdownMemoryRepo with frontmatter; 77 tests total | pending |
| BE-14 | PASS | Memory schema v0→v1 migration; 82 tests total | pending |
| BE-15 | PASS | MemorySearchIndex with ranked retrieval; 90 tests total | pending |
| BE-16 | PASS | MemoryQuota with retention and per-person limits; 96 tests total | pending |
| BE-17 | PASS | AIProvider interface + MockAIProvider; 102 tests total | pending |
| BE-18 | PASS | OpenAIAdapter with mocked HTTP; 106 tests total | pending |
| BE-19 | PASS | Quality profiles with backend remapping; 111 tests total | pending |
| BE-20 | PASS | ConversationManager with timeout and explicit close; 118 tests total | pending |
| BE-21 | PASS | ContextLoader with person isolation and search; 123 tests total | pending |
| BE-22 | PASS | ResponseStreamer with chunked streaming and duration; 128 tests total | pending |
| BE-23 | PASS | RED tests for audio deletion after transcription | pending |
| BE-24 | PASS | TranscriptionPipeline with ephemeral cleanup; 133 tests total | pending |
| BE-25 | PASS | DailySummaryOrchestrator with category toggles; 139 tests total | pending |
| BE-26 | PASS | FakeCalendarAdapter with token refresh; 144 tests total | pending |
| BE-27 | PASS | Fake weather/news/Boca adapters; 150 tests total | pending |
| BE-28 | PASS | DeviceConfigStore with support bundles; 157 tests total | pending |
| GUI-01 | PASS | ShellRouter with 7 routes and navigation history; 8 configurator tests | pending |
| GUI-02 | PASS | RED tests for USB device detection and profile mismatch | pending |
| GUI-03 | PASS | DeviceDetector with ESP32-S3 and ReSpeaker support | pending |
| GUI-04 | PASS | Profile mismatch detection; 14 configurator tests total | pending |
| GUI-05 | PASS | EmailCodeLogin with verification and session management | pending |
| GUI-06 | PASS | Bind, relink, logout flows; 21 configurator tests total | pending |
| GUI-07 | PASS | PersonalitySettings with JSON round-trip; 27 configurator tests total | pending |
| GUI-08 | PASS | VoiceSettings with preview and speed validation; 33 configurator tests total | pending |
| GUI-09 | PASS | MemorySettings with retention and category toggles; 39 configurator tests total | pending |
| GUI-10 | PASS | SkinManager with 5 skins and 8 states; 46 configurator tests total | pending |
| GUI-11 | PASS | DiagnosticRunner with pass/fail/timeout; 52 configurator tests total | pending |
| GUI-12 | PASS | Mic, speaker, display, button diagnostics mocked | pending |
| GUI-13 | PASS | WiFi, BLE, OpenAI, XVF3800 diagnostics; 58 configurator tests total | pending |
| GUI-14 | PASS | ConfigBackup with checksum and clone; 66 configurator tests total | pending |
| GUI-15 | PASS | FactoryReset with double confirmation; 73 configurator tests total | pending |
| GUI-16 | PASS | FirmwareFlash with error handling; 79 configurator tests total | pending |
| GUI-17 | PASS | EspFlashWorkflow with backup/flash/verify/reboot; 93 configurator tests total | pending |
| GUI-18 | PASS | XvfDfu with I2C DFU flow; 100 configurator tests total | pending |

## Next Action

Execute `GUI-19` from [`tasks/04-linux-app.md`](tasks/04-linux-app.md).
