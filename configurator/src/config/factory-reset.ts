export interface ResetResult {
  executed: boolean;
  reason?: 'not_confirmed';
  clearedItems?: string[];
}

export class FactoryReset {
  private step = 0;
  private itemsToClear = ['memories', 'settings', 'wifi', 'skins', 'personality'];

  async confirm1(): Promise<{ pending: boolean; step: number }> {
    this.step = 1;
    return { pending: true, step: 1 };
  }

  async confirm2(): Promise<{ pending: boolean; step: number }> {
    if (this.step !== 1) {
      return { pending: false, step: this.step };
    }
    this.step = 2;
    return { pending: true, step: 2 };
  }

  async execute(): Promise<ResetResult> {
    if (this.step !== 2) {
      return { executed: false, reason: 'not_confirmed' };
    }

    // Simulate clearing
    this.step = 0;
    return {
      executed: true,
      clearedItems: [...this.itemsToClear],
    };
  }

  cancel(): void {
    this.step = 0;
  }

  getItemsToClear(): string[] {
    return [...this.itemsToClear];
  }

  getConfirmationText(): string {
    if (this.step === 1) {
      return 'PRIMER CONFIRMACION: Esto borrara todos los datos. Confirme de nuevo.';
    }
    if (this.step === 2) {
      return 'CONFIRMAR: Esta accion es irreversible. Escriba CONFIRMAR para continuar.';
    }
    return 'Factory reset no iniciado.';
  }
}
