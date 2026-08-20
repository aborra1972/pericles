import crypto from 'node:crypto';

export interface ScopedTokenStoreOptions {
  secret: string;
  defaultTtlMs: number;
}

export interface IssueTokenParams {
  subject: string;
  scopes: string[];
  ttlMs?: number;
}

export interface IssueTokenResult {
  token: string;
  expiresAt: number;
}

export interface VerifyTokenOptions {
  requiredScope?: string;
}

export interface VerifyTokenResult {
  valid: boolean;
  subject?: string;
  reason?: 'expired' | 'revoked' | 'insufficient_scope' | 'invalid';
}

interface StoredToken {
  subject: string;
  scopes: string[];
  createdAt: number;
  ttlMs: number;
  revoked: boolean;
}

export class ScopedTokenStore {
  private tokens = new Map<string, StoredToken>();
  private secret: string;
  private defaultTtlMs: number;

  constructor(options: ScopedTokenStoreOptions) {
    this.secret = options.secret;
    this.defaultTtlMs = options.defaultTtlMs;
  }

  issue(params: IssueTokenParams): IssueTokenResult {
    const ttlMs = params.ttlMs ?? this.defaultTtlMs;
    const payload = `${params.subject}:${params.scopes.join(',')}:${Date.now()}:${crypto.randomBytes(16).toString('hex')}`;
    const token = crypto
      .createHmac('sha256', this.secret)
      .update(payload)
      .digest('hex');

    this.tokens.set(token, {
      subject: params.subject,
      scopes: params.scopes,
      createdAt: Date.now(),
      ttlMs,
      revoked: false,
    });

    return {
      token,
      expiresAt: Date.now() + ttlMs,
    };
  }

  verify(token: string, options?: VerifyTokenOptions): VerifyTokenResult {
    const stored = this.tokens.get(token);
    if (!stored) {
      return { valid: false, reason: 'invalid' };
    }

    if (stored.revoked) {
      return { valid: false, reason: 'revoked' };
    }

    const age = Date.now() - stored.createdAt;
    if (age > stored.ttlMs) {
      return { valid: false, reason: 'expired' };
    }

    if (options?.requiredScope && !stored.scopes.includes(options.requiredScope)) {
      return { valid: false, reason: 'insufficient_scope' };
    }

    return { valid: true, subject: stored.subject };
  }

  revoke(token: string): void {
    const stored = this.tokens.get(token);
    if (stored) {
      stored.revoked = true;
    }
  }

  revokeAll(subject: string): void {
    for (const [, token] of this.tokens) {
      if (token.subject === subject) {
        token.revoked = true;
      }
    }
  }
}
