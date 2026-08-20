import { describe, it, expect, beforeEach } from 'vitest';
import { EmailCodeLogin } from '../../src/auth/email-code-login.js';

describe('EmailCodeLogin', () => {
  let login: EmailCodeLogin;

  beforeEach(() => {
    login = new EmailCodeLogin({ codeTtlMs: 60000 });
  });

  it('sends a code to email', async () => {
    const result = await login.requestCode('owner@example.com');
    expect(result.sent).toBe(true);
    expect(result.code).toBeDefined();
  });

  it('verifies correct code', async () => {
    const { code } = await login.requestCode('owner@example.com');
    const result = await login.verifyCode('owner@example.com', code);
    expect(result.valid).toBe(true);
    expect(result.token).toBeDefined();
  });

  it('rejects invalid code', async () => {
    await login.requestCode('owner@example.com');
    const result = await login.verifyCode('owner@example.com', '000000');
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('invalid');
  });

  it('rejects expired code', async () => {
    const shortLogin = new EmailCodeLogin({ codeTtlMs: -1000 });
    const { code } = await shortLogin.requestCode('owner@example.com');
    const result = await shortLogin.verifyCode('owner@example.com', code);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('expired');
  });

  it('consumes code after use', async () => {
    const { code } = await login.requestCode('owner@example.com');
    await login.verifyCode('owner@example.com', code);
    const result = await login.verifyCode('owner@example.com', code);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('already_used');
  });

  it('validates session token', async () => {
    const { code } = await login.requestCode('owner@example.com');
    const { token } = await login.verifyCode('owner@example.com', code);
    const session = login.validateSession(token);
    expect(session).toBeDefined();
    expect(session?.email).toBe('owner@example.com');
  });

  it('invalidates session on logout', async () => {
    const { code } = await login.requestCode('owner@example.com');
    const { token } = await login.verifyCode('owner@example.com', code);
    login.logout(token);
    const session = login.validateSession(token);
    expect(session).toBeNull();
  });
});
