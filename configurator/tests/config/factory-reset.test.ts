import { describe, it, expect, beforeEach } from 'vitest';
import { FactoryReset } from '../../src/config/factory-reset.js';

describe('FactoryReset', () => {
  let reset: FactoryReset;

  beforeEach(() => {
    reset = new FactoryReset();
  });

  it('requires first confirmation', async () => {
    const result = await reset.confirm1();
    expect(result.pending).toBe(true);
    expect(result.step).toBe(1);
  });

  it('requires second confirmation', async () => {
    await reset.confirm1();
    const result = await reset.confirm2();
    expect(result.pending).toBe(true);
    expect(result.step).toBe(2);
  });

  it('executes after double confirmation', async () => {
    await reset.confirm1();
    await reset.confirm2();
    const result = await reset.execute();
    expect(result.executed).toBe(true);
    expect(result.clearedItems).toBeDefined();
  });

  it('cannot execute without confirmations', async () => {
    const result = await reset.execute();
    expect(result.executed).toBe(false);
    expect(result.reason).toBe('not_confirmed');
  });

  it('resets confirmation state', async () => {
    await reset.confirm1();
    reset.cancel();
    const result = await reset.execute();
    expect(result.executed).toBe(false);
  });

  it('lists items to be cleared', async () => {
    const items = reset.getItemsToClear();
    expect(items).toContain('memories');
    expect(items).toContain('settings');
    expect(items).toContain('wifi');
  });

  it('shows confirmation text', async () => {
    await reset.confirm1();
    const text = reset.getConfirmationText();
    expect(text).toContain('CONFIRMACION');
  });
});
