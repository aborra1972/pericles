import { describe, it, expect } from 'vitest';

describe('configurator', () => {
  it('can import main module without electron', async () => {
    // We can't import the actual Electron main process in a test,
    // but we can verify the module structure exists
    const fs = await import('node:fs');
    const path = await import('node:path');

    const mainPath = path.join(import.meta.dirname, '..', 'src', 'main.ts');
    expect(fs.existsSync(mainPath)).toBe(true);

    const htmlPath = path.join(import.meta.dirname, '..', 'index.html');
    expect(fs.existsSync(htmlPath)).toBe(true);

    const html = fs.readFileSync(htmlPath, 'utf-8');
    expect(html).toContain('Pericles');
    expect(html).toContain('USB-C');
  });
});
