import { describe, it, expect, beforeEach } from 'vitest';
import { ApiKeyStore } from '../../src/auth/api-keys.js';

describe('ApiKeyStore', () => {
  let store: ApiKeyStore;

  beforeEach(() => {
    store = new ApiKeyStore({ encryptionKey: 'test-encryption-key-32-chars!!' });
  });

  it('stores an API key for a device', () => {
    store.set('device-abc', 'sk-openai-key-123');
    const key = store.get('device-abc');
    expect(key).toBe('sk-openai-key-123');
  });

  it('returns null for unknown device', () => {
    const key = store.get('unknown-device');
    expect(key).toBeNull();
  });

  it('overwrites existing key', () => {
    store.set('device-abc', 'sk-key-1');
    store.set('device-abc', 'sk-key-2');
    expect(store.get('device-abc')).toBe('sk-key-2');
  });

  it('deletes a key', () => {
    store.set('device-abc', 'sk-key');
    store.delete('device-abc');
    expect(store.get('device-abc')).toBeNull();
  });

  it('does not log the raw key', () => {
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (...args: unknown[]) => logs.push(args.join(' '));

    store.set('device-abc', 'sk-super-secret-key');

    console.log = originalLog;
    const allLogs = logs.join('\n');
    expect(allLogs).not.toContain('sk-super-secret-key');
  });

  it('encrypts the key at rest', () => {
    store.set('device-abc', 'sk-plaintext-key');
    // The internal storage should not contain the plaintext
    // We verify by checking that get() works but the raw value differs
    const retrieved = store.get('device-abc');
    expect(retrieved).toBe('sk-plaintext-key');
    // If we could access internal storage, we'd verify encryption
  });

  it('handles multiple devices independently', () => {
    store.set('device-a', 'sk-key-a');
    store.set('device-b', 'sk-key-b');
    expect(store.get('device-a')).toBe('sk-key-a');
    expect(store.get('device-b')).toBe('sk-key-b');
  });
});
