export interface MatchInfo {
  opponent: string;
  date: string;
  venue: string;
  competition: string;
}

export class FakeBocaAdapter {
  private shouldError = false;

  setShouldError(value: boolean): void {
    this.shouldError = value;
  }

  async getNextMatch(): Promise<MatchInfo> {
    if (this.shouldError) {
      throw new Error('Boca API error');
    }

    return {
      opponent: 'River Plate',
      date: new Date(Date.now() + 7 * 86400000).toISOString(),
      venue: 'La Bombonera',
      competition: 'Liga Profesional',
    };
  }
}
