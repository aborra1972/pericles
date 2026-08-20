import crypto from 'node:crypto';

export interface DeviceTokenStoreOptions {
  secret: string;
  defaultTtlMs: number;
}

export interface IssueResult {
  token: string;
  deviceId: string;
  ownerEmail: string;
  expiresAt: number;
}

export interface VerifyOptions {
  deviceId?: string;
}

export interface VerifyResult {
  valid: boolean;
  deviceId?: string;
  ownerEmail?: string;
  reason?: 'expired' | 'wrong_device' | 'invalid';
}

interface StoredToken {
  deviceId: string;
  ownerEmail: string;
  createdAt: number;
  ttlMs: number;
  revoked: boolean;
}

export class DeviceTokenStore {
  private tokens = new Map<string, StoredToken>();
  private secret: string;
  private defaultTtlMs: number;

  constructor(options: DeviceTokenStoreOptions) {
    this.secret = options.secret;
    this.defaultTtlMs = options.defaultTtlMs;
  }

  issue(deviceId: string, ownerEmail: string, ttlMs?: number): IssueResult {
    const payload = `${deviceId}:${ownerEmail}:${Date.now()}:${crypto.randomBytes(16).toString('hex')}`;
    const token = crypto
      .createHmac('sha256', this.secret)
      .update(payload)
      .digest('hex');

    this.tokens.set(token, {
      deviceId,
      ownerEmail,
      createdAt: Date.now(),
      ttlMs: ttlMs ?? this.defaultTtlMs,
      revoked: false,
    });

    return {
      token,
      deviceId,
      ownerEmail,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs),
    };
  }

  verify(token: string, options?: VerifyOptions): VerifyResult {
    const stored = this.tokens.get(token);
    if (!stored) {
      return { valid: false, reason: 'invalid' };
    }

    if (stored.revoked) {
      return { valid: false, reason: 'invalid' };
    }

    const age = Date.now() - stored.createdAt;
    if (age > stored.ttlMs) {
      return { valid: false, reason: 'expired' };
    }

    if (options?.deviceId && options.deviceId !== stored.deviceId) {
      return { valid: false, reason: 'wrong_device' };
    }

    return {
      valid: true,
      deviceId: stored.deviceId,
      ownerEmail: stored.ownerEmail,
    };
  }

  revokeDevice(deviceId: string): void {
    for (const [, session] of this.tokens) {
      if (session.deviceId === deviceId) {
        session.revoked = true;
      }
    }
  }
}
