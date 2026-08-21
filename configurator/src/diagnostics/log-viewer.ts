export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
}

export class LogViewer {
  private entries: LogEntry[] = [];

  addEntries(entries: LogEntry[]): void {
    this.entries.push(...entries);
  }

  getEntries(): LogEntry[] {
    return [...this.entries];
  }

  filterByLevel(level: LogLevel): LogEntry[] {
    return this.entries.filter((e) => e.level === level);
  }

  filterByLevels(levels: LogLevel[]): LogEntry[] {
    return this.entries.filter((e) => levels.includes(e.level));
  }

  search(query: string): LogEntry[] {
    const lower = query.toLowerCase();
    return this.entries.filter((e) => e.message.toLowerCase().includes(lower));
  }

  clear(): void {
    this.entries = [];
  }

  exportJson(): string {
    return JSON.stringify(this.entries, null, 2);
  }
}
