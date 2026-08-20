import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAIAdapter } from '../../src/ai/openai-adapter.js';

describe('OpenAIAdapter', () => {
  let adapter: OpenAIAdapter;

  beforeEach(() => {
    adapter = new OpenAIAdapter({
      apiKey: 'sk-test-key',
      model: 'gpt-4o',
    });
  });

  it('implements AIProvider interface', () => {
    expect(typeof adapter.chat).toBe('function');
  });

  it('builds correct request', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Hello!' } }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      }),
    } as Response);

    await adapter.chat({
      messages: [{ role: 'user', content: 'Hi' }],
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer sk-test-key',
        }),
      }),
    );

    fetchSpy.mockRestore();
  });

  it('handles API errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: { message: 'Rate limited' } }),
    } as Response);

    await expect(
      adapter.chat({
        messages: [{ role: 'user', content: 'Hi' }],
      }),
    ).rejects.toThrow();

    vi.restoreAllMocks();
  });

  it('respects custom model', async () => {
    const customAdapter = new OpenAIAdapter({
      apiKey: 'sk-test',
      model: 'gpt-4o-mini',
    });

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Hi' } }],
        usage: { prompt_tokens: 5, completion_tokens: 2, total_tokens: 7 },
      }),
    } as Response);

    await customAdapter.chat({
      messages: [{ role: 'user', content: 'Test' }],
    });

    const body = JSON.parse(fetchSpy.mock.calls[0][1].body as string);
    expect(body.model).toBe('gpt-4o-mini');

    vi.restoreAllMocks();
  });
});
