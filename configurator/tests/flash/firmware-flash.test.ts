import { describe, it, expect } from 'vitest';
import { FirmwareFlash } from '../../src/flash/firmware-flash.js';

describe('FirmwareFlash', () => {
  it('rejects invalid image format', async () => {
    const flash = new FirmwareFlash();
    const result = await flash.flash('device-1', Buffer.from('not-firmware'));
    expect(result.success).toBe(false);
    expect(result.error?.toLowerCase()).toContain('invalid');
  });

  it('detects interrupted flash', async () => {
    const flash = new FirmwareFlash();
    flash.simulateInterrupt(true);
    const result = await flash.flash('device-1', Buffer.from('ESP firmware header'));
    expect(result.success).toBe(false);
    expect(result.error?.toLowerCase()).toContain('interrupted');
  });

  it('detects profile mismatch', async () => {
    const flash = new FirmwareFlash();
    const result = await flash.flashWithProfile('device-1', Buffer.from('ESP firmware header'), 'wrong-profile');
    expect(result.success).toBe(false);
    expect(result.error).toContain('mismatch');
  });

  it('reports progress during flash', async () => {
    const flash = new FirmwareFlash();
    const progress: number[] = [];
    flash.onProgress((p) => progress.push(p));
    await flash.flash('device-1', Buffer.from('ESP firmware header'));
    expect(progress.length).toBeGreaterThan(0);
  });

  it('validates firmware size', async () => {
    const flash = new FirmwareFlash();
    const result = await flash.flash('device-1', Buffer.alloc(0));
    expect(result.success).toBe(false);
    expect(result.error).toContain('size');
  });

  it('succeeds with valid firmware', async () => {
    const flash = new FirmwareFlash();
    const result = await flash.flash('device-1', Buffer.from('ESP firmware header'));
    expect(result.success).toBe(true);
    expect(result.version).toBeDefined();
  });
});
