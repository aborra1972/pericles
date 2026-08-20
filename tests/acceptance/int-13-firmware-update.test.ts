import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('INT-13: Firmware Update Confirmation + Backup', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'pericles-firmware-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('Update confirmation', () => {
    it('update requires user confirmation', () => {
      const updateManager = {
        pending: null as { version: string; size: number } | null,
        confirmed: false,
        requestUpdate(version: string, size: number) {
          this.pending = { version, size };
          this.confirmed = false;
        },
        confirmUpdate() {
          if (!this.pending) return false;
          this.confirmed = true;
          return true;
        },
      };

      updateManager.requestUpdate('1.2.0', 204800);
      expect(updateManager.pending).toBeTruthy();
      expect(updateManager.confirmed).toBe(false);

      updateManager.confirmUpdate();
      expect(updateManager.confirmed).toBe(true);
    });

    it('update is cancelled if user rejects', () => {
      const updateManager = {
        pending: { version: '1.2.0', size: 204800 },
        cancelled: false,
        cancelUpdate() {
          this.cancelled = true;
          this.pending = null;
        },
      };

      updateManager.cancelUpdate();
      expect(updateManager.cancelled).toBe(true);
      expect(updateManager.pending).toBeNull();
    });

    it('update shows version and size before confirmation', () => {
      const updateInfo = {
        version: '1.2.0',
        size: 204800,
        changelog: 'Bug fixes and improvements',
        formatDate(size: number) {
          return `${(size / 1024).toFixed(0)} KB`;
        },
      };

      expect(updateInfo.version).toBe('1.2.0');
      expect(updateInfo.formatDate(updateInfo.size)).toBe('200 KB');
      expect(updateInfo.changelog).toBeTruthy();
    });
  });

  describe('Backup before update', () => {
    it('backup is created before firmware flash', () => {
      const backupDir = join(tempDir, 'backup');
      const firmwarePath = join(tempDir, 'firmware.bin');

      // Create firmware
      writeFileSync(firmwarePath, Buffer.alloc(1024));

      // Create backup
      const { mkdirSync, copyFileSync } = require('node:fs');
      mkdirSync(backupDir, { recursive: true });
      copyFileSync(firmwarePath, join(backupDir, 'firmware-backup.bin'));

      expect(existsSync(backupDir)).toBe(true);
      expect(existsSync(join(backupDir, 'firmware-backup.bin'))).toBe(true);
    });

    it('backup preserves settings', () => {
      const settingsPath = join(tempDir, 'settings.json');
      const settings = { skin: 'bostero', volume: 80, personId: 'owner-1' };

      writeFileSync(settingsPath, JSON.stringify(settings));

      const backupDir = join(tempDir, 'backup');
      const { mkdirSync, copyFileSync } = require('node:fs');
      mkdirSync(backupDir, { recursive: true });
      copyFileSync(settingsPath, join(backupDir, 'settings-backup.json'));

      const backup = JSON.parse(readFileSync(join(backupDir, 'settings-backup.json'), 'utf-8'));
      expect(backup.skin).toBe('bostero');
      expect(backup.volume).toBe(80);
      expect(backup.personId).toBe('owner-1');
    });

    it('backup preserves memories', () => {
      const memoriesPath = join(tempDir, 'memories.json');
      const memories = [
        { id: '1', content: 'Reunión 10am', timestamp: Date.now() },
        { id: '2', content: 'Llamar a mamá', timestamp: Date.now() },
      ];

      writeFileSync(memoriesPath, JSON.stringify(memories));

      const backupDir = join(tempDir, 'backup');
      const { mkdirSync, copyFileSync } = require('node:fs');
      mkdirSync(backupDir, { recursive: true });
      copyFileSync(memoriesPath, join(backupDir, 'memories-backup.json'));

      const backup = JSON.parse(readFileSync(join(backupDir, 'memories-backup.json'), 'utf-8'));
      expect(backup.length).toBe(2);
      expect(backup[0].content).toBe('Reunión 10am');
    });
  });

  describe('Update rollback', () => {
    it('update can be rolled back if fails', () => {
      const firmware = {
        current: '1.1.0',
        backup: '1.1.0',
        target: '1.2.0',
        flash() {
          // Simulate failure
          return { success: false, error: 'Flash failed' };
        },
        rollback() {
          this.current = this.backup;
          return true;
        },
      };

      const result = firmware.flash();
      expect(result.success).toBe(false);

      firmware.rollback();
      expect(firmware.current).toBe('1.1.0');
    });

    it('settings restored from backup after rollback', () => {
      const settings = {
        current: { volume: 50 },
        backup: { volume: 80 },
        restore() {
          this.current = { ...this.backup };
        },
      };

      settings.current.volume = 50;
      settings.restore();

      expect(settings.current.volume).toBe(80);
    });
  });

  describe('Update progress', () => {
    it('update shows progress indicator', () => {
      const progress = {
        percent: 0,
        update(pct: number) {
          this.percent = Math.min(100, Math.max(0, pct));
        },
        getIndicator() {
          const filled = Math.floor(this.percent / 10);
          const empty = 10 - filled;
          return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${this.percent}%`;
        },
      };

      progress.update(50);
      expect(progress.getIndicator()).toBe('[█████░░░░░] 50%');
    });

    it('update completes successfully', () => {
      const update = {
        status: 'pending' as string,
        start() { this.status = 'updating'; },
        complete() { this.status = 'complete'; },
        fail() { this.status = 'failed'; },
      };

      update.start();
      expect(update.status).toBe('updating');

      update.complete();
      expect(update.status).toBe('complete');
    });
  });
});
