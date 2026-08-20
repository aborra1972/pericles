import { describe, it, expect, beforeEach } from 'vitest';
import { ServiceDiagnostics } from '../../src/diagnostics/services.js';

describe('ServiceDiagnostics', () => {
  let diagnostics: ServiceDiagnostics;

  beforeEach(() => {
    diagnostics = new ServiceDiagnostics();
  });

  it('tests WiFi connectivity', async () => {
    const result = await diagnostics.testWifi();
    expect(result.name).toBe('wifi');
    expect(['pass', 'fail']).toContain(result.status);
  });

  it('tests BLE availability', async () => {
    const result = await diagnostics.testBle();
    expect(result.name).toBe('ble');
    expect(['pass', 'fail']).toContain(result.status);
  });

  it('tests OpenAI API key', async () => {
    const result = await diagnostics.testOpenAI('sk-test');
    expect(result.name).toBe('openai');
    expect(['pass', 'fail']).toContain(result.status);
  });

  it('tests XVF3800 connection', async () => {
    const result = await diagnostics.testXvf3800();
    expect(result.name).toBe('xvf3800');
    expect(['pass', 'fail']).toContain(result.status);
  });

  it('runs all service diagnostics', async () => {
    const results = await diagnostics.runAll();
    expect(results.length).toBe(4);
    expect(results.map((r) => r.name)).toContain('wifi');
    expect(results.map((r) => r.name)).toContain('ble');
    expect(results.map((r) => r.name)).toContain('openai');
    expect(results.map((r) => r.name)).toContain('xvf3800');
  });

  it('can simulate failures', async () => {
    diagnostics.setShouldFail(true);
    const result = await diagnostics.testWifi();
    expect(result.status).toBe('fail');
  });
});
