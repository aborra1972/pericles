import { describe, it, expect, beforeEach } from 'vitest';
import { RecoveryScreen } from '../../src/recovery/screen.js';

describe('RecoveryScreen', () => {
  let screen: RecoveryScreen;

  beforeEach(() => {
    screen = new RecoveryScreen();
  });

  it('starts ESP32 recovery flow', async () => {
    const result = screen.startEsp32Recovery();
    expect(result.device).toBe('esp32');
    expect(result.steps.length).toBeGreaterThan(0);
  });

  it('starts XVF3800 recovery flow', async () => {
    const result = screen.startXvf3800Recovery();
    expect(result.device).toBe('xvf3800');
    expect(result.steps.length).toBeGreaterThan(0);
  });

  it('advances to next step', async () => {
    screen.startEsp32Recovery();
    const step = screen.nextStep();
    expect(step).toBeDefined();
    expect(step?.number).toBe(2);
  });

  it('detects Safe Mode path', async () => {
    screen.startEsp32Recovery();
    const step = screen.enterSafeMode();
    expect(step?.safeMode).toBe(true);
  });

  it('completes recovery flow', async () => {
    screen.startEsp32Recovery();
    screen.nextStep();
    screen.nextStep();
    const result = screen.complete();
    expect(result.completed).toBe(true);
  });

  it('resets recovery flow', async () => {
    screen.startEsp32Recovery();
    screen.nextStep();
    screen.reset();
    const step = screen.getCurrentStep();
    expect(step?.number).toBe(1);
  });

  it('gets recovery instructions', async () => {
    screen.startEsp32Recovery();
    const instructions = screen.getInstructions();
    expect(instructions).toContain('BOOT');
  });
});
