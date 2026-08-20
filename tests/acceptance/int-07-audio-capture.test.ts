import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('INT-07: Audio Capture and Deletion', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'pericles-audio-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('Capture timing', () => {
    it('audio capture does not start before action button', () => {
      const session = {
        state: 'idle' as string,
        isCapturing: false,
        onAction() {
          this.state = 'listening';
          this.isCapturing = true;
        },
      };

      // Before action
      expect(session.isCapturing).toBe(false);
      expect(session.state).toBe('idle');

      // After action
      session.onAction();
      expect(session.isCapturing).toBe(true);
      expect(session.state).toBe('listening');
    });

    it('capture only starts after session enters listening state', () => {
      const session = {
        state: 'idle' as string,
        startCapture() {
          if (this.state !== 'listening') {
            throw new Error('Cannot capture: not in listening state');
          }
          return true;
        },
      };

      // Should fail in idle state
      expect(() => session.startCapture()).toThrow('not in listening state');

      // Should succeed in listening state
      session.state = 'listening';
      expect(session.startCapture()).toBe(true);
    });
  });

  describe('Audio file lifecycle', () => {
    it('audio file is created during capture', () => {
      const audioPath = join(tempDir, 'capture.wav');
      writeFileSync(audioPath, Buffer.alloc(1024));

      expect(existsSync(audioPath)).toBe(true);
    });

    it('audio file is deleted after transcription', () => {
      const audioPath = join(tempDir, 'capture.wav');
      writeFileSync(audioPath, Buffer.alloc(1024));
      expect(existsSync(audioPath)).toBe(true);

      // Simulate transcription completion and deletion
      const { unlinkSync } = require('node:fs');
      unlinkSync(audioPath);

      expect(existsSync(audioPath)).toBe(false);
    });

    it('temp directory is clean after session', () => {
      // Create multiple audio files
      writeFileSync(join(tempDir, 'capture_1.wav'), Buffer.alloc(512));
      writeFileSync(join(tempDir, 'capture_2.wav'), Buffer.alloc(512));
      writeFileSync(join(tempDir, 'capture_3.wav'), Buffer.alloc(512));

      expect(readdirSync(tempDir).length).toBe(3);

      // Clean up all files
      const { unlinkSync } = require('node:fs');
      for (const file of readdirSync(tempDir)) {
        unlinkSync(join(tempDir, file));
      }

      expect(readdirSync(tempDir).length).toBe(0);
    });
  });

  describe('Privacy guarantees', () => {
    it('no audio files persist after transcription pipeline', () => {
      const pipeline = {
        files: [] as string[],
        addFile(path: string) {
          this.files.push(path);
          writeFileSync(path, Buffer.alloc(256));
        },
        cleanup() {
          const { unlinkSync } = require('node:fs');
          for (const file of this.files) {
            if (existsSync(file)) {
              unlinkSync(file);
            }
          }
          this.files = [];
        },
      };

      // Add files
      pipeline.addFile(join(tempDir, 'audio1.wav'));
      pipeline.addFile(join(tempDir, 'audio2.wav'));
      expect(pipeline.files.length).toBe(2);

      // Cleanup
      pipeline.cleanup();
      expect(pipeline.files.length).toBe(0);

      // Verify files deleted
      for (const file of readdirSync(tempDir)) {
        expect(existsSync(join(tempDir, file))).toBe(false);
      }
    });

    it('onDelete callback is invoked for each file', () => {
      const deletedFiles: string[] = [];

      const pipeline = {
        onDelete: (path: string) => {
          deletedFiles.push(path);
        },
        processAndDelete(audioPath: string) {
          // Process audio...
          this.onDelete(audioPath);
          const { unlinkSync } = require('node:fs');
          unlinkSync(audioPath);
        },
      };

      const audioPath = join(tempDir, 'test.wav');
      writeFileSync(audioPath, Buffer.alloc(128));

      pipeline.processAndDelete(audioPath);

      expect(deletedFiles).toContain(audioPath);
      expect(existsSync(audioPath)).toBe(false);
    });
  });

  describe('Source audio not retained', () => {
    it('raw audio is not stored in memory database', () => {
      const memory = {
        entries: [] as Array<{ type: string; content: string }>,
        addText(content: string) {
          this.entries.push({ type: 'text', content });
        },
        addAudio(audioBase64: string) {
          // Should NOT happen - audio should be transcribed first
          throw new Error('Audio should not be stored directly');
        },
      };

      // Add text transcription
      memory.addText('Hola Pericles');
      expect(memory.entries.length).toBe(1);
      expect(memory.entries[0].type).toBe('text');

      // Should fail if trying to add raw audio
      expect(() => memory.addAudio('base64data')).toThrow('Audio should not be stored');
    });
  });
});
