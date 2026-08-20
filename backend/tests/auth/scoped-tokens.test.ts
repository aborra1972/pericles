import { describe, it, expect, beforeEach } from 'vitest';
import { ScopedTokenStore } from '../../src/auth/scoped-tokens.js';

describe('ScopedTokenStore', () => {
  let store: ScopedTokenStore;

  beforeEach(() => {
    store = new ScopedTokenStore({ secret: 'scoped-secret', defaultTtlMs: 60000 });
  });

  it('issues a token with scopes', () => {
    const result = store.issue({
      subject: 'device-abc',
      scopes: ['memory:read', 'memory:write'],
    });
    expect(result.token).toBeDefined();
    expect(result.expiresAt).toBeGreaterThan(Date.now());
  });

  it('validates a token with matching scope', () => {
    const { token } = store.issue({
      subject: 'device-abc',
      scopes: ['memory:read', 'memory:write'],
    });
    const result = store.verify(token, { requiredScope: 'memory:read' });
    expect(result.valid).toBe(true);
  });

  it('rejects a token missing required scope', () => {
    const { token } = store.issue({
      subject: 'device-abc',
      scopes: ['memory:read'],
    });
    const result = store.verify(token, { requiredScope: 'memory:write' });
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('insufficient_scope');
  });

  it('rejects an expired token', () => {
    const shortStore = new ScopedTokenStore({ secret: 's', defaultTtlMs: -1000 });
    const { token } = shortStore.issue({
      subject: 'device-abc',
      scopes: ['memory:read'],
    });
    const result = shortStore.verify(token, { requiredScope: 'memory:read' });
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('expired');
  });

  it('returns subject on valid token', () => {
    const { token } = store.issue({
      subject: 'device-abc',
      scopes: ['memory:read'],
    });
    const result = store.verify(token, { requiredScope: 'memory:read' });
    expect(result.subject).toBe('device-abc');
  });

  it('issues token with custom TTL', () => {
    const { token } = store.issue({
      subject: 'device-abc',
      scopes: ['memory:read'],
      ttlMs: 5000,
    });
    const result = store.verify(token, { requiredScope: 'memory:read' });
    expect(result.valid).toBe(true);
  });

  it('revokes a token', () => {
    const { token } = store.issue({
      subject: 'device-abc',
      scopes: ['memory:read'],
    });
    store.revoke(token);
    const result = store.verify(token, { requiredScope: 'memory:read' });
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('revoked');
  });

  it('revokes all tokens for a subject', () => {
    const t1 = store.issue({ subject: 'device-abc', scopes: ['memory:read'] });
    const t2 = store.issue({ subject: 'device-abc', scopes: ['memory:write'] });
    const t3 = store.issue({ subject: 'device-xyz', scopes: ['memory:read'] });
    store.revokeAll('device-abc');
    expect(store.verify(t1.token, { requiredScope: 'memory:read' }).valid).toBe(false);
    expect(store.verify(t2.token, { requiredScope: 'memory:write' }).valid).toBe(false);
    expect(store.verify(t3.token, { requiredScope: 'memory:read' }).valid).toBe(true);
  });
});
