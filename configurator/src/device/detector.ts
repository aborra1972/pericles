export interface UsbIds {
  vendorId: number;
  productId: number;
}

export interface DetectedDevice {
  name: string;
  profile: string;
  vendorId: number;
  productId: number;
}

export class DeviceDetector {
  private supportedDevices: DetectedDevice[] = [
    {
      name: 'ESP32-S3 N16R8 (Integrated)',
      profile: 'integrated',
      vendorId: 0x303a,
      productId: 0x1001,
    },
    {
      name: 'ReSpeaker XVF3800 + XIAO ESP32-S3R8',
      profile: 'respeaker',
      vendorId: 0x2886,
      productId: 0x0018,
    },
  ];

  getSupportedDevices(): DetectedDevice[] {
    return [...this.supportedDevices];
  }

  identify(ids: UsbIds): DetectedDevice | null {
    return (
      this.supportedDevices.find(
        (d) => d.vendorId === ids.vendorId && d.productId === ids.productId,
      ) ?? null
    );
  }

  checkMismatch(detected: DetectedDevice | null, expectedProfile: string): boolean {
    if (!detected) return true;
    return detected.profile !== expectedProfile;
  }
}
