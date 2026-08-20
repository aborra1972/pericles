import { describe, it, expect, beforeEach } from 'vitest';
import { VoiceSettings } from '../../src/settings/voice.js';

describe('VoiceSettings', () => {
  let settings: VoiceSettings;

  beforeEach(() => {
    settings = new VoiceSettings();
  });

  it('has default voice settings', () => {
    const config = settings.get();
    expect(config.voice).toBeDefined();
    expect(config.speed).toBe(1.0);
    expect(config.pitch).toBe(1.0);
  });

  it('updates voice', () => {
    settings.update({ voice: 'alloy' });
    expect(settings.get().voice).toBe('alloy');
  });

  it('updates speed', () => {
    settings.update({ speed: 1.5 });
    expect(settings.get().speed).toBe(1.5);
  });

  it('validates speed range', () => {
    expect(() => settings.update({ speed: 0.1 })).toThrow('Speed must be');
    expect(() => settings.update({ speed: 3.0 })).toThrow('Speed must be');
  });

  it('generates preview text', () => {
    const preview = settings.preview();
    expect(preview).toBeDefined();
    expect(preview.length).toBeGreaterThan(0);
  });

  it('round-trips through JSON', () => {
    settings.update({ voice: 'echo', speed: 1.2 });
    const json = settings.toJSON();
    const restored = VoiceSettings.fromJSON(json);
    expect(restored.get().voice).toBe('echo');
    expect(restored.get().speed).toBe(1.2);
  });
});
