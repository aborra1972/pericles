# ADR-006: Firmware Update

## Status

Proposed

## Context

Pericles has two firmware components that can be updated independently:
1. **ESP32-S3** main MCU firmware (voice, display, connectivity)
2. **XVF3800** audio processor firmware (microphone array, AEC, beamforming)

The PRD mandates:
- "A failed update must not leave the device unusable" (safe recovery)
- "Create a backup and verify the image before updating"
- "Guide recovery if an update fails"
- "Onboarding and firmware update without terminal"
- Factory restore option

Two hardware variants exist (ADR-001):
- **Integrated**: ESP32-S3 N16R8 (single chip, USB-C flashing)
- **ReSpeaker**: XVF3800 + XIAO ESP32-S3R8 (two chips, USB-C + I2C DFU)

## Decision

### Update Mechanism: USB-C Flashing (MVP)

**Chosen**: USB-C flashing via the Electron configurator using `esptool.py`.

**Alternatives considered**:
- **OTA (Over-the-Air)**: Rejected for MVP — requires working WiFi + backend; adds complexity of delta updates, signature verification, rollback partitions. Planned for post-MVP.
- **BLE DFU**: Rejected — ESP32 BLE DFU is slow (~5 KB/s); impractical for firmware images >500 KB

**Rationale**:
- USB-C is always available (the device is connected during setup)
- `esptool.py` is battle-tested and works over USB
- The Electron configurator can shell out to `esptool.py` or use its Python API
- No network dependency for updates
- Fast: full 16 MB flash in ~30 seconds over USB

### Update Flow

```
1. User clicks "Update Firmware" in configurator
2. Configurator downloads firmware image from backend (or local file)
3. Configurator verifies image checksum (SHA-256)
4. Configurator creates backup of current firmware + config
5. User confirms update with explicit "Update" button
6. Configurator puts device in download mode (EN + BOOT buttons)
7. Configurator flashes firmware via esptool.py
8. Device reboots into new firmware
9. Configurator verifies firmware version matches expected
10. If verification fails → guided recovery
```

### Backup Strategy

Before any firmware update, the configurator creates a backup:

```
backups/
  {device-id}/
    {timestamp}/
      firmware.bin          # Full flash image (16 MB)
      config.json           # Device configuration
      manifest.json         # Backup metadata
```

**manifest.json**:

```json
{
  "device_id": "a1b2c3d4",
  "firmware_version": "1.2.0",
  "backup_date": "2025-08-20T14:30:00Z",
  "flash_size": "16MB",
  "sha256": "abc123...",
  "hardware_variant": "reSpeaker"
}
```

Backup is verified before proceeding:
1. Read back the flashed image
2. Compare SHA-256 checksum
3. If mismatch → abort, do not proceed

### Safe Mode and Recovery

**Safe Mode triggers**:
- Firmware image fails verification after flash
- Device crashes 3 times in a row (boot loop detection)
- User manually enters safe mode (hold BOOT button during power-on)

**Safe Mode behavior**:
- Display shows "Modo seguro" with QR code linking to recovery docs
- Device exposes USB serial port with diagnostic output
- BLE advertising continues (for configurator to discover and rescue)
- No AI, no WiFi, no memory access — minimal functionality only

**Recovery flow**:

```
1. Device enters safe mode (automatic or manual)
2. Configurator detects device in safe mode via BLE
3. Configurator offers: "Restore previous firmware" or "Factory reset"
4. If restore: flash the backup firmware.bin from backups/
5. If factory reset: flash the latest stable release from backend
6. Device reboots into recovered firmware
7. Configurator verifies version and restores config from backup
```

### XVF3800 Firmware Update (I2C DFU)

The XVF3800 audio processor has its own firmware, updated via I2C from the ESP32.

**Update flow**:

```
1. Backend provides XVF3800 firmware binary + version
2. ESP32 receives binary via HTTPS (chunked transfer)
3. ESP32 puts XVF3800 in DFU mode via I2C command
4. ESP32 writes firmware to XVF3800 via I2C
5. XVF3800 reboots
6. ESP32 verifies XVF3800 version via I2C query
7. If verification fails → retry once, then enter safe mode
```

**XVF3800 safe mode**:
- Audio processing falls back to raw I2S (no AEC, no beamforming)
- Display shows "Audio en modo seguro"
- Device is still usable for conversation (degraded audio quality)

### Version Management

| Component | Version Format | Source of Truth |
|-----------|---------------|-----------------|
| ESP32 firmware | `MAJOR.MINOR.PATCH` | `firmware/version.txt` in repo |
| XVF3800 firmware | `MAJOR.MINOR.PATCH` | `firmware/xvf3800/version.txt` in repo |
| Config schema | `MAJOR.MINOR` | `contracts/config-schema.json` |

**Version check on boot**:
1. ESP32 reads its own version from compiled-in constant
2. ESP32 queries XVF3800 version via I2C
3. Both versions reported to backend on next connection
4. Backend compares against latest available versions
5. If outdated → configurator shows "Update available" badge

### Config Schema Versioning

Configuration format may change between firmware versions. The config schema version is independent of firmware version.

**Migration strategy**:
- Each firmware version declares which config schema versions it supports
- On boot, if config schema is older → migrate in-place (add missing fields with defaults)
- If config schema is newer → ignore unknown fields, use defaults
- Config backup includes schema version for rollback

## Consequences

- **USB-only for MVP**: no OTA means the device must be physically connected for updates. Acceptable for a single-user personal device.
- **Two-chip update**: ReSpeaker variant requires coordinated ESP32 + XVF3800 updates. The configurator handles both in sequence.
- **Backup is mandatory**: no update proceeds without a verified backup. This is the primary safety net.
- **Safe mode is minimal**: enough to be rescued, not enough to be useful. Incentivizes quick recovery.
- **Post-MVP**: OTA updates add convenience. The USB recovery path remains as a fallback.

## Test Strategy

- Flash cycle: flash firmware → verify version → flash again → verify no corruption
- Backup/restore: create backup → flash different firmware → restore backup → verify original version
- Safe mode: simulate boot loop → verify safe mode activates → verify recovery works
- XVF3800 DFU: update XVF3800 → verify version → simulate failure → verify fallback
- Config migration: load old config → verify migration → verify defaults for new fields

## Rollback Boundary

This ADR defines the update mechanism and recovery strategy. Reverting means choosing a different update method (e.g., OTA-first) and rewriting the configurator's update flow.
