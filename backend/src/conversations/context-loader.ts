import { MarkdownMemoryRepo } from '../memory/markdown-repo.js';
import { MemorySearchIndex } from '../memory/search-index.js';

export interface ContextLoaderOptions {
  repo: MarkdownMemoryRepo;
  index: MemorySearchIndex;
}

export interface LoadContextOptions {
  query?: string;
  limit?: number;
}

export interface PersonContext {
  personId: string;
  memories: Array<{ id: string; content: string; tags: string[] }>;
  dailySummary: string;
}

export class ContextLoader {
  private repo: MarkdownMemoryRepo;
  private index: MemorySearchIndex;

  constructor(options: ContextLoaderOptions) {
    this.repo = options.repo;
    this.index = options.index;
  }

  async loadForPerson(personId: string, options?: LoadContextOptions): Promise<PersonContext> {
    let memories = await this.repo.listByPerson(personId);

    if (options?.query) {
      const searchResults = this.index.search(personId, options.query);
      const ids = new Set(searchResults.map((r) => r.id));
      memories = memories.filter((m) => ids.has(m.id));
    }

    const limit = options?.limit ?? 50;
    const limited = memories.slice(0, limit);

    return {
      personId,
      memories: limited.map((m) => ({
        id: m.id,
        content: m.content,
        tags: m.tags,
      })),
      dailySummary: this.generateDailySummary(limited),
    };
  }

  private generateDailySummary(memories: Array<{ content: string }>): string {
    if (memories.length === 0) {
      return 'No recent memories available.';
    }
    return `You have ${memories.length} memories stored. Latest: ${memories[memories.length - 1].content.slice(0, 100)}.`;
  }
}
