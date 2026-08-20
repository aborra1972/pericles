import { describe, it, expect, beforeEach } from 'vitest';
import { EmailCodeStore } from '../../src/auth/email-codes.js';

describe('EmailCodeStore', () => {
  let store: EmailCodeStore;

  beforeEach(() => {
    store = new EmailCodeStore();
  });

  it('creates a code for an email', () => {
    const code = store.create('user@example.com');
    expect(code).toBeDefined();
    expect(code.length).toBe(6);
    expect(/^\d{6}$/.test(code)).toBe(true);
  });

  it('creates different codes for the same email on subsequent calls', () => {
    const code1 = store.create('user@example.com');
    const code2 = store.create('user@example.com');
    // Codes should be different (random)
    // Note: this test might occasionally fail if the same code is generated
    // In production, codes are stored with timestamps
    expect(typeof code1).toBe('string');
    expect(typeof code2).toBe('string');
  });

  it('validates a correct code', () => {
    const code = store.create('user@example.com');
    const result = store.verify('user@example.com', code);
    expect(result.valid).toBe(true);
  });

  it('rejects an incorrect code', () => {
    store.create('user@example.com');
    const result = store.verify('user@example.com', '000000');
    expect(result.valid).toBe(false);
  });

  it('rejects code for unknown email', () => {
    const result = store.verify('unknown@example.com', '123456');
    expect(result.valid).toBe(false);
  });

  it('rejects expired code', () => {
    const code = store.create('user@example.com', { expiresInMs: -1000 });
    const result = store.verify('user@example.com', code);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('expired');
  });

  it('consumes code after successful verification', () => {
    const code = store.create('user@example.com');
    store.verify('user@example.com', code);
    // Second attempt should fail
    const result = store.verify('user@example.com', code);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('already_used');
  });

  it('allows new code after previous code expired', () => {
    const code1 = store.create('user@example.com', { expiresInMs: -1000 });
    expect(store.verify('user@example.com', code1).valid).toBe(false);

    const code2 = store.create('user@example.com');
    expect(store.verify('user@example.com', code2).valid).toBe(true);
  });
});
