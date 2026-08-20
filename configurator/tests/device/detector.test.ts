import { describe, it, expect, beforeEach } from 'vitest';
import { DeviceDetector } from '../../src/device/detector.js';

describe('DeviceDetector', () => {
  let detector: DeviceDetector;

  beforeEach(() => {
    detector = new DeviceDetector();
  });

  it('detects supported USB devices', () => {
    const devices = detector.getSupportedDevices();
    expect(devices.length).toBeGreaterThan(0);
    expect(devices.some((d) => d.name.includes('ESP32'))).toBe(true);
    expect(devices.some((d) => d.name.includes('ReSpeaker'))).toBe(true);
  });

  it('returns empty for unknown USB device', () => {
    const result = detector.identify({ vendorId: 0x9999, productId: 0x9999 });
    expect(result).toBeNull();
  });

  it('identifies ESP32-S3 N16R8', () => {
    const result = detector.identify({ vendorId: 0x303a, productId: 0x1001 });
    expect(result).not.toBeNull();
    expect(result?.profile).toBe('integrated');
  });

  it('identifies ReSpeaker XVF3800', () => {
    const result = detector.identify({ vendorId: 0x2886, productId: 0x0018 });
    expect(result).not.toBeNull();
    expect(result?.profile).toBe('respeaker');
  });

  it('detects profile mismatch', () => {
    const detected = detector.identify({ vendorId: 0x303a, productId: 0x1001 });
    const expected = 'respeaker';
    const mismatch = detector.checkMismatch(detected, expected);
    expect(mismatch).toBe(true);
  });

  it('no mismatch when profiles match', () => {
    const detected = detector.identify({ vendorId: 0x303a, productId: 0x1001 });
    const expected = 'integrated';
    const mismatch = detector.checkMismatch(detected, expected);
    expect(mismatch).toBe(false);
  });
});
