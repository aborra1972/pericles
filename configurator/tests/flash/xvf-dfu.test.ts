import { describe, it, expect, beforeEach } from 'vitest';
import { XvfDfu } from '../../src/flash/xvf-dfu.js';

describe('XvfDfu', () => {
  let dfu: XvfDfu;

  beforeEach(() => {
    dfu = new XvfDfu();
  });

  it('detects XVF3800 on I2C bus', async () => {
    const detected = await dfu.detect();
    expect(detected).toBe(true);
  });

  it('enters DFU mode', async () => {
    const result = await dfu.enterDfuMode();
    expect(result.success).toBe(true);
  });

  it('flashes firmware via I2C', async () => {
    const progress: number[] = [];
    dfu.onProgress((p) => progress.push(p));
    const result = await dfu.flash(Buffer.from('XVF firmware'));
    expect(result.success).toBe(true);
    expect(progress.length).toBeGreaterThan(0);
  });

  it('verifies flash', async () => {
    await dfu.flash(Buffer.from('XVF firmware'));
    const result = await dfu.verify();
    expect(result.valid).toBe(true);
  });

  it('exits DFU mode', async () => {
    await dfu.enterDfuMode();
    const result = await dfu.exitDfuMode();
    expect(result.success).toBe(true);
  });

  it('handles detection failure', async () => {
    dfu.simulateNotDetected(true);
    const result = await dfu.flash(Buffer.from('XVF firmware'));
    expect(result.success).toBe(false);
    expect(result.error).toContain('not detected');
  });

  it('full DFU cycle: detect, enter, flash, verify, exit', async () => {
    const detected = await dfu.detect();
    expect(detected).toBe(true);

    const enter = await dfu.enterDfuMode();
    expect(enter.success).toBe(true);

    const flash = await dfu.flash(Buffer.from('XVF firmware'));
    expect(flash.success).toBe(true);

    const verify = await dfu.verify();
    expect(verify.valid).toBe(true);

    const exit = await dfu.exitDfuMode();
    expect(exit.success).toBe(true);
  });
});
