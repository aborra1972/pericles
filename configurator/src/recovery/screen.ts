export interface RecoveryStep {
  number: number;
  instruction: string;
  safeMode?: boolean;
}

export interface RecoveryFlow {
  device: 'esp32' | 'xvf3800';
  steps: RecoveryStep[];
}

export class RecoveryScreen {
  private currentFlow: RecoveryFlow | null = null;
  private currentStepIndex = 0;

  startEsp32Recovery(): RecoveryFlow {
    this.currentFlow = {
      device: 'esp32',
      steps: [
        { number: 1, instruction: 'Hold BOOT button for 3 seconds' },
        { number: 2, instruction: 'Connect USB cable while holding BOOT' },
        { number: 3, instruction: 'Release BOOT when LED flashes' },
        { number: 4, instruction: 'Click Flash to begin recovery' },
      ],
    };
    this.currentStepIndex = 0;
    return this.currentFlow;
  }

  startXvf3800Recovery(): RecoveryFlow {
    this.currentFlow = {
      device: 'xvf3800',
      steps: [
        { number: 1, instruction: 'Power off the device' },
        { number: 2, instruction: 'Hold MUTE button while powering on' },
        { number: 3, instruction: 'Wait for LED to turn solid blue' },
        { number: 4, instruction: 'Connect I2C cable and click Flash' },
      ],
    };
    this.currentStepIndex = 0;
    return this.currentFlow;
  }

  nextStep(): RecoveryStep | null {
    if (!this.currentFlow) return null;
    this.currentStepIndex++;
    if (this.currentStepIndex >= this.currentFlow.steps.length) {
      this.currentStepIndex = this.currentFlow.steps.length - 1;
    }
    return this.currentFlow.steps[this.currentStepIndex] ?? null;
  }

  enterSafeMode(): RecoveryStep | null {
    if (!this.currentFlow) return null;
    const safeStep: RecoveryStep = {
      number: this.currentStepIndex + 1,
      instruction: 'SAFE MODE: Device will boot with minimal configuration',
      safeMode: true,
    };
    this.currentFlow.steps[this.currentStepIndex] = safeStep;
    return safeStep;
  }

  complete(): { completed: boolean } {
    this.currentFlow = null;
    this.currentStepIndex = 0;
    return { completed: true };
  }

  reset(): void {
    this.currentStepIndex = 0;
  }

  getCurrentStep(): RecoveryStep | null {
    if (!this.currentFlow) return null;
    return this.currentFlow.steps[this.currentStepIndex] ?? null;
  }

  getInstructions(): string {
    if (!this.currentFlow) return 'No recovery in progress';
    return this.currentFlow.steps.map((s) => `${s.number}. ${s.instruction}`).join('\n');
  }
}
