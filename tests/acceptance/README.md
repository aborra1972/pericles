# Acceptance Test Suite

This directory contains acceptance tests for the Pericles MVP. Each test maps to an Acceptance Criterion (AC) defined in the PRD.

## Acceptance Criteria Mapping

| AC | Test ID | Description | Fixtures | Evidence | Status |
|----|---------|-------------|----------|----------|--------|
| AC-01 | INT-02 | Onboarding under 10 minutes | Clean Linux machine, `npm install` | Screenshot of terminal, timestamp | ⏳ |
| AC-02 | INT-03 | Profile/firmware mismatch detection | ESP32-S3 + ReSpeaker profiles | Mismatch error screenshot | ⏳ |
| AC-03 | INT-04 | Listening render <500ms | Action button press, timestamp | Latency measurement | ⏳ |
| AC-04 | INT-05 | Response start <2s | Network fixture (100ms latency) | Response time measurement | ⏳ |
| AC-05 | INT-06 | 90% transcription accuracy | Quiet-room corpus (100 sentences) | Accuracy report | ⏳ |
| AC-06 | INT-07 | Audio capture/deletion | Test audio file, transcription | File system audit | ⏳ |
| AC-07 | INT-08 | Guest mode no persistence | Guest session, memory search | Engram query results | ⏳ |
| AC-08 | INT-09 | Owner-only export/delete | Guest + Owner tokens | Permission test results | ⏳ |
| AC-09 | INT-10 | Five skins rendering | Skin SVGs (5 skins × 8 states) | Screenshot gallery | ⏳ |
| AC-10 | INT-11 | Summary first session + on demand | Conversation session | Summary output | ⏳ |
| AC-11 | INT-12 | Offline controls + retry | Network disconnect test | Retry queue audit | ⏳ |
| AC-12 | INT-13 | Firmware update flow | ESP32-S3 + ReSpeaker | Update logs, backup files | ⏳ |
| AC-13 | INT-14 | Support bundles + opt-in error | Error scenarios | Bundle contents audit | ⏳ |

## Test Structure

Each test follows this structure:

```
tests/acceptance/
├── README.md                 # This file
├── fixtures/                 # Test data and configurations
│   ├── network/              # Network simulation configs
│   ├── audio/                # Audio corpus for transcription
│   └── profiles/             # Hardware profile fixtures
├── evidence/                 # Test evidence storage
│   ├── screenshots/          # UI screenshots
│   ├── logs/                 # System logs
│   └── reports/              # Generated reports
└── scripts/                  # Test automation scripts
    ├── onboarding.sh         # INT-02 test script
    ├── mismatch.sh           # INT-03 test script
    └── ...
```

## Running Tests

### Prerequisites

1. Node.js 20+ installed
2. npm workspaces configured
3. Backend running (`npm run dev:backend`)
4. Configurator installed (`npm run build:configurator`)
5. ESP-IDF v5.4 (for firmware tests)

### Manual Tests

Most acceptance tests require manual verification:

1. Follow the test steps exactly
2. Capture evidence (screenshots, logs, measurements)
3. Store in `evidence/` directory
4. Update this README with results

### Automated Tests

Some tests can be partially automated:

```bash
# INT-02: Onboarding timing
./scripts/onboarding.sh

# INT-03: Profile mismatch
./scripts/mismatch.sh
```

## Evidence Requirements

Each test must provide:

1. **Timestamp**: When the test was executed
2. **Environment**: OS, Node.js version, network conditions
3. **Steps**: Exact reproduction steps
4. **Expected**: What should happen
5. **Actual**: What actually happened
6. **Artifacts**: Screenshots, logs, measurements
7. **Verdict**: PASS / FAIL / BLOCKED

## Test Environment

### Minimum Requirements

- **OS**: Ubuntu 22.04+ or equivalent
- **Node.js**: 20.x LTS
- **RAM**: 8GB
- **Disk**: 10GB free
- **Network**: 100Mbps+ (for latency tests)

### Hardware Requirements

- **ESP32-S3 N16R8**: For integrated variant tests
- **ReSpeaker + XIAO**: For ReSpeaker variant tests
- **USB-C cable**: For firmware flashing
- **Speaker**: For audio playback tests (optional for MVP)

## Status Legend

- ⏳ Pending
- 🔄 In Progress
- ✅ Passed
- ❌ Failed
- ⏸️ Blocked (missing hardware)

## Notes

- Audio tests (INT-04, INT-05, INT-06) require actual hardware
- INT-04 and INT-05 can be partially simulated with mocks
- INT-13 requires firmware update files (not included in MVP)
