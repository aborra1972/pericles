import { describe, it, expect } from 'vitest';
import { ResponseStreamer } from '../../src/conversations/response-streamer.js';

describe('ResponseStreamer', () => {
  it('streams text chunks', async () => {
    const streamer = new ResponseStreamer({ maxDurationMs: 5000 });
    const chunks: string[] = [];
    const stream = streamer.stream({
      text: 'Hello world',
      chunkSize: 5,
    });

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    expect(chunks.join('')).toBe('Hello world');
  });

  it('enforces max duration', async () => {
    const streamer = new ResponseStreamer({ maxDurationMs: 10 });
    const chunks: string[] = [];
    const stream = streamer.stream({
      text: 'A'.repeat(1000),
      chunkSize: 1,
      delayMs: 1,
    });

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    // Should have been cut short due to max duration
    expect(chunks.length).toBeLessThan(1000);
    expect(chunks.length).toBeGreaterThan(0);
  });

  it('handles empty text', async () => {
    const streamer = new ResponseStreamer({ maxDurationMs: 5000 });
    const chunks: string[] = [];
    const stream = streamer.stream({ text: '' });

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    expect(chunks.length).toBe(0);
  });

  it('reports streaming state', () => {
    const streamer = new ResponseStreamer({ maxDurationMs: 5000 });
    expect(streamer.isStreaming()).toBe(false);
  });

  it('splits text into correct chunk sizes', async () => {
    const streamer = new ResponseStreamer({ maxDurationMs: 5000 });
    const chunks: string[] = [];
    const stream = streamer.stream({ text: 'ABCDEF', chunkSize: 2 });

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual(['AB', 'CD', 'EF']);
  });
});
