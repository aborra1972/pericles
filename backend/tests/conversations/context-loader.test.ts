import { describe, it, expect, beforeEach } from 'vitest';
import { ContextLoader } from '../../src/conversations/context-loader.js';
import { MarkdownMemoryRepo } from '../../src/memory/markdown-repo.js';
import { MemorySearchIndex } from '../../src/memory/search-index.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

describe('ContextLoader', () => {
  let loader: ContextLoader;
  let repo: MarkdownMemoryRepo;
  let index: MemorySearchIndex;
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pericles-test-'));
    repo = new MarkdownMemoryRepo({ basePath: tempDir });
    index = new MemorySearchIndex();
    loader = new ContextLoader({ repo, index });
  });

  it('loads context for a person', async () => {
    await repo.create({ personId: 'person-a', content: 'Likes coffee' });
    await repo.create({ personId: 'person-a', content: 'Works at tech company' });
    await repo.create({ personId: 'person-b', content: 'Different person' });

    const context = await loader.loadForPerson('person-a');
    expect(context.memories.length).toBe(2);
  });

  it('returns empty for person with no memories', async () => {
    const context = await loader.loadForPerson('person-a');
    expect(context.memories.length).toBe(0);
  });

  it('searches relevant memories', async () => {
    const m1 = await repo.create({ personId: 'p', content: 'Loves coffee in morning' });
    const m2 = await repo.create({ personId: 'p', content: 'Works at tech company' });
    index.add({ id: m1.id, personId: 'p', content: m1.content, tags: m1.tags });
    index.add({ id: m2.id, personId: 'p', content: m2.content, tags: m2.tags });

    const context = await loader.loadForPerson('p', { query: 'coffee' });
    expect(context.memories.length).toBeGreaterThan(0);
    expect(context.memories[0].content).toContain('coffee');
  });

  it('includes daily summary placeholder', async () => {
    const context = await loader.loadForPerson('person-a');
    expect(context.dailySummary).toBeDefined();
    expect(typeof context.dailySummary).toBe('string');
  });

  it('isolates persons', async () => {
    await repo.create({ personId: 'a', content: 'Memory A' });
    await repo.create({ personId: 'b', content: 'Memory B' });

    const ctxA = await loader.loadForPerson('a');
    const ctxB = await loader.loadForPerson('b');

    expect(ctxA.memories.some((m) => m.content === 'Memory A')).toBe(true);
    expect(ctxA.memories.some((m) => m.content === 'Memory B')).toBe(false);
    expect(ctxB.memories.some((m) => m.content === 'Memory B')).toBe(true);
    expect(ctxB.memories.some((m) => m.content === 'Memory A')).toBe(false);
  });
});
