import crypto from 'node:crypto';

export interface CodeOptions {
  expiresInMs?: number;
}

interface StoredCode {
  code: string;
  createdAt: number;
  expiresInMs: number;
  used: boolean;
}

export interface VerifyResult {
  valid: boolean;
  reason?: 'expired' | 'already_used' | 'invalid';
}

export class EmailCodeStore {
  private codes = new Map<string, StoredCode>();
  private defaultTtlMs = 10 * 60 * 1000; // 10 minutes

  create(email: string, options?: CodeOptions): string {
    const code = crypto.randomInt(100000, 999999).toString();
    this.codes.set(email, {
      code,
      createdAt: Date.now(),
      expiresInMs: options?.expiresInMs ?? this.defaultTtlMs,
      used: false,
    });
    return code;
  }

  verify(email: string, code: string): VerifyResult {
    const stored = this.codes.get(email);
    if (!stored) {
      return { valid: false, reason: 'invalid' };
    }

    if (stored.used) {
      return { valid: false, reason: 'already_used' };
    }

    const age = Date.now() - stored.createdAt;
    if (age > stored.expiresInMs) {
      return { valid: false, reason: 'expired' };
    }

    if (stored.code !== code) {
      return { valid: false, reason: 'invalid' };
    }

    stored.used = true;
    return { valid: true };
  }
}
