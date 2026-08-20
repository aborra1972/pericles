import { describe, it, expect, beforeEach } from 'vitest';
import { MemorySearchIndex } from '../../src/memory/search-index.js';

describe('MemorySearchIndex', () => {
  let index: MemorySearchIndex;

  beforeEach(() => {
    index = new MemorySearchIndex();
  });

  it('indexes a memory', () => {
    index.add({
      id: 'mem-1',
      personId: 'person-a',
      content: 'Juan likes coffee in the morning',
      tags: ['preference'],
    });
    const results = index.search('person-a', 'coffee');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('mem-1');
  });

  it('returns empty for no matches', () => {
    index.add({
      id: 'mem-1',
      personId: 'person-a',
      content: 'Juan likes coffee',
    });
    const results = index.search('person-a', 'tea');
    expect(results.length).toBe(0);
  });

  it('filters by person', () => {
    index.add({ id: 'mem-1', personId: 'person-a', content: 'coffee' });
    index.add({ id: 'mem-2', personId: 'person-b', content: 'coffee' });
    const results = index.search('person-a', 'coffee');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('mem-1');
  });

  it('ranks by relevance', () => {
    index.add({ id: 'mem-1', personId: 'p', content: 'coffee' });
    index.add({ id: 'mem-2', personId: 'p', content: 'coffee is great and I love coffee' });
    const results = index.search('p', 'coffee');
    expect(results.length).toBe(2);
    // mem-2 has more occurrences, should rank higher
    expect(results[0].id).toBe('mem-2');
  });

  it('removes a memory from index', () => {
    index.add({ id: 'mem-1', personId: 'p', content: 'coffee' });
    index.remove('mem-1');
    const results = index.search('p', 'coffee');
    expect(results.length).toBe(0);
  });

  it('updates a memory in index', () => {
    index.add({ id: 'mem-1', personId: 'p', content: 'coffee' });
    index.update({ id: 'mem-1', personId: 'p', content: 'tea' });
    expect(index.search('p', 'coffee').length).toBe(0);
    expect(index.search('p', 'tea').length).toBe(1);
  });

  it('handles multiple tags', () => {
    index.add({ id: 'mem-1', personId: 'p', content: 'coffee', tags: ['drink', 'morning'] });
    const results = index.search('p', 'drink');
    expect(results.length).toBe(1);
  });

  it('case-insensitive search', () => {
    index.add({ id: 'mem-1', personId: 'p', content: 'Coffee' });
    const results = index.search('p', 'coffee');
    expect(results.length).toBe(1);
  });
});
