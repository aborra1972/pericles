export const CURRENT_VERSION = 1;

export interface MemoryMetadata {
  id: string;
  version: number;
  person_id: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export function migrateMemory(data: Record<string, unknown>): MemoryMetadata {
  if (!data.id || !data.person_id || !data.content || !data.created_at) {
    throw new Error('Missing required fields: id, person_id, content, created_at');
  }

  const version = (data.version as number) ?? 0;

  if (version === 0) {
    return {
      id: data.id as string,
      version: CURRENT_VERSION,
      person_id: data.person_id as string,
      content: data.content as string,
      tags: [],
      created_at: data.created_at as string,
      updated_at: (data.updated_at as string) ?? (data.created_at as string),
    };
  }

  if (version === CURRENT_VERSION) {
    return {
      id: data.id as string,
      version: data.version as number,
      person_id: data.person_id as string,
      content: data.content as string,
      tags: (data.tags as string[]) ?? [],
      created_at: data.created_at as string,
      updated_at: (data.updated_at as string) ?? (data.created_at as string),
    };
  }

  throw new Error(`Unknown memory version: ${version}`);
}
