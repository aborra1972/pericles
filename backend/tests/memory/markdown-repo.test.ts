import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MarkdownMemoryRepo } from '../../src/memory/markdown-repo.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

describe('MarkdownMemoryRepo', () => {
  let repo: MarkdownMemoryRepo;
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pericles-test-'));
    repo = new MarkdownMemoryRepo({ basePath: tempDir });
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('creates a memory file', async () => {
    const memory = await repo.create({
      personId: 'person-abc',
      content: 'Juan likes coffee',
      tags: ['preference', 'drink'],
    });
    expect(memory.id).toBeDefined();
    expect(memory.content).toBe('Juan likes coffee');
    expect(memory.tags).toEqual(['preference', 'drink']);
  });

  it('reads a memory file', async () => {
    const created = await repo.create({
      personId: 'person-abc',
      content: 'Juan likes coffee',
    });
    const read = await repo.read(created.id);
    expect(read).toBeDefined();
    expect(read?.content).toBe('Juan likes coffee');
  });

  it('returns null for unknown id', async () => {
    const read = await repo.read('nonexistent');
    expect(read).toBeNull();
  });

  it('updates a memory file', async () => {
    const created = await repo.create({
      personId: 'person-abc',
      content: 'Juan likes coffee',
    });
    const updated = await repo.update(created.id, {
      content: 'Juan likes tea now',
    });
    expect(updated?.content).toBe('Juan likes tea now');
  });

  it('deletes a memory file', async () => {
    const created = await repo.create({
      personId: 'person-abc',
      content: 'Juan likes coffee',
    });
    const deleted = await repo.delete(created.id);
    expect(deleted).toBe(true);
    const read = await repo.read(created.id);
    expect(read).toBeNull();
  });

  it('lists memories for a person', async () => {
    await repo.create({ personId: 'person-a', content: 'Memory 1' });
    await repo.create({ personId: 'person-a', content: 'Memory 2' });
    await repo.create({ personId: 'person-b', content: 'Memory 3' });
    const list = await repo.listByPerson('person-a');
    expect(list.length).toBe(2);
  });

  it('deterministic read/write for same content', async () => {
    const m1 = await repo.create({ personId: 'p', content: 'test' });
    const m2 = await repo.create({ personId: 'p', content: 'test' });
    // Different ids but same content
    expect(m1.id).not.toBe(m2.id);
    expect(m1.content).toBe(m2.content);
  });

  it('stores metadata in frontmatter', async () => {
    const memory = await repo.create({
      personId: 'person-abc',
      content: 'Test memory',
      tags: ['tag1'],
    });
    const raw = await fs.readFile(
      path.join(tempDir, `${memory.id}.md`),
      'utf8',
    );
    expect(raw).toContain('---');
    expect(raw).toContain('person_id: person-abc');
    expect(raw).toContain('tags:');
  });
});
