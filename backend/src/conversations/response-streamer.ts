export interface StreamOptions {
  text: string;
  chunkSize?: number;
  delayMs?: number;
}

export interface ResponseStreamerOptions {
  maxDurationMs: number;
}

export class ResponseStreamer {
  private maxDurationMs: number;
  private streaming = false;

  constructor(options: ResponseStreamerOptions) {
    this.maxDurationMs = options.maxDurationMs;
  }

  async *stream(options: StreamOptions): AsyncGenerator<string> {
    if (!options.text) return;

    this.streaming = true;
    const chunkSize = options.chunkSize ?? 10;
    const delayMs = options.delayMs ?? 0;
    const startTime = Date.now();

    for (let i = 0; i < options.text.length; i += chunkSize) {
      if (Date.now() - startTime >= this.maxDurationMs) {
        break;
      }

      yield options.text.slice(i, i + chunkSize);

      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    this.streaming = false;
  }

  isStreaming(): boolean {
    return this.streaming;
  }
}
