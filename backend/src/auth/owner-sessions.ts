import crypto from 'node:crypto';

export interface SessionStoreOptions {
  secret: string;
  ttlMs: number;
}

export interface CreateSessionResult {
  token: string;
  email: string;
  expiresAt: number;
}

export interface VerifySessionResult {
  valid: boolean;
  email?: string;
  reason?: 'expired' | 'revoked' | 'invalid';
}

interface StoredSession {
  email: string;
  createdAt: number;
  ttlMs: number;
  revoked: boolean;
}

export class OwnerSessionStore {
  private sessions = new Map<string, StoredSession>();
  private secret: string;
  private ttlMs: number;

  constructor(options: SessionStoreOptions) {
    this.secret = options.secret;
    this.ttlMs = options.ttlMs;
  }

  create(email: string): CreateSessionResult {
    const payload = `${email}:${Date.now()}:${crypto.randomBytes(16).toString('hex')}`;
    const token = crypto
      .createHmac('sha256', this.secret)
      .update(payload)
      .digest('hex');

    this.sessions.set(token, {
      email,
      createdAt: Date.now(),
      ttlMs: this.ttlMs,
      revoked: false,
    });

    return {
      token,
      email,
      expiresAt: Date.now() + this.ttlMs,
    };
  }

  verify(token: string): VerifySessionResult {
    const session = this.sessions.get(token);
    if (!session) {
      return { valid: false, reason: 'invalid' };
    }

    if (session.revoked) {
      return { valid: false, reason: 'revoked' };
    }

    const age = Date.now() - session.createdAt;
    if (age > session.ttlMs) {
      return { valid: false, reason: 'expired' };
    }

    return { valid: true, email: session.email };
  }

  revoke(token: string): void {
    const session = this.sessions.get(token);
    if (session) {
      session.revoked = true;
    }
  }

  revokeAll(email: string): void {
    for (const [, session] of this.sessions) {
      if (session.email === email) {
        session.revoked = true;
      }
    }
  }
}
