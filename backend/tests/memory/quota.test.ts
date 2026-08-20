import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryQuota } from '../../src/memory/quota.js';

describe('MemoryQuota', () => {
  let quota: MemoryQuota;

  beforeEach(() => {
    quota = new MemoryQuota({ maxMemoriesPerPerson: 100, retentionDays: 90 });
  });

  it('allows adding within quota', () => {
    const result = quota.check('person-a', 0);
    expect(result.allowed).toBe(true);
  });

  it('rejects when quota exceeded', () => {
    const result = quota.check('person-a', 100);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('quota_exceeded');
  });

  it('tracks per person', () => {
    quota.check('person-a', 50);
    quota.check('person-b', 50);
    // Both should still be allowed
    expect(quota.check('person-a', 50).allowed).toBe(true);
    expect(quota.check('person-b', 50).allowed).toBe(true);
  });

  it('returns remaining quota', () => {
    const result = quota.check('person-a', 30);
    expect(result.remaining).toBe(70);
  });

  it('identifies expired memories', () => {
    const now = Date.now();
    const memories = [
      { id: '1', createdAt: new Date(now - 100 * 86400000).toISOString() }, // 100 days ago
      { id: '2', createdAt: new Date(now - 50 * 86400000).toISOString() }, // 50 days ago
    ];
    const expired = quota.getExpired(memories);
    expect(expired.length).toBe(1);
    expect(expired[0].id).toBe('1');
  });

  it('returns empty for no expired', () => {
    const now = Date.now();
    const memories = [
      { id: '1', createdAt: new Date(now - 10 * 86400000).toISOString() },
    ];
    const expired = quota.getExpired(memories);
    expect(expired.length).toBe(0);
  });
});
