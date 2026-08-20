import crypto from 'node:crypto';

export type PersonRole = 'owner' | 'guest';

export interface CreatePersonParams {
  name: string;
  role: PersonRole;
  email?: string;
}

export interface CreatePersonResult {
  id: string;
  name: string;
  role: PersonRole;
  email?: string;
  duplicate: boolean;
  disambiguation?: string;
}

export interface Person {
  id: string;
  name: string;
  role: PersonRole;
  email?: string;
}

export class PersonStore {
  private people = new Map<string, Person>();

  create(params: CreatePersonParams): CreatePersonResult {
    const existing = this.findByName(params.name);
    const duplicate = existing !== null;
    const disambiguation = duplicate ? this.generateDisambiguation(params.name) : undefined;

    const id = crypto.randomUUID();
    const person: Person = {
      id,
      name: params.name,
      role: params.role,
      email: params.email,
    };

    this.people.set(id, person);

    return {
      ...person,
      duplicate,
      disambiguation,
    };
  }

  canWrite(personId: string): boolean {
    const person = this.people.get(personId);
    if (!person) return false;
    return person.role === 'owner';
  }

  getById(id: string): Person | null {
    return this.people.get(id) ?? null;
  }

  findByName(name: string): Person | null {
    for (const person of this.people.values()) {
      if (person.name === name) return person;
    }
    return null;
  }

  list(): Person[] {
    return Array.from(this.people.values());
  }

  private generateDisambiguation(name: string): string {
    const count = this.list().filter((p) => p.name === name).length + 1;
    return `${name} (${count})`;
  }
}
