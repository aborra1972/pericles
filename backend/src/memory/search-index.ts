export interface IndexEntry {
  id: string;
  personId: string;
  content: string;
  tags?: string[];
}

export interface SearchResult {
  id: string;
  score: number;
}

export class MemorySearchIndex {
  private entries = new Map<string, IndexEntry>();

  add(entry: IndexEntry): void {
    this.entries.set(entry.id, entry);
  }

  remove(id: string): void {
    this.entries.delete(id);
  }

  update(entry: IndexEntry): void {
    this.entries.set(entry.id, entry);
  }

  search(personId: string, query: string): SearchResult[] {
    const lowerQuery = query.toLowerCase();
    const results: SearchResult[] = [];

    for (const entry of this.entries.values()) {
      if (entry.personId !== personId) continue;

      const lowerContent = entry.content.toLowerCase();
      const score = this.calculateScore(lowerContent, lowerQuery, entry.tags);

      if (score > 0) {
        results.push({ id: entry.id, score });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  private calculateScore(content: string, query: string, tags?: string[]): number {
    let score = 0;

    // Count occurrences in content
    const regex = new RegExp(query, 'gi');
    const matches = content.match(regex);
    if (matches) {
      score += matches.length;
    }

    // Bonus for tags
    if (tags) {
      for (const tag of tags) {
        if (tag.toLowerCase().includes(query)) {
          score += 2;
        }
      }
    }

    return score;
  }
}
