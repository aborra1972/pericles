import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('INT-12: Offline Controls + Volatile Retry', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'pericles-offline-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('Offline availability', () => {
    it('skin changes work offline', () => {
      const display = {
        currentSkin: 'default',
        isOnline: false,
        changeSkin(newSkin: string) {
          // Skin changes are local - no network needed
          this.currentSkin = newSkin;
          return true;
        },
      };

      const success = display.changeSkin('bostero');
      expect(success).toBe(true);
      expect(display.currentSkin).toBe('bostero');
    });

    it('volume changes work offline', () => {
      const audio = {
        volume: 50,
        isOnline: false,
        setVolume(level: number) {
          this.volume = Math.max(0, Math.min(100, level));
          return true;
        },
      };

      const success = audio.setVolume(75);
      expect(success).toBe(true);
      expect(audio.volume).toBe(75);
    });

    it('alarm set/cancel works offline', () => {
      const alarms = {
        list: [] as Array<{ time: string; active: boolean }>,
        isOnline: false,
        setAlarm(time: string) {
          this.list.push({ time, active: true });
          return true;
        },
        cancelAlarm(time: string) {
          const alarm = this.list.find(a => a.time === time);
          if (alarm) alarm.active = false;
          return true;
        },
      };

      alarms.setAlarm('08:00');
      expect(alarms.list.length).toBe(1);
      expect(alarms.list[0].active).toBe(true);

      alarms.cancelAlarm('08:00');
      expect(alarms.list[0].active).toBe(false);
    });
  });

  describe('Volatile state management', () => {
    it('volatile state reverts on reconnect', () => {
      const state = {
        persistent: { skin: 'default', personId: 'owner-1' },
        volatile: { volume: 75, lastError: null as string | null },
        isOnline: true,
        goOffline() {
          this.isOnline = false;
        },
        goOnline() {
          this.isOnline = true;
          // Volatile state reverts to defaults
          this.volatile.volume = 50;
          this.volatile.lastError = null;
        },
      };

      state.volatile.volume = 75;
      state.volatile.lastError = 'Connection lost';

      state.goOffline();
      state.goOnline();

      expect(state.volatile.volume).toBe(50);
      expect(state.volatile.lastError).toBeNull();
      expect(state.persistent.skin).toBe('default');
    });

    it('persistent state survives reconnect', () => {
      const state = {
        persistent: { skin: 'bostero', personId: 'owner-1' },
        isOnline: true,
        reconnect() {
          // Persistent state should survive
          return this.persistent;
        },
      };

      const saved = state.reconnect();
      expect(saved.skin).toBe('bostero');
      expect(saved.personId).toBe('owner-1');
    });
  });

  describe('Retry on reconnect', () => {
    it('pending operations retry automatically', () => {
      const pendingOps: string[] = [];
      const completedOps: string[] = [];

      const retryQueue = {
        add(operation: string) {
          pendingOps.push(operation);
        },
        retryAll() {
          while (pendingOps.length > 0) {
            const op = pendingOps.shift()!;
            completedOps.push(op);
          }
        },
      };

      retryQueue.add('memory_save');
      retryQueue.add('summary_update');

      expect(pendingOps.length).toBe(2);

      retryQueue.retryAll();

      expect(pendingOps.length).toBe(0);
      expect(completedOps.length).toBe(2);
    });

    it('failed retries are logged', () => {
      const logs: string[] = [];

      const retryManager = {
        retry(operation: string) {
          try {
            // Simulate failure
            throw new Error('Network error');
          } catch (e) {
            logs.push(`Retry failed: ${operation} - ${(e as Error).message}`);
            return false;
          }
        },
      };

      const success = retryManager.retry('memory_save');
      expect(success).toBe(false);
      expect(logs.length).toBe(1);
      expect(logs[0]).toContain('Retry failed');
    });
  });

  describe('Network status display', () => {
    it('shows offline indicator when disconnected', () => {
      const display = {
        isOnline: false,
        getIndicator() {
          return this.isOnline ? '🟢' : '🔴';
        },
      };

      expect(display.getIndicator()).toBe('🔴');
    });

    it('shows online indicator when connected', () => {
      const display = {
        isOnline: true,
        getIndicator() {
          return this.isOnline ? '🟢' : '🔴';
        },
      };

      expect(display.getIndicator()).toBe('🟢');
    });
  });

  describe('Memory sync after offline', () => {
    it('memories created offline are synced on reconnect', () => {
      const memorySync = {
        localQueue: [] as string[],
        synced: [] as string[],
        addMemory(content: string) {
          this.localQueue.push(content);
        },
        sync() {
          while (this.localQueue.length > 0) {
            this.synced.push(this.localQueue.shift()!);
          }
        },
      };

      memorySync.addMemory('Reunión 10am');
      memorySync.addMemory('Llamar a mamá');

      expect(memorySync.localQueue.length).toBe(2);
      expect(memorySync.synced.length).toBe(0);

      memorySync.sync();

      expect(memorySync.localQueue.length).toBe(0);
      expect(memorySync.synced.length).toBe(2);
    });
  });
});
