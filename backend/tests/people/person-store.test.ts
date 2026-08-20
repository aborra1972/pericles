import { describe, it, expect, beforeEach } from 'vitest';
import { PersonStore } from '../../src/people/person-store.js';

describe('PersonStore', () => {
  let store: PersonStore;

  beforeEach(() => {
    store = new PersonStore();
  });

  it('creates a person profile', () => {
    const person = store.create({
      name: 'Juan',
      role: 'owner',
      email: 'juan@example.com',
    });
    expect(person.id).toBeDefined();
    expect(person.name).toBe('Juan');
    expect(person.role).toBe('owner');
  });

  it('creates a guest profile', () => {
    const person = store.create({
      name: 'Visita',
      role: 'guest',
    });
    expect(person.role).toBe('guest');
    expect(person.email).toBeUndefined();
  });

  it('detects duplicate names', () => {
    store.create({ name: 'Juan', role: 'owner' });
    const result = store.create({ name: 'Juan', role: 'guest' });
    expect(result.duplicate).toBe(true);
    expect(result.disambiguation).toBeDefined();
  });

  it('allows different names', () => {
    const p1 = store.create({ name: 'Juan', role: 'owner' });
    const p2 = store.create({ name: 'Maria', role: 'guest' });
    expect(p1.duplicate).toBe(false);
    expect(p2.duplicate).toBe(false);
  });

  it('guest cannot write memory', () => {
    const guest = store.create({ name: 'Visita', role: 'guest' });
    const canWrite = store.canWrite(guest.id);
    expect(canWrite).toBe(false);
  });

  it('owner can write memory', () => {
    const owner = store.create({ name: 'Juan', role: 'owner', email: 'juan@example.com' });
    const canWrite = store.canWrite(owner.id);
    expect(canWrite).toBe(true);
  });

  it('retrieves a person by id', () => {
    const created = store.create({ name: 'Juan', role: 'owner' });
    const found = store.getById(created.id);
    expect(found).toBeDefined();
    expect(found?.name).toBe('Juan');
  });

  it('returns null for unknown id', () => {
    const found = store.getById('nonexistent');
    expect(found).toBeNull();
  });

  it('lists all people', () => {
    store.create({ name: 'Juan', role: 'owner' });
    store.create({ name: 'Maria', role: 'guest' });
    const all = store.list();
    expect(all.length).toBe(2);
  });
});
