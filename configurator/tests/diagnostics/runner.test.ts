import { describe, it, expect, beforeEach } from 'vitest';
import { DiagnosticResult, DiagnosticRunner } from '../../src/diagnostics/runner.js';

describe('DiagnosticRunner', () => {
  let runner: DiagnosticRunner;

  beforeEach(() => {
    runner = new DiagnosticRunner();
  });

  it('runs a diagnostic test', async () => {
    const result = await runner.run({
      name: 'test',
      test: async () => ({ pass: true, message: 'OK' }),
    });
    expect(result.status).toBe('pass');
    expect(result.message).toBe('OK');
  });

  it('handles failing diagnostic', async () => {
    const result = await runner.run({
      name: 'test',
      test: async () => ({ pass: false, message: 'Failed' }),
    });
    expect(result.status).toBe('fail');
    expect(result.message).toBe('Failed');
  });

  it('handles timeout', async () => {
    const result = await runner.run({
      name: 'test',
      timeoutMs: 1,
      test: async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return { pass: true, message: 'OK' };
      },
    });
    expect(result.status).toBe('timeout');
  });

  it('handles error', async () => {
    const result = await runner.run({
      name: 'test',
      test: async () => {
        throw new Error('Crash');
      },
    });
    expect(result.status).toBe('fail');
    expect(result.message).toContain('Crash');
  });

  it('runs multiple diagnostics', async () => {
    const results = await runner.runAll([
      { name: 'a', test: async () => ({ pass: true, message: 'A' }) },
      { name: 'b', test: async () => ({ pass: true, message: 'B' }) },
    ]);
    expect(results.length).toBe(2);
    expect(results.every((r) => r.status === 'pass')).toBe(true);
  });

  it('includes timestamp', async () => {
    const result = await runner.run({
      name: 'test',
      test: async () => ({ pass: true, message: 'OK' }),
    });
    expect(result.timestamp).toBeDefined();
    expect(new Date(result.timestamp).getTime()).toBeGreaterThan(0);
  });
});
