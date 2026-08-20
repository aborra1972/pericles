import { describe, it, expect } from 'vitest';
import { loadConfig, ConfigError } from '../src/config.js';

describe('config', () => {
  const validEnv = {
    OPENAI_API_KEY: 'sk-test-key',
    DEVICE_TOKEN_SECRET: 'test-secret-123',
  };

  it('loads config with valid environment', () => {
    const config = loadConfig(validEnv);
    expect(config.openaiApiKey).toBe('sk-test-key');
    expect(config.deviceTokenSecret).toBe('test-secret-123');
    expect(config.port).toBe(3000);
    expect(config.nodeEnv).toBe('development');
  });

  it('uses custom port from PORT', () => {
    const config = loadConfig({ ...validEnv, PORT: '8080' });
    expect(config.port).toBe(8080);
  });

  it('uses custom model from OPENAI_MODEL', () => {
    const config = loadConfig({ ...validEnv, OPENAI_MODEL: 'gpt-4o-mini' });
    expect(config.openaiModel).toBe('gpt-4o-mini');
  });

  it('throws ConfigError when OPENAI_API_KEY is missing', () => {
    expect(() => loadConfig({ DEVICE_TOKEN_SECRET: 'secret' })).toThrow(ConfigError);
    expect(() => loadConfig({ DEVICE_TOKEN_SECRET: 'secret' })).toThrow('OPENAI_API_KEY');
  });

  it('throws ConfigError when DEVICE_TOKEN_SECRET is missing', () => {
    expect(() => loadConfig({ OPENAI_API_KEY: 'key' })).toThrow(ConfigError);
    expect(() => loadConfig({ OPENAI_API_KEY: 'key' })).toThrow('DEVICE_TOKEN_SECRET');
  });

  it('throws ConfigError when both required vars are missing', () => {
    expect(() => loadConfig({})).toThrow(ConfigError);
  });

  it('throws ConfigError when values are empty strings', () => {
    expect(() => loadConfig({ OPENAI_API_KEY: '', DEVICE_TOKEN_SECRET: 's' })).toThrow(ConfigError);
    expect(() => loadConfig({ OPENAI_API_KEY: 'k', DEVICE_TOKEN_SECRET: '' })).toThrow(ConfigError);
  });
});
