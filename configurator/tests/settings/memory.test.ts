import { describe, it, expect, beforeEach } from 'vitest';
import { MemorySettings } from '../../src/settings/memory.js';

describe('MemorySettings', () => {
  let settings: MemorySettings;

  beforeEach(() => {
    settings = new MemorySettings();
  });

  it('has default memory settings', () => {
    const config = settings.get();
    expect(config.retentionDays).toBe(90);
    expect(config.maxMemoriesPerPerson).toBe(100);
    expect(config.autoSummarize).toBe(true);
  });

  it('updates retention days', () => {
    settings.update({ retentionDays: 30 });
    expect(settings.get().retentionDays).toBe(30);
  });

  it('validates retention range', () => {
    expect(() => settings.update({ retentionDays: 0 })).toThrow('Retention must be');
    expect(() => settings.update({ retentionDays: 400 })).toThrow('Retention must be');
  });

  it('toggles auto-summarize', () => {
    settings.update({ autoSummarize: false });
    expect(settings.get().autoSummarize).toBe(false);
  });

  it('configures summary categories', () => {
    settings.update({ summaryCategories: ['weather', 'news'] });
    expect(settings.get().summaryCategories).toContain('weather');
    expect(settings.get().summaryCategories).toContain('news');
  });

  it('round-trips through JSON', () => {
    settings.update({ retentionDays: 60, autoSummarize: false });
    const json = settings.toJSON();
    const restored = MemorySettings.fromJSON(json);
    expect(restored.get().retentionDays).toBe(60);
    expect(restored.get().autoSummarize).toBe(false);
  });
});
