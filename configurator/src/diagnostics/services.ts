export interface ServiceDiagnosticResult {
  name: string;
  status: 'pass' | 'fail';
  message: string;
  timestamp: string;
}

export class ServiceDiagnostics {
  private shouldFail = false;

  setShouldFail(value: boolean): void {
    this.shouldFail = value;
  }

  async testWifi(): Promise<ServiceDiagnosticResult> {
    return this.runTest('wifi', async () => {
      if (this.shouldFail) return { pass: false, message: 'WiFi not available' };
      return { pass: true, message: 'WiFi connected' };
    });
  }

  async testBle(): Promise<ServiceDiagnosticResult> {
    return this.runTest('ble', async () => {
      if (this.shouldFail) return { pass: false, message: 'BLE not available' };
      return { pass: true, message: 'BLE ready' };
    });
  }

  async testOpenAI(_apiKey: string): Promise<ServiceDiagnosticResult> {
    return this.runTest('openai', async () => {
      if (this.shouldFail) return { pass: false, message: 'OpenAI API error' };
      return { pass: true, message: 'OpenAI API key valid' };
    });
  }

  async testXvf3800(): Promise<ServiceDiagnosticResult> {
    return this.runTest('xvf3800', async () => {
      if (this.shouldFail) return { pass: false, message: 'XVF3800 not detected' };
      return { pass: true, message: 'XVF3800 connected' };
    });
  }

  async runAll(): Promise<ServiceDiagnosticResult[]> {
    return Promise.all([
      this.testWifi(),
      this.testBle(),
      this.testOpenAI(''),
      this.testXvf3800(),
    ]);
  }

  private async runTest(
    name: string,
    test: () => Promise<{ pass: boolean; message: string }>,
  ): Promise<ServiceDiagnosticResult> {
    const result = await test();
    return {
      name,
      status: result.pass ? 'pass' : 'fail',
      message: result.message,
      timestamp: new Date().toISOString(),
    };
  }
}
