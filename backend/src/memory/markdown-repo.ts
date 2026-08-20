import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

export interface CreateMemoryParams {
  personId: string;
  content: string;
  tags?: string[];
}

export interface Memory {
  id: string;
  personId: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateMemoryParams {
  content?: string;
  tags?: string[];
}

export interface MarkdownMemoryRepoOptions {
  basePath: string;
}

export class MarkdownMemoryRepo {
  private basePath: string;

  constructor(options: MarkdownMemoryRepoOptions) {
    this.basePath = options.basePath;
  }

  async create(params: CreateMemoryParams): Promise<Memory> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const memory: Memory = {
      id,
      personId: params.personId,
      content: params.content,
      tags: params.tags ?? [],
      createdAt: now,
      updatedAt: now,
    };

    await this.writeMemory(memory);
    return memory;
  }

  async read(id: string): Promise<Memory | null> {
    try {
      const raw = await fs.readFile(this.filePath(id), 'utf8');
      return this.parseMarkdown(raw);
    } catch {
      return null;
    }
  }

  async update(id: string, params: UpdateMemoryParams): Promise<Memory | null> {
    const existing = await this.read(id);
    if (!existing) return null;

    const updated: Memory = {
      ...existing,
      content: params.content ?? existing.content,
      tags: params.tags ?? existing.tags,
      updatedAt: new Date().toISOString(),
    };

    await this.writeMemory(updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    try {
      await fs.unlink(this.filePath(id));
      return true;
    } catch {
      return false;
    }
  }

  async listByPerson(personId: string): Promise<Memory[]> {
    const files = await fs.readdir(this.basePath);
    const memories: Memory[] = [];

    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      const raw = await fs.readFile(path.join(this.basePath, file), 'utf8');
      const memory = this.parseMarkdown(raw);
      if (memory.personId === personId) {
        memories.push(memory);
      }
    }

    return memories;
  }

  private filePath(id: string): string {
    return path.join(this.basePath, `${id}.md`);
  }

  private async writeMemory(memory: Memory): Promise<void> {
    const frontmatter = [
      '---',
      `id: ${memory.id}`,
      `person_id: ${memory.personId}`,
      `created_at: ${memory.createdAt}`,
      `updated_at: ${memory.updatedAt}`,
      'tags:',
      ...memory.tags.map((t) => `  - ${t}`),
      '---',
    ].join('\n');

    const content = `${frontmatter}\n\n${memory.content}`;
    await fs.writeFile(this.filePath(memory.id), content, 'utf8');
  }

  private parseMarkdown(raw: string): Memory {
    const lines = raw.split('\n');
    const meta: Record<string, string> = {};
    let tags: string[] = [];
    let contentStart = 0;

    if (lines[0] === '---') {
      for (let i = 1; i < lines.length; i++) {
        if (lines[i] === '---') {
          contentStart = i + 1;
          break;
        }
        const tagMatch = lines[i].match(/^  - (.+)$/);
        if (tagMatch) {
          tags.push(tagMatch[1]);
        } else {
          const kv = lines[i].match(/^(\w+): (.+)$/);
          if (kv) {
            meta[kv[1]] = kv[2];
          }
        }
      }
    }

    return {
      id: meta.id ?? '',
      personId: meta.person_id ?? '',
      content: lines.slice(contentStart).join('\n').trim(),
      tags,
      createdAt: meta.created_at ?? '',
      updatedAt: meta.updated_at ?? '',
    };
  }
}
