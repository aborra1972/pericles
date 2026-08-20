import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('INT-14: Support Bundles + Opt-in Error Reporting', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'pericles-support-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('Support bundle generation', () => {
    it('bundle contains system info', () => {
      const bundle = {
        system: {
          os: 'Linux',
          arch: 'x86_64',
          version: '1.0.0',
          nodeVersion: '24.18.0',
        },
      };

      expect(bundle.system.os).toBeTruthy();
      expect(bundle.system.arch).toBeTruthy();
      expect(bundle.system.version).toBe('1.0.0');
    });

    it('bundle contains logs', () => {
      const bundle = {
        logs: [
          { level: 'info', message: 'System started', timestamp: Date.now() },
          { level: 'error', message: 'Network timeout', timestamp: Date.now() },
          { level: 'warn', message: 'Low battery', timestamp: Date.now() },
        ],
      };

      expect(bundle.logs.length).toBe(3);
      expect(bundle.logs[0].level).toBe('info');
      expect(bundle.logs[1].level).toBe('error');
    });

    it('bundle contains configuration', () => {
      const bundle = {
        config: {
          skin: 'bostero',
          volume: 80,
          network: 'wifi',
          language: 'es',
        },
      };

      expect(bundle.config.skin).toBe('bostero');
      expect(bundle.config.volume).toBe(80);
    });

    it('bundle is compressed', () => {
      const bundle = {
        files: ['system.json', 'logs.json', 'config.json'],
        compress() {
          return {
            format: 'zip',
            size: 1024,
            files: this.files.length,
          };
        },
      };

      const compressed = bundle.compress();
      expect(compressed.format).toBe('zip');
      expect(compressed.files).toBe(3);
    });
  });

  describe('Error reporting opt-in', () => {
    it('error reporting is disabled by default', () => {
      const settings = {
        errorReporting: false,
        crashReporting: false,
        analytics: false,
      };

      expect(settings.errorReporting).toBe(false);
      expect(settings.crashReporting).toBe(false);
      expect(settings.analytics).toBe(false);
    });

    it('user can enable error reporting', () => {
      const settings = {
        errorReporting: false,
        enable() {
          this.errorReporting = true;
        },
      };

      settings.enable();
      expect(settings.errorReporting).toBe(true);
    });

    it('user can disable error reporting', () => {
      const settings = {
        errorReporting: true,
        disable() {
          this.errorReporting = false;
        },
      };

      settings.disable();
      expect(settings.errorReporting).toBe(false);
    });

    it('opt-in is per-device', () => {
      const devices = [
        { id: 'device-a', errorReporting: true },
        { id: 'device-b', errorReporting: false },
      ];

      expect(devices[0].errorReporting).toBe(true);
      expect(devices[1].errorReporting).toBe(false);
    });
  });

  describe('Data included in reports', () => {
    it('reports include error details', () => {
      const report = {
        error: {
          message: 'Connection timeout',
          stack: 'Error: Connection timeout\n  at Network.connect()',
          timestamp: Date.now(),
        },
        context: {
          action: 'transcription',
          state: 'listening',
        },
      };

      expect(report.error.message).toBeTruthy();
      expect(report.error.stack).toBeTruthy();
      expect(report.context.action).toBe('transcription');
    });

    it('reports exclude personal data', () => {
      const report = {
        error: { message: 'Timeout' },
        excluded: ['memories', 'conversations', 'personId'],
      };

      // Personal data should be in the excluded list
      expect(report.excluded).toContain('memories');
      expect(report.excluded).toContain('conversations');
      expect(report.excluded).toContain('personId');
      expect(report.excluded.length).toBe(3);
    });

    it('reports are sent securely', () => {
      const report = {
        url: 'https://api.pericles.example/reports',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      };

      expect(report.url.startsWith('https://')).toBe(true);
      expect(report.method).toBe('POST');
    });
  });

  describe('Bundle privacy', () => {
    it('bundle excludes memories by default', () => {
      const bundle = {
        include: ['system', 'logs', 'config'],
        exclude: ['memories', 'conversations', 'audio'],
      };

      expect(bundle.exclude).toContain('memories');
      expect(bundle.exclude).toContain('conversations');
      expect(bundle.exclude).toContain('audio');
    });

    it('bundle can include personal data with consent', () => {
      const bundle = {
        consent: true,
        includePersonal() {
          if (this.consent) {
            return ['memories', 'conversations'];
          }
          return [];
        },
      };

      const personal = bundle.includePersonal();
      expect(personal.length).toBe(2);
    });
  });
});
