import { describe, it, expect } from 'vitest';
import { MockAIProvider } from '../../src/ai/mock-provider.js';

describe('MockAIProvider', () => {
  it('returns a deterministic response', async () => {
    const provider = new MockAIProvider();
    const response = await provider.chat({
      messages: [{ role: 'user', content: 'Hello' }],
    });
    expect(response.content).toBeDefined();
    expect(response.content.length).toBeGreaterThan(0);
  });

  it('returns same response for same input', async () => {
    const provider = new MockAIProvider();
    const r1 = await provider.chat({
      messages: [{ role: 'user', content: 'Hello' }],
    });
    const r2 = await provider.chat({
      messages: [{ role: 'user', content: 'Hello' }],
    });
    expect(r1.content).toBe(r2.content);
  });

  it('returns different responses for different inputs', async () => {
    const provider = new MockAIProvider();
    const r1 = await provider.chat({
      messages: [{ role: 'user', content: 'Hello' }],
    });
    const r2 = await provider.chat({
      messages: [{ role: 'user', content: 'Goodbye' }],
    });
    expect(r1.content).not.toBe(r2.content);
  });

  it('reports token usage', async () => {
    const provider = new MockAIProvider();
    const response = await provider.chat({
      messages: [{ role: 'user', content: 'Hello' }],
    });
    expect(response.usage).toBeDefined();
    expect(response.usage.promptTokens).toBeGreaterThanOrEqual(0);
    expect(response.usage.completionTokens).toBeGreaterThanOrEqual(0);
  });

  it('respects max tokens limit', async () => {
    const provider = new MockAIProvider();
    const response = await provider.chat({
      messages: [{ role: 'user', content: 'Hello' }],
      maxTokens: 10,
    });
    expect(response.usage.completionTokens).toBeLessThanOrEqual(10);
  });

  it('can simulate errors', async () => {
    const provider = new MockAIProvider({ shouldError: true });
    await expect(
      provider.chat({
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    ).rejects.toThrow('Mock error');
  });
});
