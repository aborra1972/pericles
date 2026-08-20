import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigBackup } from '../../src/config/backup.js';

describe('ConfigBackup', () => {
  let backup: ConfigBackup;

  beforeEach(() => {
    backup = new ConfigBackup();
  });

  it('creates a backup', async () => {
    const config = { name: 'test', value: 123 };
    const result = await backup.create(config);
    expect(result.id).toBeDefined();
    expect(result.checksum).toBeDefined();
  });

  it('restores a backup', async () => {
    const config = { name: 'test', value: 123 };
    const { id } = await backup.create(config);
    const restored = await backup.restore(id);
    expect(restored).toEqual(config);
  });

  it('returns null for unknown backup', async () => {
    const restored = await backup.restore('unknown');
    expect(restored).toBeNull();
  });

  it('verifies checksum', async () => {
    const config = { name: 'test', value: 123 };
    const { id, checksum } = await backup.create(config);
    const valid = await backup.verifyChecksum(id, checksum);
    expect(valid).toBe(true);
  });

  it('detects corrupted backup', async () => {
    const config = { name: 'test', value: 123 };
    const { id } = await backup.create(config);
    const valid = await backup.verifyChecksum(id, 'invalid-checksum');
    expect(valid).toBe(false);
  });

  it('clones config to new device', async () => {
    const config = { name: 'test', value: 123 };
    const { id } = await backup.create(config);
    const cloned = await backup.clone(id, 'device-new');
    expect(cloned).toBeDefined();
    expect(cloned?.deviceId).toBe('device-new');
  });

  it('lists all backups', async () => {
    await backup.create({ a: 1 });
    await backup.create({ b: 2 });
    const list = backup.list();
    expect(list.length).toBe(2);
  });

  it('deletes a backup', async () => {
    const { id } = await backup.create({ a: 1 });
    const deleted = await backup.delete(id);
    expect(deleted).toBe(true);
    const restored = await backup.restore(id);
    expect(restored).toBeNull();
  });
});
