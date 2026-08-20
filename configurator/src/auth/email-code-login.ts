import crypto from 'node:crypto';

export interface EmailCodeLoginOptions {
  codeTtlMs: number;
}

export interface RequestCodeResult {
  sent: boolean;
  code: string;
}

export interface VerifyCodeResult {
  valid: boolean;
  token?: string;
  reason?: 'invalid' | 'expired' | 'already_used';
}

export interface Session {
  email: string;
  token: string;
}

export class EmailCodeLogin {
  private codes = new Map<string, { code: string; createdAt: number; used: boolean }>();
  private sessions = new Map<string, string>(); // token -> email
  private codeTtlMs: number;

  constructor(options: EmailCodeLoginOptions) {
    this.codeTtlMs = options.codeTtlMs;
  }

  async requestCode(email: string): Promise<RequestCodeResult> {
    const code = crypto.randomInt(100000, 999999).toString();
    this.codes.set(email, {
      code,
      createdAt: Date.now(),
      used: false,
    });
    return { sent: true, code };
  }

  async verifyCode(email: string, code: string): Promise<VerifyCodeResult> {
    const stored = this.codes.get(email);
    if (!stored) {
      return { valid: false, reason: 'invalid' };
    }

    if (stored.used) {
      return { valid: false, reason: 'already_used' };
    }

    const age = Date.now() - stored.createdAt;
    if (age > this.codeTtlMs) {
      return { valid: false, reason: 'expired' };
    }

    if (stored.code !== code) {
      return { valid: false, reason: 'invalid' };
    }

    stored.used = true;

    const token = crypto.randomBytes(32).toString('hex');
    this.sessions.set(token, email);

    return { valid: true, token };
  }

  validateSession(token: string): Session | null {
    const email = this.sessions.get(token);
    if (!email) return null;
    return { email, token };
  }

  logout(token: string): void {
    this.sessions.delete(token);
  }
}
