import { describe, it, expect } from 'vitest';
import { getHealthStatus, getReadinessStatus } from '../src/health.js';

describe('health', () => {
  it('returns ok status with timestamp and uptime', () => {
    const status = getHealthStatus();
    expect(status.status).toBe('ok');
    expect(status.timestamp).toBeGreaterThan(0);
    expect(status.uptime).toBeGreaterThanOrEqual(0);
    expect(status.checks).toBeUndefined();
  });

  it('returns readiness status with checks', () => {
    const status = getReadinessStatus();
    expect(status.status).toBe('ok');
    expect(status.checks).toBeDefined();
    expect(status.checks?.database).toBe('not_configured');
    expect(status.checks?.ai_provider).toBe('not_configured');
  });
});
