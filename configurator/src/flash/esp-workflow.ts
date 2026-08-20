import crypto from 'node:crypto';

export interface BackupResult {
  deviceId: string;
  backupId: string;
  size: number;
  timestamp: string;
}

export interface FlashResult {
  success: boolean;
  version?: string;
}

export interface VerifyResult {
  valid: boolean;
  checksum?: string;
}

export interface RebootResult {
  success: boolean;
}

export interface RestoreResult {
  success: boolean;
}

export class EspFlashWorkflow {
  private backups = new Map<string, Buffer>();
  private flashHistory = new Map<string, Array<{ version: string; timestamp: string }>>();
  private progressCallback?: (percent: number) => void;

  onProgress(callback: (percent: number) => void): void {
    this.progressCallback = callback;
  }

  async backup(deviceId: string): Promise<BackupResult> {
    // Simulate reading current firmware
    const firmware = Buffer.from('ESP firmware header - backup content');
    const backupId = crypto.randomUUID();
    this.backups.set(`${deviceId}:${backupId}`, firmware);

    return {
      deviceId,
      backupId,
      size: firmware.length,
      timestamp: new Date().toISOString(),
    };
  }

  async flash(deviceId: string, firmware: Buffer): Promise<FlashResult> {
    // Simulate flash with progress
    for (let i = 0; i <= 100; i += 10) {
      this.progressCallback?.(i);
    }

    // Record history
    const history = this.flashHistory.get(deviceId) ?? [];
    history.push({ version: '1.0.0', timestamp: new Date().toISOString() });
    this.flashHistory.set(deviceId, history);

    return { success: true, version: '1.0.0' };
  }

  async verify(deviceId: string): Promise<VerifyResult> {
    const checksum = crypto.createHash('sha256').update(deviceId).digest('hex');
    return { valid: true, checksum };
  }

  async reboot(deviceId: string): Promise<RebootResult> {
    // Simulate reboot
    return { success: true };
  }

  async restore(deviceId: string): Promise<RestoreResult> {
    // Find most recent backup for device
    const backupKey = Array.from(this.backups.keys()).find((k) => k.startsWith(`${deviceId}:`));
    if (!backupKey) return { success: false };

    // Simulate restore
    return { success: true };
  }

  getHistory(deviceId: string): Array<{ version: string; timestamp: string }> {
    return this.flashHistory.get(deviceId) ?? [];
  }
}
