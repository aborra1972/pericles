import crypto from 'node:crypto';

export interface BackupEntry {
  id: string;
  config: unknown;
  checksum: string;
  createdAt: string;
}

export interface CloneResult {
  deviceId: string;
  config: unknown;
  clonedAt: string;
}

export class ConfigBackup {
  private backups = new Map<string, BackupEntry>();

  async create(config: unknown): Promise<{ id: string; checksum: string }> {
    const id = crypto.randomUUID();
    const checksum = this.computeChecksum(config);

    this.backups.set(id, {
      id,
      config,
      checksum,
      createdAt: new Date().toISOString(),
    });

    return { id, checksum };
  }

  async restore(id: string): Promise<unknown | null> {
    const entry = this.backups.get(id);
    if (!entry) return null;
    return entry.config;
  }

  async verifyChecksum(id: string, expectedChecksum: string): Promise<boolean> {
    const entry = this.backups.get(id);
    if (!entry) return false;
    return entry.checksum === expectedChecksum;
  }

  async clone(id: string, deviceId: string): Promise<CloneResult | null> {
    const entry = this.backups.get(id);
    if (!entry) return null;

    return {
      deviceId,
      config: entry.config,
      clonedAt: new Date().toISOString(),
    };
  }

  list(): BackupEntry[] {
    return Array.from(this.backups.values());
  }

  async delete(id: string): Promise<boolean> {
    return this.backups.delete(id);
  }

  private computeChecksum(config: unknown): string {
    const data = JSON.stringify(config);
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
