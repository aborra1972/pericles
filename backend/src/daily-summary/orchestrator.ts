export type SummaryCategory = 'weather' | 'news' | 'calendar' | 'boca';

export interface CategoryConfig {
  weather: boolean;
  news: boolean;
  calendar: boolean;
  boca: boolean;
}

export interface OrchestratorOptions {
  categories: CategoryConfig;
}

export interface DailySummary {
  personId: string;
  generatedAt: string;
  categories: SummaryCategory[];
  sections: Array<{
    category: SummaryCategory;
    content: string;
  }>;
}

export class DailySummaryOrchestrator {
  private categories: CategoryConfig;

  constructor(options: OrchestratorOptions) {
    this.categories = { ...options.categories };
  }

  toggleCategory(category: SummaryCategory, enabled: boolean): void {
    this.categories[category] = enabled;
  }

  async generate(personId: string): Promise<DailySummary> {
    const enabledCategories = Object.entries(this.categories)
      .filter(([_, enabled]) => enabled)
      .map(([name]) => name as SummaryCategory);

    const sections = await Promise.all(
      enabledCategories.map(async (category) => ({
        category,
        content: await this.generateSection(category, personId),
      })),
    );

    return {
      personId,
      generatedAt: new Date().toISOString(),
      categories: enabledCategories,
      sections,
    };
  }

  private async generateSection(category: SummaryCategory, personId: string): Promise<string> {
    switch (category) {
      case 'weather':
        return `Weather forecast for ${personId}: Sunny, 25°C`;
      case 'news':
        return `Latest news: Technology advances in AI assistants`;
      case 'calendar':
        return `Calendar: No meetings scheduled for today`;
      case 'boca':
        return `Boca Juniors: Next match this weekend at La Bombonera`;
      default:
        return '';
    }
  }
}
