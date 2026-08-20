import { describe, it, expect } from 'vitest';
import { migrateMemory, CURRENT_VERSION, MemoryMetadata } from '../../src/memory/schema.js';

describe('Memory metadata schema', () => {
  it('has current version', () => {
    expect(CURRENT_VERSION).toBe(1);
  });

  it('migrates v0 to v1', () => {
    const v0 = {
      id: 'test-id',
      person_id: 'person-abc',
      content: 'Test content',
      created_at: '2024-01-01T00:00:00Z',
    };
    const result = migrateMemory(v0);
    expect(result.version).toBe(1);
    expect(result.tags).toEqual([]);
    expect(result.updated_at).toBe(result.created_at);
  });

  it('returns v1 as-is', () => {
    const v1: MemoryMetadata = {
      id: 'test-id',
      version: 1,
      person_id: 'person-abc',
      content: 'Test content',
      tags: ['tag1'],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };
    const result = migrateMemory(v1);
    expect(result).toEqual(v1);
  });

  it('validates required fields', () => {
    const invalid = { id: 'test' };
    expect(() => migrateMemory(invalid)).toThrow();
  });

  it('handles missing optional fields', () => {
    const minimal = {
      id: 'test-id',
      version: 1,
      person_id: 'person-abc',
      content: 'Test',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };
    const result = migrateMemory(minimal);
    expect(result.tags).toEqual([]);
  });
});
