import { randomUUID } from 'node:crypto';
import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

export interface LocalConfiguration {
  version: 1;
  appearance: { skin: string; brightness: number; textSize: number; scrollSpeed: number; highContrast: boolean };
  voice: { volume: number; muted: boolean; responseMode: 'voice' | 'text' | 'both'; speed: number };
  personality: { name: string; tone: 'neutral' | 'warm' | 'playful'; sarcasm: number; profanity: number; topics: string[] };
  ai: { quality: 'balanced' | 'high' | 'economy' };
  privacy: { persistLocalSettings: boolean; anonymousErrorReports: boolean };
}

export interface BackupSummary { id: string; createdAt: string; }
export interface StoredBackup extends BackupSummary { configuration: LocalConfiguration; }

export const DEFAULT_CONFIGURATION: LocalConfiguration = {
  version: 1,
  appearance: { skin: 'default', brightness: 180, textSize: 16, scrollSpeed: 1, highContrast: false },
  voice: { volume: 50, muted: false, responseMode: 'both', speed: 1 },
  personality: { name: 'Pericles', tone: 'playful', sarcasm: 5, profanity: 5, topics: [] },
  ai: { quality: 'balanced' },
  privacy: { persistLocalSettings: true, anonymousErrorReports: false },
};

const SKINS = new Set(['default', 'minimal', 'colorful', 'dark', 'retro']);
const MODES = new Set(['voice', 'text', 'both']);
const TONES = new Set(['neutral', 'warm', 'playful']);
const QUALITIES = new Set(['balanced', 'high', 'economy']);
const inRange = (value: unknown, min: number, max: number): value is number => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;

export function validateConfiguration(value: unknown): value is LocalConfiguration {
  if (!value || typeof value !== 'object') return false;
  const config = value as LocalConfiguration;
  return config.version === 1
    && SKINS.has(config.appearance?.skin)
    && inRange(config.appearance?.brightness, 0, 255)
    && inRange(config.appearance?.textSize, 8, 32)
    && inRange(config.appearance?.scrollSpeed, 0.5, 3)
    && typeof config.appearance?.highContrast === 'boolean'
    && inRange(config.voice?.volume, 0, 100)
    && typeof config.voice?.muted === 'boolean'
    && MODES.has(config.voice?.responseMode)
    && inRange(config.voice?.speed, 0.5, 2)
    && typeof config.personality?.name === 'string' && config.personality.name.trim().length > 0 && config.personality.name.length <= 60
    && TONES.has(config.personality?.tone)
    && inRange(config.personality?.sarcasm, 0, 10)
    && inRange(config.personality?.profanity, 0, 10)
    && Array.isArray(config.personality?.topics) && config.personality.topics.every((topic) => typeof topic === 'string' && topic.length <= 40)
    && QUALITIES.has(config.ai?.quality)
    && typeof config.privacy?.persistLocalSettings === 'boolean'
    && typeof config.privacy?.anonymousErrorReports === 'boolean';
}

export class LocalConfigurationStore {
  constructor(private readonly dataDirectory: string) {}

  private get configurationPath(): string { return path.join(this.dataDirectory, 'configuration.json'); }
  private get backupsDirectory(): string { return path.join(this.dataDirectory, 'backups'); }

  async load(): Promise<LocalConfiguration> {
    try {
      const parsed: unknown = JSON.parse(await readFile(this.configurationPath, 'utf8'));
      return validateConfiguration(parsed) ? parsed : structuredClone(DEFAULT_CONFIGURATION);
    } catch { return structuredClone(DEFAULT_CONFIGURATION); }
  }

  async save(configuration: unknown): Promise<LocalConfiguration> {
    if (!validateConfiguration(configuration)) throw new Error('Invalid local configuration');
    await mkdir(this.dataDirectory, { recursive: true });
    await this.writeJson(this.configurationPath, configuration);
    return configuration;
  }

  async createBackup(): Promise<BackupSummary> {
    const configuration = await this.load();
    const backup: StoredBackup = { id: randomUUID(), createdAt: new Date().toISOString(), configuration };
    await mkdir(this.backupsDirectory, { recursive: true });
    await this.writeJson(path.join(this.backupsDirectory, `${backup.id}.json`), backup);
    return { id: backup.id, createdAt: backup.createdAt };
  }

  async listBackups(): Promise<BackupSummary[]> {
    try {
      const entries = await readdir(this.backupsDirectory, { withFileTypes: true });
      const backups = await Promise.all(entries.filter((entry) => entry.isFile() && entry.name.endsWith('.json')).map(async (entry) => {
        try {
          const backup: unknown = JSON.parse(await readFile(path.join(this.backupsDirectory, entry.name), 'utf8'));
          if (this.isBackup(backup)) return { id: backup.id, createdAt: backup.createdAt };
        } catch { /* Ignore malformed backup files. */ }
        return null;
      }));
      return backups.filter((backup): backup is BackupSummary => backup !== null).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } catch { return []; }
  }

  async restoreBackup(id: string): Promise<LocalConfiguration> {
    const backup = await this.readBackup(id);
    if (!backup) throw new Error('Backup not found or invalid');
    return this.save(backup.configuration);
  }

  async deleteBackup(id: string): Promise<boolean> {
    if (!/^[a-f0-9-]{36}$/i.test(id)) return false;
    try { await rm(path.join(this.backupsDirectory, `${id}.json`)); return true; } catch { return false; }
  }

  private async readBackup(id: string): Promise<StoredBackup | null> {
    if (!/^[a-f0-9-]{36}$/i.test(id)) return null;
    try {
      const value: unknown = JSON.parse(await readFile(path.join(this.backupsDirectory, `${id}.json`), 'utf8'));
      return this.isBackup(value) ? value : null;
    } catch { return null; }
  }

  private isBackup(value: unknown): value is StoredBackup {
    if (!value || typeof value !== 'object') return false;
    const backup = value as StoredBackup;
    return typeof backup.id === 'string' && typeof backup.createdAt === 'string' && validateConfiguration(backup.configuration);
  }

  private async writeJson(filePath: string, value: unknown): Promise<void> {
    const temporaryPath = `${filePath}.${randomUUID()}.tmp`;
    await writeFile(temporaryPath, JSON.stringify(value, null, 2), { encoding: 'utf8', mode: 0o600 });
    await rename(temporaryPath, filePath);
  }
}
