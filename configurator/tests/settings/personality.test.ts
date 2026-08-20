import { describe, it, expect, beforeEach } from 'vitest';
import { PersonalitySettings } from '../../src/settings/personality.js';

describe('PersonalitySettings', () => {
  let settings: PersonalitySettings;

  beforeEach(() => {
    settings = new PersonalitySettings();
  });

  it('has default personality', () => {
    const config = settings.get();
    expect(config.name).toBe('Pericles');
    expect(config.style).toBeDefined();
  });

  it('updates personality name', () => {
    settings.update({ name: 'Custom Name' });
    expect(settings.get().name).toBe('Custom Name');
  });

  it('updates personality style', () => {
    settings.update({ style: 'formal' });
    expect(settings.get().style).toBe('formal');
  });

  it('validates style options', () => {
    expect(() => settings.update({ style: 'invalid' })).toThrow('Invalid style');
  });

  it('round-trips through JSON', () => {
    settings.update({ name: 'Test', style: 'casual' });
    const json = settings.toJSON();
    const restored = PersonalitySettings.fromJSON(json);
    expect(restored.get().name).toBe('Test');
    expect(restored.get().style).toBe('casual');
  });

  it('exports config', () => {
    const config = settings.export();
    expect(config).toBeDefined();
    expect(typeof config).toBe('object');
  });
});
