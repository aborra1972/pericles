import { describe, it, expect, beforeEach } from 'vitest';
import { EspFlashWorkflow } from '../../src/flash/esp-workflow.js';

describe('EspFlashWorkflow', () => {
  let workflow: EspFlashWorkflow;

  beforeEach(() => {
    workflow = new EspFlashWorkflow();
  });

  it('backs up current firmware', async () => {
    const backup = await workflow.backup('device-1');
    expect(backup.deviceId).toBe('device-1');
    expect(backup.backupId).toBeDefined();
    expect(backup.size).toBeGreaterThan(0);
  });

  it('flashes firmware with progress', async () => {
    const progress: number[] = [];
    workflow.onProgress((p) => progress.push(p));
    const result = await workflow.flash('device-1', Buffer.from('ESP firmware header'));
    expect(result.success).toBe(true);
    expect(progress.length).toBeGreaterThan(0);
  });

  it('verifies firmware after flash', async () => {
    await workflow.flash('device-1', Buffer.from('ESP firmware header'));
    const verification = await workflow.verify('device-1');
    expect(verification.valid).toBe(true);
    expect(verification.checksum).toBeDefined();
  });

  it('reboots device after verification', async () => {
    await workflow.flash('device-1', Buffer.from('ESP firmware header'));
    await workflow.verify('device-1');
    const reboot = await workflow.reboot('device-1');
    expect(reboot.success).toBe(true);
  });

  it('full workflow: backup, flash, verify, reboot', async () => {
    const backup = await workflow.backup('device-1');
    expect(backup.backupId).toBeDefined();

    const flash = await workflow.flash('device-1', Buffer.from('ESP firmware header'));
    expect(flash.success).toBe(true);

    const verify = await workflow.verify('device-1');
    expect(verify.valid).toBe(true);

    const reboot = await workflow.reboot('device-1');
    expect(reboot.success).toBe(true);
  });

  it('restores from backup on failure', async () => {
    await workflow.backup('device-1');
    const restored = await workflow.restore('device-1');
    expect(restored.success).toBe(true);
  });

  it('reports flash history', async () => {
    await workflow.flash('device-1', Buffer.from('ESP firmware header'));
    await workflow.flash('device-1', Buffer.from('ESP firmware header'));
    const history = workflow.getHistory('device-1');
    expect(history.length).toBe(2);
  });
});
