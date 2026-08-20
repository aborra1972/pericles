export interface MemoryQuotaOptions {
  maxMemoriesPerPerson: number;
  retentionDays: number;
}

export interface QuotaCheckResult {
  allowed: boolean;
  remaining: number;
  reason?: 'quota_exceeded';
}

export interface MemoryRef {
  id: string;
  createdAt: string;
}

export class MemoryQuota {
  private maxPerPerson: number;
  private retentionMs: number;

  constructor(options: MemoryQuotaOptions) {
    this.maxPerPerson = options.maxMemoriesPerPerson;
    this.retentionMs = options.retentionDays * 86400000;
  }

  check(personId: string, currentCount: number): QuotaCheckResult {
    if (currentCount >= this.maxPerPerson) {
      return {
        allowed: false,
        remaining: 0,
        reason: 'quota_exceeded',
      };
    }

    return {
      allowed: true,
      remaining: this.maxPerPerson - currentCount,
    };
  }

  getExpired(memories: MemoryRef[]): MemoryRef[] {
    const cutoff = Date.now() - this.retentionMs;
    return memories.filter((m) => new Date(m.createdAt).getTime() < cutoff);
  }
}
