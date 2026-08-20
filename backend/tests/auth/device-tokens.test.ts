import { describe, it, expect, beforeEach } from 'vitest';
import { DeviceTokenStore } from '../../src/auth/device-tokens.js';

describe('DeviceTokenStore', () => {
  let store: DeviceTokenStore;

  beforeEach(() => {
    store = new DeviceTokenStore({ secret: 'device-secret', defaultTtlMs: 60000 });
  });

  it('issues a token for a device', () => {
    const result = store.issue('device-abc', 'owner@example.com');
    expect(result.token).toBeDefined();
    expect(result.token.length).toBeGreaterThan(0);
    expect(result.deviceId).toBe('device-abc');
  });

  it('validates a correct token', () => {
    const { token } = store.issue('device-abc', 'owner@example.com');
    const result = store.verify(token);
    expect(result.valid).toBe(true);
    expect(result.deviceId).toBe('device-abc');
    expect(result.ownerEmail).toBe('owner@example.com');
  });

  it('rejects an invalid token', () => {
    const result = store.verify('fake-token');
    expect(result.valid).toBe(false);
  });

  it('rejects an expired token', () => {
    const shortStore = new DeviceTokenStore({ secret: 's', defaultTtlMs: -1000 });
    const { token } = shortStore.issue('device-abc', 'owner@example.com');
    const result = shortStore.verify(token);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('expired');
  });

  it('prevents cross-device access', () => {
    const { token: tokenA } = store.issue('device-a', 'owner@example.com');
    const result = store.verify(tokenA, { deviceId: 'device-b' });
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('wrong_device');
  });

  it('allows access from the correct device', () => {
    const { token } = store.issue('device-a', 'owner@example.com');
    const result = store.verify(token, { deviceId: 'device-a' });
    expect(result.valid).toBe(true);
  });

  it('revokes all tokens for a device', () => {
    const t1 = store.issue('device-abc', 'owner@example.com');
    const t2 = store.issue('device-abc', 'owner@example.com');
    store.revokeDevice('device-abc');
    expect(store.verify(t1.token).valid).toBe(false);
    expect(store.verify(t2.token).valid).toBe(false);
  });

  it('does not revoke tokens for other devices', () => {
    const t1 = store.issue('device-a', 'a@example.com');
    const t2 = store.issue('device-b', 'b@example.com');
    store.revokeDevice('device-a');
    expect(store.verify(t1.token).valid).toBe(false);
    expect(store.verify(t2.token).valid).toBe(true);
  });
});
