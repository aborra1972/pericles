export interface DeviceConfig {
  firmwareVersion: string;
  hardwareProfile: string;
  lastSeen: string;
  apiKey?: string;
}

export interface SupportBundle {
  deviceId: string;
  config: Omit<DeviceConfig, 'apiKey'>;
  generatedAt: string;
}

export class DeviceConfigStore {
  private devices = new Map<string, DeviceConfig>();

  set(deviceId: string, config: DeviceConfig): void {
    this.devices.set(deviceId, config);
  }

  get(deviceId: string): DeviceConfig | null {
    return this.devices.get(deviceId) ?? null;
  }

  updateFirmware(deviceId: string, version: string): void {
    const config = this.devices.get(deviceId);
    if (config) {
      config.firmwareVersion = version;
    }
  }

  getSupportBundle(deviceId: string): SupportBundle | null {
    const config = this.devices.get(deviceId);
    if (!config) return null;

    // Exclude secrets from bundle
    const safeConfig: Omit<DeviceConfig, 'apiKey'> = {
      firmwareVersion: config.firmwareVersion,
      hardwareProfile: config.hardwareProfile,
      lastSeen: config.lastSeen,
    };

    return {
      deviceId,
      config: safeConfig,
      generatedAt: new Date().toISOString(),
    };
  }

  list(): Array<{ deviceId: string; config: DeviceConfig }> {
    return Array.from(this.devices.entries()).map(([deviceId, config]) => ({
      deviceId,
      config,
    }));
  }
}
