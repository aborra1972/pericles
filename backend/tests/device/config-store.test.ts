import { describe, it, expect, beforeEach } from 'vitest';
import { DeviceConfigStore } from '../../src/device/config-store.js';

describe('DeviceConfigStore', () => {
  let store: DeviceConfigStore;

  beforeEach(() => {
    store = new DeviceConfigStore();
  });

  it('stores device config', () => {
    store.set('device-abc', {
      firmwareVersion: '1.2.3',
      hardwareProfile: 'integrated',
      lastSeen: new Date().toISOString(),
    });
    const config = store.get('device-abc');
    expect(config).toBeDefined();
    expect(config?.firmwareVersion).toBe('1.2.3');
  });

  it('returns null for unknown device', () => {
    const config = store.get('unknown');
    expect(config).toBeNull();
  });

  it('updates firmware version', () => {
    store.set('device-abc', {
      firmwareVersion: '1.2.3',
      hardwareProfile: 'integrated',
      lastSeen: new Date().toISOString(),
    });
    store.updateFirmware('device-abc', '1.3.0');
    const config = store.get('device-abc');
    expect(config?.firmwareVersion).toBe('1.3.0');
  });

  it('generates support bundle', () => {
    store.set('device-abc', {
      firmwareVersion: '1.2.3',
      hardwareProfile: 'integrated',
      lastSeen: new Date().toISOString(),
    });
    const bundle = store.getSupportBundle('device-abc');
    expect(bundle).toBeDefined();
    expect(bundle?.deviceId).toBe('device-abc');
    expect(bundle?.config).toBeDefined();
    expect(bundle?.generatedAt).toBeDefined();
  });

  it('excludes secrets from support bundle', () => {
    store.set('device-abc', {
      firmwareVersion: '1.2.3',
      hardwareProfile: 'integrated',
      lastSeen: new Date().toISOString(),
      apiKey: 'sk-secret-key',
    });
    const bundle = store.getSupportBundle('device-abc');
    expect(JSON.stringify(bundle)).not.toContain('sk-secret-key');
  });

  it('returns null bundle for unknown device', () => {
    const bundle = store.getSupportBundle('unknown');
    expect(bundle).toBeNull();
  });

  it('lists all devices', () => {
    store.set('d1', { firmwareVersion: '1.0', hardwareProfile: 'integrated', lastSeen: new Date().toISOString() });
    store.set('d2', { firmwareVersion: '2.0', hardwareProfile: 'respeaker', lastSeen: new Date().toISOString() });
    const devices = store.list();
    expect(devices.length).toBe(2);
  });
});
