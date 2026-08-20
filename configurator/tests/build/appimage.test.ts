import { describe, it, expect } from 'vitest';
import { AppImageBuilder } from '../../src/build/appimage.js';

describe('AppImageBuilder', () => {
  it('generates AppImage config', async () => {
    const builder = new AppImageBuilder();
    const config = builder.generateConfig({
      name: 'pericles-configurator',
      version: '0.1.0',
      icon: 'icon.png',
      entry: 'dist/index.js',
    });
    expect(config).toBeDefined();
    expect(config.name).toContain('pericles');
    expect(config.version).toBe('0.1.0');
  });

  it('includes Linux desktop entry', async () => {
    const builder = new AppImageBuilder();
    const desktop = builder.generateDesktopFile({
      name: 'Pericles Configurator',
      comment: 'Configure your Pericles AI assistant',
      categories: ['Utility'],
    });
    expect(desktop).toContain('[Desktop Entry]');
    expect(desktop).toContain('Pericles');
    expect(desktop).toContain('Utility');
  });

  it('validates build prerequisites', async () => {
    const builder = new AppImageBuilder();
    const result = await builder.validatePrerequisites();
    expect(result.valid).toBeDefined();
    expect(result.checks).toBeDefined();
  });

  it('generates version string', () => {
    const builder = new AppImageBuilder();
    const version = builder.getVersionString('0.1.0', 'nightly');
    expect(version).toContain('0.1.0');
    expect(version).toContain('nightly');
  });

  it('runs smoke test', async () => {
    const builder = new AppImageBuilder();
    const result = await builder.runSmokeTest({
      appImage: 'dist/Pericles-0.1.0.AppImage',
      timeoutMs: 30000,
    });
    expect(result.passed).toBeDefined();
  });

  it('generates build manifest', () => {
    const builder = new AppImageBuilder();
    const manifest = builder.generateManifest({
      version: '0.1.0',
      buildDate: '2024-01-01',
      electronVersion: '28.0.0',
    });
    expect(manifest.version).toBe('0.1.0');
    expect(manifest.electronVersion).toBe('28.0.0');
  });
});
