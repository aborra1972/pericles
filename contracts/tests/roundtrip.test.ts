import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import type { DeviceConfig, Profile, Session, Memory, DeviceStatus } from '../src/index.js';

const fixturesDir = path.join(import.meta.dirname, '..', 'fixtures', 'valid');

describe('contract models round-trip', () => {
  it('device-config fixture matches TypeScript type', () => {
    const raw = fs.readFileSync(path.join(fixturesDir, 'device-config-v1.json'), 'utf-8');
    const fixture: DeviceConfig = JSON.parse(raw);

    expect(fixture.schema_version).toBe('1.0');
    expect(typeof fixture.device_id).toBe('string');
    expect(['integrated', 'respeaker']).toContain(fixture.hardware_variant);
  });

  it('profile fixture matches TypeScript type', () => {
    const raw = fs.readFileSync(path.join(fixturesDir, 'profile-v1.json'), 'utf-8');
    const fixture: Profile = JSON.parse(raw);

    expect(fixture.schema_version).toBe('1.0');
    expect(typeof fixture.name).toBe('string');
    expect(typeof fixture.is_persistent).toBe('boolean');
  });

  it('session fixture matches TypeScript type', () => {
    const raw = fs.readFileSync(path.join(fixturesDir, 'session-v1.json'), 'utf-8');
    const fixture: Session = JSON.parse(raw);

    expect(fixture.schema_version).toBe('1.0');
    expect(typeof fixture.profile_id).toBe('string');
    expect(typeof fixture.started_at).toBe('string');
  });

  it('memory fixture matches TypeScript type', () => {
    const raw = fs.readFileSync(path.join(fixturesDir, 'memory-v1.json'), 'utf-8');
    const fixture: Memory = JSON.parse(raw);

    expect(fixture.schema_version).toBe('1.0');
    expect(typeof fixture.content).toBe('string');
    expect(['preference', 'fact', 'event', 'context', 'instruction']).toContain(fixture.category);
    expect(fixture.importance).toBeGreaterThanOrEqual(1);
    expect(fixture.importance).toBeLessThanOrEqual(5);
  });

  it('status fixture matches TypeScript type', () => {
    const raw = fs.readFileSync(path.join(fixturesDir, 'status-v1.json'), 'utf-8');
    const fixture: DeviceStatus = JSON.parse(raw);

    expect(fixture.schema_version).toBe('1.0');
    expect(['idle', 'happy', 'thinking', 'surprised', 'funny', 'angry', 'listening', 'speaking']).toContain(fixture.state);
    expect(typeof fixture.wifi_connected).toBe('boolean');
    expect(typeof fixture.backend_connected).toBe('boolean');
  });
});
