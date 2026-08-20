export type SummaryCategory = 'weather' | 'news' | 'calendar' | 'boca';

export interface MemoryConfig {
  retentionDays: number;
  maxMemoriesPerPerson: number;
  autoSummarize: boolean;
  summaryCategories: SummaryCategory[];
}

const DEFAULT_CONFIG: MemoryConfig = {
  retentionDays: 90,
  maxMemoriesPerPerson: 100,
  autoSummarize: true,
  summaryCategories: ['weather', 'news', 'calendar'],
};

export class MemorySettings {
  private config: MemoryConfig;

  constructor(config?: Partial<MemoryConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  get(): MemoryConfig {
    return { ...this.config, summaryCategories: [...this.config.summaryCategories] };
  }

  update(update: Partial<MemoryConfig>): void {
    if (update.retentionDays !== undefined && (update.retentionDays < 1 || update.retentionDays > 365)) {
      throw new Error('Retention must be between 1 and 365 days');
    }
    this.config = {
      ...this.config,
      ...update,
      summaryCategories: update.summaryCategories ?? this.config.summaryCategories,
    };
  }

  toJSON(): string {
    return JSON.stringify(this.config);
  }

  static fromJSON(json: string): MemorySettings {
    const config = JSON.parse(json) as MemoryConfig;
    return new MemorySettings(config);
  }
}
