import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIGURATION, LocalConfigurationStore, validateConfiguration } from '../../src/config/local-store.js';

describe('LocalConfigurationStore', () => {
  it('persists a valid versioned local configuration', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'pericles-config-'));
    const store = new LocalConfigurationStore(directory);
    const configuration = structuredClone(DEFAULT_CONFIGURATION);
    configuration.voice.volume = 72;
    await store.save(configuration);
    expect((await new LocalConfigurationStore(directory).load()).voice.volume).toBe(72);
  });

  it('rejects invalid values without replacing the last saved configuration', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'pericles-config-'));
    const store = new LocalConfigurationStore(directory);
    await store.save(DEFAULT_CONFIGURATION);
    const invalid = structuredClone(DEFAULT_CONFIGURATION);
    invalid.appearance.brightness = 256;
    await expect(store.save(invalid)).rejects.toThrow('Invalid local configuration');
    expect((await store.load()).appearance.brightness).toBe(DEFAULT_CONFIGURATION.appearance.brightness);
  });

  it('creates, restores, lists and deletes configuration-only backups', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'pericles-config-'));
    const store = new LocalConfigurationStore(directory);
    const configuration = structuredClone(DEFAULT_CONFIGURATION);
    configuration.personality.name = 'Ada';
    await store.save(configuration);
    const backup = await store.createBackup();
    configuration.personality.name = 'Otra';
    await store.save(configuration);
    expect((await store.restoreBackup(backup.id)).personality.name).toBe('Ada');
    expect(await store.listBackups()).toEqual([backup]);
    const body = await readFile(path.join(directory, 'backups', `${backup.id}.json`), 'utf8');
    expect(body).not.toMatch(/credential|conversation|memories|secret/i);
    expect(await store.deleteBackup(backup.id)).toBe(true);
    expect(await store.listBackups()).toEqual([]);
  });

  it('enforces the configured numeric bounds', () => {
    const invalid = structuredClone(DEFAULT_CONFIGURATION);
    invalid.voice.speed = 2.1;
    expect(validateConfiguration(invalid)).toBe(false);
  });
});
