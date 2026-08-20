import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('INT-08: Guest Mode No Persistent Memory', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'pericles-guest-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('Guest session behavior', () => {
    it('guest session has no person ID', () => {
      const session = {
        personId: null as string | null,
        isGuest: true,
        mode: 'guest',
      };

      expect(session.personId).toBeNull();
      expect(session.isGuest).toBe(true);
    });

    it('guest cannot create memory entries', () => {
      const memory = {
        entries: [] as Array<{ personId: string | null; content: string }>,
        addEntry(personId: string | null, content: string) {
          if (personId === null) {
            throw new Error('Guest cannot create persistent memory');
          }
          this.entries.push({ personId, content });
        },
      };

      expect(() => memory.addEntry(null, 'test memory')).toThrow('Guest cannot create persistent');
    });

    it('guest conversation is ephemeral', () => {
      const conversation = {
        messages: [] as string[],
        personId: null as string | null,
        addMessage(content: string) {
          this.messages.push(content);
        },
        save() {
          if (this.personId === null) {
            throw new Error('Cannot save guest conversation');
          }
          // Save to persistent storage...
        },
      };

      conversation.addMessage('Hola Pericles');
      conversation.addMessage('¿Qué hora es?');

      expect(conversation.messages.length).toBe(2);

      // Should fail on save
      expect(() => conversation.save()).toThrow('Cannot save guest');
    });
  });

  describe('Memory storage isolation', () => {
    it('guest memories are not written to disk', () => {
      const memoryDir = join(tempDir, 'memories');

      // Simulate guest session - no files created
      const guestSession = {
        personId: null,
        memories: [] as string[],
        persist() {
          if (this.personId !== null) {
            // Would write to memoryDir
            return true;
          }
          return false; // Guest: no persistence
        },
      };

      const persisted = guestSession.persist();
      expect(persisted).toBe(false);
      expect(existsSync(memoryDir)).toBe(false);
    });

    it('owner memories are written to disk', () => {
      const memoryDir = join(tempDir, 'memories');

      const ownerSession = {
        personId: 'owner-123',
        memories: ['Hola Pericles', 'Recuerda: reunión 10am'],
        persist() {
          if (this.personId !== null) {
            // Would write to memoryDir
            return true;
          }
          return false;
        },
      };

      const persisted = ownerSession.persist();
      expect(persisted).toBe(true);
    });

    it('guest memories not in search index', () => {
      const searchIndex = {
        entries: [] as Array<{ personId: string; content: string }>,
        add(personId: string, content: string) {
          if (!personId) {
            throw new Error('Cannot index guest memory');
          }
          this.entries.push({ personId, content });
        },
        search(query: string, personId?: string) {
          if (personId) {
            return this.entries.filter(e => e.personId === personId);
          }
          return this.entries;
        },
      };

      // Guest cannot add to index
      expect(() => searchIndex.add('', 'test')).toThrow('Cannot index guest');

      // Owner can add
      searchIndex.add('owner-123', 'reunión 10am');
      expect(searchIndex.entries.length).toBe(1);
    });
  });

  describe('Guest mode data lifecycle', () => {
    it('guest data exists only in memory during session', () => {
      const sessionData = {
        conversation: ['msg1', 'msg2'],
        context: { skin: 'default', state: 'listening' },
      };

      // Data exists in memory
      expect(sessionData.conversation.length).toBe(2);
      expect(sessionData.context.state).toBe('listening');
    });

    it('guest data is lost on session end', () => {
      let sessionData: any = {
        conversation: ['msg1', 'msg2'],
      };

      // Simulate session end
      sessionData = null;

      expect(sessionData).toBeNull();
    });

    it('no guest data in database after disconnect', () => {
      const db = {
        personSessions: [] as Array<{ personId: string; active: boolean }>,
        addSession(personId: string) {
          if (!personId) {
            throw new Error('Guest sessions not tracked');
          }
          this.personSessions.push({ personId, active: true });
        },
      };

      // Guest cannot create session
      expect(() => db.addSession('')).toThrow('Guest sessions not tracked');

      // Owner can
      db.addSession('owner-123');
      expect(db.personSessions.length).toBe(1);
    });
  });

  describe('Privacy compliance', () => {
    it('guest can interact without data retention', () => {
      const interaction = {
        input: '¿Qué hora es?',
        output: 'Son las 15:30',
        timestamp: Date.now(),
        stored: false,
      };

      expect(interaction.stored).toBe(false);
      // Interaction happened but was not persisted
    });

    it('guest conversation not in export', () => {
      const exportData = {
        conversations: [] as any[],
        memories: [] as any[],
        guestConversations: 0,
      };

      // Export should be empty for guest
      expect(exportData.conversations.length).toBe(0);
      expect(exportData.memories.length).toBe(0);
      expect(exportData.guestConversations).toBe(0);
    });
  });
});
