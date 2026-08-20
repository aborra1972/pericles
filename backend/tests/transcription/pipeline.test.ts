import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TranscriptionPipeline } from '../../src/transcription/pipeline.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

describe('TranscriptionPipeline', () => {
  let pipeline: TranscriptionPipeline;
  let tempDir: string;
  const filesDeleted: string[] = [];

  beforeEach(async () => {
    vi.useFakeTimers();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pericles-transcribe-'));
    filesDeleted.length = 0;

    pipeline = new TranscriptionPipeline({
      tempDir,
      onDelete: (filePath) => {
        filesDeleted.push(filePath);
      },
    });
  });

  afterEach(async () => {
    vi.useRealTimers();
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('deletes source audio after successful transcription', async () => {
    const audioPath = path.join(tempDir, 'recording.wav');
    await fs.writeFile(audioPath, Buffer.from('fake-audio-data'));

    const result = await pipeline.transcribe(audioPath);

    expect(result.text).toBeDefined();
    expect(result.text.length).toBeGreaterThan(0);
    expect(filesDeleted).toContain(audioPath);
  });

  it('deletes audio even on transcription failure', async () => {
    const audioPath = path.join(tempDir, 'bad-recording.wav');
    await fs.writeFile(audioPath, Buffer.from('corrupt'));

    // Pipeline should attempt cleanup even if transcription fails
    try {
      await pipeline.transcribe(audioPath, { shouldFail: true });
    } catch {
      // Expected to throw
    }

    expect(filesDeleted).toContain(audioPath);
  });

  it('cleans up partial files on interruption', async () => {
    const audioPath = path.join(tempDir, 'interrupted.wav');
    const partialPath = path.join(tempDir, 'interrupted.partial');
    await fs.writeFile(audioPath, Buffer.from('audio'));
    await fs.writeFile(partialPath, Buffer.from('partial'));

    await pipeline.transcribe(audioPath);

    expect(filesDeleted).toContain(audioPath);
    expect(filesDeleted).toContain(partialPath);
  });

  it('returns transcription text', async () => {
    const audioPath = path.join(tempDir, 'speech.wav');
    await fs.writeFile(audioPath, Buffer.from('speech-data'));

    const result = await pipeline.transcribe(audioPath);

    expect(result.text).toBe('Mock transcription result');
    expect(result.duration).toBeGreaterThanOrEqual(0);
  });

  it('handles missing audio file gracefully', async () => {
    const result = await pipeline.transcribe('/nonexistent/file.wav');
    expect(result.text).toBe('');
    expect(result.error).toBeDefined();
  });
});
