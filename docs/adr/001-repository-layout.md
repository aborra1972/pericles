# ADR-001: Repository Layout

## Status

Proposed

## Context

Pericles is a multi-component product: an online backend, a Linux configurator GUI, ESP-IDF firmware for two hardware variants, shared contracts, and acceptance tests. The repository must support independent development of each component while enabling shared schemas and integration testing.

## Decision

Adopt a monorepo with top-level component directories and shared contracts:

```
pericles/
├── backend/                 # Online backend (API, memory, AI provider)
│   ├── src/
│   ├── tests/
│   └── Dockerfile
├── configurator/            # Linux AppImage GUI
│   ├── src/
│   └── tests/
├── firmware/                # ESP-IDF project
│   ├── components/
│   │   └── pericles_core/   # Shared firmware component
│   ├── main/
│   ├── profiles/            # Hardware variant manifests
│   └── sdkconfig.defaults
├── contracts/               # Shared schemas (JSON Schema)
│   ├── device-config.schema.json
│   ├── hardware-profile.schema.json
│   ├── session.schema.json
│   ├── memory.schema.json
│   └── status.schema.json
├── tests/                   # Cross-component acceptance tests
│   └── acceptance/
├── docs/                    # Documentation and ADRs
│   └── adr/
├── skins/                   # Visual assets (existing)
├── demo/                    # Interactive gallery (existing)
├── previews/                # Contact sheets (existing)
├── TASKS.md                 # Implementation roadmap
├── PROJECT_STATE.md         # Active checkpoint
├── PRD.md                   # Product requirements
├── PRD_DRAFT.md             # Decision ledger
├── CHARACTER.md             # Canonical persona
└── USER_MANUAL.md           # User guide
```

## Rejected Alternatives

1. **Separate repositories per component**: Rejected because shared contracts would require a separate package/registry, adding deployment complexity. Monorepo keeps schema changes atomic.

2. **Single flat directory**: Rejected because backend, configurator, and firmware have different build systems (Go/Node, Electron/Tauri, ESP-IDF) and mixing source files creates confusion.

3. **Nx/Turborepo monorepo tooling**: Rejected for MVP. Overkill for three components with different ecosystems. Can adopt later if build coordination becomes painful.

## Consequences

- Each component has its own build system and test runner
- Shared contracts are JSON Schema files validated at build time
- CI runs component-specific checks on path-based triggers
- Firmware profiles live in `firmware/profiles/` (not `contracts/`) because they are firmware-specific
- Acceptance tests in `tests/acceptance/` verify cross-component behavior

## Test Strategy

- Unit tests within each component (`backend/tests/`, `configurator/tests/`)
- Contract validation: JSON Schema validation in CI for `contracts/*.schema.json`
- Acceptance tests: `tests/acceptance/` with fixtures for both hardware variants

## Rollback Boundary

This ADR defines directory structure only. No code depends on it yet. Reverting means moving files back to flat layout.
