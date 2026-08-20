import fs from 'node:fs/promises';
import path from 'node:path';

export interface TranscriptionPipelineOptions {
  tempDir: string;
  onDelete?: (filePath: string) => void;
}

export interface TranscribeOptions {
  shouldFail?: boolean;
}

export interface TranscriptionResult {
  text: string;
  duration: number;
  error?: string;
}

export class TranscriptionPipeline {
  private tempDir: string;
  private onDelete?: (filePath: string) => void;

  constructor(options: TranscriptionPipelineOptions) {
    this.tempDir = options.tempDir;
    this.onDelete = options.onDelete;
  }

  async transcribe(audioPath: string, options?: TranscribeOptions): Promise<TranscriptionResult> {
    // Check if file exists
    try {
      await fs.access(audioPath);
    } catch {
      return { text: '', duration: 0, error: 'File not found' };
    }

    // Find and clean up any partial files
    const baseName = path.basename(audioPath, path.extname(audioPath));
    const partialPath = path.join(this.tempDir, `${baseName}.partial`);

    try {
      await fs.access(partialPath);
      await fs.unlink(partialPath);
      this.onDelete?.(partialPath);
    } catch {
      // No partial file, that's fine
    }

    // Simulate transcription failure
    if (options?.shouldFail) {
      await this.cleanup(audioPath);
      throw new Error('Transcription failed');
    }

    // Simulate successful transcription
    await this.cleanup(audioPath);

    return {
      text: 'Mock transcription result',
      duration: 0,
    };
  }

  private async cleanup(audioPath: string): Promise<void> {
    try {
      await fs.unlink(audioPath);
      this.onDelete?.(audioPath);
    } catch {
      // File might already be deleted
    }
  }
}
