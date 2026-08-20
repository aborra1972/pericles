import { describe, it, expect, beforeEach } from 'vitest';
import { ProfileManager } from '../../src/people/profile-manager.js';
import { PersonStore } from '../../src/people/person-store.js';

describe('ProfileManager', () => {
  let personStore: PersonStore;
  let manager: ProfileManager;

  beforeEach(() => {
    personStore = new PersonStore();
    manager = new ProfileManager(personStore);
  });

  it('owner can export their profile', () => {
    const owner = personStore.create({
      name: 'Juan',
      role: 'owner',
      email: 'juan@example.com',
    });
    const exported = manager.exportProfile(owner.id, owner.id);
    expect(exported).toBeDefined();
    expect(exported?.name).toBe('Juan');
  });

  it('guest cannot export any profile', () => {
    const guest = personStore.create({ name: 'Visita', role: 'guest' });
    const owner = personStore.create({
      name: 'Juan',
      role: 'owner',
      email: 'juan@example.com',
    });
    const exported = manager.exportProfile(guest.id, owner.id);
    expect(exported).toBeNull();
  });

  it('owner cannot export other profiles', () => {
    const owner = personStore.create({
      name: 'Juan',
      role: 'owner',
      email: 'juan@example.com',
    });
    const other = personStore.create({ name: 'Maria', role: 'guest' });
    const exported = manager.exportProfile(owner.id, other.id);
    expect(exported).toBeNull();
  });

  it('owner can delete their own profile', () => {
    const owner = personStore.create({
      name: 'Juan',
      role: 'owner',
      email: 'juan@example.com',
    });
    const deleted = manager.deleteProfile(owner.id, owner.id);
    expect(deleted).toBe(true);
    expect(personStore.getById(owner.id)).toBeNull();
  });

  it('guest cannot delete any profile', () => {
    const guest = personStore.create({ name: 'Visita', role: 'guest' });
    const owner = personStore.create({
      name: 'Juan',
      role: 'owner',
      email: 'juan@example.com',
    });
    const deleted = manager.deleteProfile(guest.id, owner.id);
    expect(deleted).toBe(false);
    expect(personStore.getById(owner.id)).toBeDefined();
  });

  it('returns null for unknown person', () => {
    const exported = manager.exportProfile('nonexistent', 'nonexistent');
    expect(exported).toBeNull();
  });
});
