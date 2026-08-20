export type DiagnosticStatus = 'pass' | 'fail' | 'timeout';

export interface DiagnosticResult {
  name: string;
  status: DiagnosticStatus;
  message: string;
  timestamp: string;
}

export interface DiagnosticTest {
  name: string;
  timeoutMs?: number;
  test: () => Promise<{ pass: boolean; message: string }>;
}

export class DiagnosticRunner {
  async run(diagnostic: DiagnosticTest): Promise<DiagnosticResult> {
    const timeout = diagnostic.timeoutMs ?? 5000;

    try {
      const result = await Promise.race([
        diagnostic.test(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), timeout),
        ),
      ]);

      return {
        name: diagnostic.name,
        status: result.pass ? 'pass' : 'fail',
        message: result.message,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && error.message === 'timeout') {
        return {
          name: diagnostic.name,
          status: 'timeout',
          message: `Diagnostic timed out after ${timeout}ms`,
          timestamp: new Date().toISOString(),
        };
      }
      return {
        name: diagnostic.name,
        status: 'fail',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async runAll(diagnostics: DiagnosticTest[]): Promise<DiagnosticResult[]> {
    return Promise.all(diagnostics.map((d) => this.run(d)));
  }
}
