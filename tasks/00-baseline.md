# Phase 0 - Baseline Checkpoints

Rollback boundary: each task is a separate documentation or visual commit.

- [x] **BASE-01** Commit listening assets, `all-moods.svg`, previews, demo, `skins/README.md`, `USER_MANUAL.md`, and README state count. Verify: run the SVG/preview validator recorded in project memory and `git diff --check`.
- [x] **BASE-02** Commit only ReSpeaker changes in `PRD.md` and `PRD_DRAFT.md`. Verify: `git diff --cached --check` and confirm `8 MB flash + 8 MB PSRAM`.
- [x] **BASE-03** Commit `TASKS.md`, `PROJECT_STATE.md`, and `tasks/*.md`. Verify: all local Markdown links resolve.

Runtime harness: open `demo/index.html`, filter `Listening`, and inspect all five skins. ReSpeaker runtime is N/A until hardware-profile tasks.
