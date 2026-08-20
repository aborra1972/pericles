export interface DfuResult {
  success: boolean;
  error?: string;
}

export interface VerifyResult {
  valid: boolean;
  checksum?: string;
}

export class XvfDfu {
  private detected = true;
  private inDfuMode = false;
  private progressCallback?: (percent: number) => void;

  simulateNotDetected(value: boolean): void {
    this.detected = !value;
  }

  onProgress(callback: (percent: number) => void): void {
    this.progressCallback = callback;
  }

  async detect(): Promise<boolean> {
    return this.detected;
  }

  async enterDfuMode(): Promise<DfuResult> {
    if (!this.detected) {
      return { success: false, error: 'XVF3800 not detected' };
    }
    this.inDfuMode = true;
    return { success: true };
  }

  async flash(firmware: Buffer): Promise<DfuResult> {
    if (!this.detected) {
      return { success: false, error: 'XVF3800 not detected' };
    }

    // Simulate flash with progress
    for (let i = 0; i <= 100; i += 20) {
      this.progressCallback?.(i);
    }

    return { success: true };
  }

  async verify(): Promise<VerifyResult> {
    return { valid: true, checksum: 'xvf-checksum' };
  }

  async exitDfuMode(): Promise<DfuResult> {
    this.inDfuMode = false;
    return { success: true };
  }
}
