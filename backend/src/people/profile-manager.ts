import { PersonStore, Person } from './person-store.js';

export interface ExportedProfile {
  id: string;
  name: string;
  role: string;
  email?: string;
}

export class ProfileManager {
  private personStore: PersonStore;

  constructor(personStore: PersonStore) {
    this.personStore = personStore;
  }

  exportProfile(requesterId: string, targetId: string): ExportedProfile | null {
    const requester = this.personStore.getById(requesterId);
    if (!requester || requester.role !== 'owner') return null;

    const target = this.personStore.getById(targetId);
    if (!target) return null;

    if (requesterId !== targetId) return null;

    return {
      id: target.id,
      name: target.name,
      role: target.role,
      email: target.email,
    };
  }

  deleteProfile(requesterId: string, targetId: string): boolean {
    const requester = this.personStore.getById(requesterId);
    if (!requester || requester.role !== 'owner') return false;

    if (requesterId !== targetId) return false;

    // In a real implementation, this would also delete associated memory
    // For now, we just remove from the person store
    return this.personStore.delete(requesterId);
  }
}
