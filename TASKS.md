# Pericles MVP - Implementation Tasks

This is the execution index for [`PRD.md`](PRD.md). Always resume from [`PROJECT_STATE.md`](PROJECT_STATE.md) and work on only one task at a time.

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 3,000+ |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Delivery strategy | ask-on-risk, resolved |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

## Work Units

| Phase | Tasks | Goal | Plan |
|-------|-------|------|------|
| 0 | 3 | Preserve current assets and requirements | [`tasks/00-baseline.md`](tasks/00-baseline.md) |
| 1 | 8 | Decide architecture before code | [`tasks/01-architecture.md`](tasks/01-architecture.md) |
| 2 | 8 | Scaffold monorepo and contracts | [`tasks/02-scaffold-contracts.md`](tasks/02-scaffold-contracts.md) |
| 3 | 28 | Build backend vertical slices | [`tasks/03-backend.md`](tasks/03-backend.md) |
| 4 | 20 | Build Linux configurator | [`tasks/04-linux-app.md`](tasks/04-linux-app.md) |
| 5 | 20 | Build shared ESP-IDF firmware | [`tasks/05-firmware-core.md`](tasks/05-firmware-core.md) |
| 6 | 13 | Support both hardware profiles | [`tasks/06-hardware-profiles.md`](tasks/06-hardware-profiles.md) |
| 7 | 15 | Integrate and prove MVP criteria | [`tasks/07-integration-acceptance.md`](tasks/07-integration-acceptance.md) |

## Execution Rules

1. Read only `PROJECT_STATE.md`, this index, and the active phase file.
2. Mark the active task `[~]`; never run two tasks concurrently.
3. Finish its verification before marking `[x]`.
4. Record command, result, files, commit, and next task in `PROJECT_STATE.md`.
5. Keep each task and its tests in one reviewable commit.
6. Phase-2 features remain deferred: files, Gmail, ntfy, timers, and alarms.
