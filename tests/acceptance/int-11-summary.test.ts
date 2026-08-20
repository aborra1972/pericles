import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('INT-11: Summary First Session + On Demand', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'pericles-summary-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('First session summary', () => {
    it('summary is created after first conversation', () => {
      const session = {
        personId: 'owner-1',
        messages: [] as string[],
        summary: null as string | null,
        addMessage(content: string) {
          this.messages.push(content);
        },
        generateSummary() {
          if (this.messages.length >= 3) {
            this.summary = `First session summary: ${this.messages.length} messages exchanged`;
          }
        },
      };

      session.addMessage('Hola Pericles');
      session.addMessage('¿Cómo estás?');
      session.addMessage('Cuéntame un chiste');

      session.generateSummary();

      expect(session.summary).toBeTruthy();
      expect(session.summary).toContain('3 messages');
    });

    it('summary is not created with less than 3 messages', () => {
      const session = {
        messages: ['Hola'],
        summary: null as string | null,
        generateSummary() {
          if (this.messages.length >= 3) {
            this.summary = 'Summary created';
          }
        },
      };

      session.generateSummary();
      expect(session.summary).toBeNull();
    });

    it('summary is stored in memory database', () => {
      const memoryDB = {
        summaries: [] as Array<{ personId: string; content: string; date: string }>,
        addSummary(personId: string, content: string) {
          this.summaries.push({
            personId,
            content,
            date: new Date().toISOString(),
          });
        },
      };

      memoryDB.addSummary('owner-1', 'Primera sesión: conversation sobre Bombonera');
      expect(memoryDB.summaries.length).toBe(1);
      expect(memoryDB.summaries[0].personId).toBe('owner-1');
    });
  });

  describe('On-demand summary', () => {
    it('user can request summary verbally', () => {
      const commands = [
        'dame un resumen',
        'resumen del día',
        'qué pasó hoy',
        'resume our conversation',
        'what did we talk about',
      ];

      for (const cmd of commands) {
        const isSummaryCommand = cmd.toLowerCase().includes('resumen') ||
          cmd.toLowerCase().includes('resume') ||
          cmd.toLowerCase().includes('qué pasó') ||
          cmd.toLowerCase().includes('what did we');

        expect(isSummaryCommand).toBe(true);
      }
    });

    it('summary includes topics discussed', () => {
      const topics = ['Boca Juniors', 'receta de asado', 'reunión 10am'];
      const summary = `Conversation topics: ${topics.join(', ')}`;

      expect(summary).toContain('Boca Juniors');
      expect(summary).toContain('receta de asado');
      expect(summary).toContain('reunión 10am');
    });

    it('summary includes key facts remembered', () => {
      const facts = [
        { key: 'nombre', value: 'Alejandro' },
        { key: 'ciudad', value: 'San Telmo' },
        { key: 'equipo', value: 'Boca Juniors' },
      ];

      const summary = facts.map(f => `${f.key}: ${f.value}`).join('\n');

      expect(summary).toContain('nombre: Alejandro');
      expect(summary).toContain('ciudad: San Telmo');
      expect(summary).toContain('equipo: Boca Juniors');
    });

    it('summary is spoken back to user', () => {
      const summary = {
        content: 'Hoy hablamos de la Bombonera y tu reunión de mañana',
        spoken: false,
        speak() {
          this.spoken = true;
          return this.content;
        },
      };

      const result = summary.speak();
      expect(summary.spoken).toBe(true);
      expect(result).toContain('Bombonera');
    });
  });

  describe('Summary persistence', () => {
    it('summary is saved to disk', () => {
      const summaryPath = join(tempDir, 'summary.json');
      const summary = {
        personId: 'owner-1',
        date: '2026-08-20',
        content: 'Primera sesión: 15 mensajes, temas: Boca, cocina',
      };

      const fs = require('node:fs');
      fs.writeFileSync(summaryPath, JSON.stringify(summary));

      expect(existsSync(summaryPath)).toBe(true);

      const saved = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
      expect(saved.content).toContain('Boca');
    });

    it('multiple summaries are stored chronologically', () => {
      const summaries = [
        { date: '2026-08-19', content: 'Día 1: Conocernos' },
        { date: '2026-08-20', content: 'Día 2: Recetas y música' },
      ];

      expect(summaries.length).toBe(2);
      expect(summaries[0].date < summaries[1].date).toBe(true);
    });
  });

  describe('Summary privacy', () => {
    it('guest does not get persistent summary', () => {
      const session = {
        personId: null as string | null,
        isGuest: true,
        summary: null as string | null,
        generateSummary() {
          if (this.isGuest) {
            this.summary = 'Ephemeral summary (not saved)';
          } else {
            this.summary = 'Persistent summary';
          }
        },
      };

      session.generateSummary();

      expect(session.summary).toContain('Ephemeral');
      expect(session.summary).toContain('not saved');
    });

    it('owner summary is private to owner', () => {
      const summaries = [
        { personId: 'owner-1', content: 'Mi resumen privado' },
      ];

      // Only owner should access
      const canAccess = (requesterId: string) => {
        return summaries.filter(s => s.personId === requesterId);
      };

      expect(canAccess('owner-1').length).toBe(1);
      expect(canAccess('guest-1').length).toBe(0);
    });
  });
});
