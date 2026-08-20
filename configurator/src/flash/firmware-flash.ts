export interface FlashResult {
  success: boolean;
  error?: string;
  version?: string;
}

export class FirmwareFlash {
  private simulateInterruptFlag = false;
  private progressCallback?: (percent: number) => void;

  simulateInterrupt(value: boolean): void {
    this.simulateInterruptFlag = value;
  }

  onProgress(callback: (percent: number) => void): void {
    this.progressCallback = callback;
  }

  async flash(deviceId: string, firmware: Buffer): Promise<FlashResult> {
    // Validate firmware size
    if (firmware.length === 0) {
      return { success: false, error: 'Invalid firmware size: 0 bytes' };
    }

    // Validate firmware format
    if (!this.isValidFirmware(firmware)) {
      return { success: false, error: 'Invalid firmware format' };
    }

    // Simulate interrupt
    if (this.simulateInterruptFlag) {
      return { success: false, error: 'Flash interrupted' };
    }

    // Simulate progress
    for (let i = 0; i <= 100; i += 25) {
      this.progressCallback?.(i);
    }

    return { success: true, version: '1.0.0' };
  }

  async flashWithProfile(
    deviceId: string,
    firmware: Buffer,
    profile: string,
  ): Promise<FlashResult> {
    // Validate profile match
    if (profile !== 'integrated' && profile !== 'respeaker') {
      return { success: false, error: `Profile mismatch: ${profile}` };
    }

    return this.flash(deviceId, firmware);
  }

  private isValidFirmware(firmware: Buffer): boolean {
    // Simple check: first 19 bytes should be "ESP firmware header"
    if (firmware.length < 19) return false;
    const header = firmware.subarray(0, 19).toString('utf-8');
    return header === 'ESP firmware header';
  }
}
