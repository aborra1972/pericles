import { describe, it, expect } from 'vitest';
import { QualityProfile, getQualityProfile } from '../../src/ai/quality-profiles.js';

describe('Quality profiles', () => {
  it('returns Economic profile', () => {
    const profile = getQualityProfile('economic');
    expect(profile.model).toBe('gpt-4o-mini');
    expect(profile.maxTokens).toBe(256);
    expect(profile.temperature).toBe(0.3);
  });

  it('returns Balanced profile', () => {
    const profile = getQualityProfile('balanced');
    expect(profile.model).toBe('gpt-4o');
    expect(profile.maxTokens).toBe(512);
    expect(profile.temperature).toBe(0.7);
  });

  it('returns Maximum profile', () => {
    const profile = getQualityProfile('maximum');
    expect(profile.model).toBe('gpt-4o');
    expect(profile.maxTokens).toBe(1024);
    expect(profile.temperature).toBe(0.9);
  });

  it('throws for unknown profile', () => {
    expect(() => getQualityProfile('unknown')).toThrow('Unknown quality profile');
  });

  it('has consistent structure', () => {
    const profiles: QualityProfile[] = ['economic', 'balanced', 'maximum'].map(getQualityProfile);
    for (const profile of profiles) {
      expect(profile.model).toBeDefined();
      expect(profile.maxTokens).toBeGreaterThan(0);
      expect(profile.temperature).toBeGreaterThanOrEqual(0);
      expect(profile.temperature).toBeLessThanOrEqual(1);
    }
  });
});
