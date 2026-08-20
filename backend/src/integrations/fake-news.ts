export interface NewsItem {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
}

export class FakeNewsAdapter {
  private shouldError = false;

  setShouldError(value: boolean): void {
    this.shouldError = value;
  }

  async getHeadlines(): Promise<NewsItem[]> {
    if (this.shouldError) {
      throw new Error('News API error');
    }

    return [
      {
        id: 'news-1',
        title: 'AI assistants become more personal',
        source: 'Tech Daily',
        publishedAt: new Date().toISOString(),
      },
      {
        id: 'news-2',
        title: 'Boca Juniors wins spectacular match',
        source: 'Deportes',
        publishedAt: new Date().toISOString(),
      },
    ];
  }
}
