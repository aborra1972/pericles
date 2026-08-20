import crypto from 'node:crypto';

export interface ApiKeyStoreOptions {
  encryptionKey: string;
}

export class ApiKeyStore {
  private keys = new Map<string, string>();
  private encryptionKey: string;

  constructor(options: ApiKeyStoreOptions) {
    this.encryptionKey = options.encryptionKey;
  }

  set(deviceId: string, apiKey: string): void {
    const encrypted = this.encrypt(apiKey);
    this.keys.set(deviceId, encrypted);
  }

  get(deviceId: string): string | null {
    const encrypted = this.keys.get(deviceId);
    if (!encrypted) return null;
    return this.decrypt(encrypted);
  }

  delete(deviceId: string): void {
    this.keys.delete(deviceId);
  }

  private encrypt(value: string): string {
    const key = crypto.scryptSync(this.encryptionKey, 'pericles-salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  private decrypt(encryptedValue: string): string {
    const [ivHex, encrypted] = encryptedValue.split(':');
    const key = crypto.scryptSync(this.encryptionKey, 'pericles-salt', 32);
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
