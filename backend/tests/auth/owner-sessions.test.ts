import { describe, it, expect, beforeEach } from 'vitest';
import { OwnerSessionStore } from '../../src/auth/owner-sessions.js';

describe('OwnerSessionStore', () => {
  let store: OwnerSessionStore;

  beforeEach(() => {
    store = new OwnerSessionStore({ secret: 'test-secret-key', ttlMs: 60000 });
  });

  it('creates a session for an email', () => {
    const session = store.create('owner@example.com');
    expect(session).toBeDefined();
    expect(session.token).toBeDefined();
    expect(session.token.length).toBeGreaterThan(0);
    expect(session.email).toBe('owner@example.com');
  });

  it('creates different tokens for different emails', () => {
    const s1 = store.create('a@example.com');
    const s2 = store.create('b@example.com');
    expect(s1.token).not.toBe(s2.token);
  });

  it('validates a correct token', () => {
    const session = store.create('owner@example.com');
    const result = store.verify(session.token);
    expect(result.valid).toBe(true);
    expect(result.email).toBe('owner@example.com');
  });

  it('rejects an invalid token', () => {
    const result = store.verify('invalid-token-abc');
    expect(result.valid).toBe(false);
  });

  it('rejects an expired token', () => {
    const shortStore = new OwnerSessionStore({ secret: 'test', ttlMs: -1000 });
    const session = shortStore.create('owner@example.com');
    const result = shortStore.verify(session.token);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('expired');
  });

  it('revokes a session', () => {
    const session = store.create('owner@example.com');
    store.revoke(session.token);
    const result = store.verify(session.token);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('revoked');
  });

  it('revokes all sessions for an email', () => {
    const s1 = store.create('owner@example.com');
    const s2 = store.create('owner@example.com');
    store.revokeAll('owner@example.com');
    expect(store.verify(s1.token).valid).toBe(false);
    expect(store.verify(s2.token).valid).toBe(false);
  });

  it('does not revoke sessions for other emails', () => {
    const s1 = store.create('a@example.com');
    const s2 = store.create('b@example.com');
    store.revokeAll('a@example.com');
    expect(store.verify(s1.token).valid).toBe(false);
    expect(store.verify(s2.token).valid).toBe(true);
  });
});
