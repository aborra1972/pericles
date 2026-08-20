import { describe, it, expect, beforeEach } from 'vitest';
import { SkinManager } from '../../src/skins/manager.js';

describe('SkinManager', () => {
  let manager: SkinManager;

  beforeEach(() => {
    manager = new SkinManager();
  });

  it('lists available skins', () => {
    const skins = manager.list();
    expect(skins.length).toBeGreaterThanOrEqual(5);
  });

  it('has required skin states', () => {
    const skin = manager.getDefault();
    const states = skin.states;
    expect(states).toContain('idle');
    expect(states).toContain('happy');
    expect(states).toContain('thinking');
    expect(states).toContain('surprised');
    expect(states).toContain('funny');
    expect(states).toContain('angry');
    expect(states).toContain('listening');
    expect(states).toContain('speaking');
  });

  it('gets a skin by name', () => {
    const skin = manager.getByName('default');
    expect(skin).toBeDefined();
    expect(skin.name).toBe('default');
  });

  it('returns null for unknown skin', () => {
    const skin = manager.getByName('nonexistent');
    expect(skin).toBeNull();
  });

  it('previews a skin state', () => {
    const preview = manager.preview('default', 'happy');
    expect(preview).toBeDefined();
    expect(preview.svg).toBeDefined();
  });

  it('validates skin has all required states', () => {
    const valid = manager.validate('default');
    expect(valid).toBe(true);
  });

  it('gets default skin', () => {
    const skin = manager.getDefault();
    expect(skin).toBeDefined();
    expect(skin.isDefault).toBe(true);
  });
});
