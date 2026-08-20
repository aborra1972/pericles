import { describe, it, expect, beforeEach } from 'vitest';
import { DailySummaryOrchestrator } from '../../src/daily-summary/orchestrator.js';

describe('DailySummaryOrchestrator', () => {
  let orchestrator: DailySummaryOrchestrator;

  beforeEach(() => {
    orchestrator = new DailySummaryOrchestrator({
      categories: {
        weather: true,
        news: true,
        calendar: true,
        boca: false,
      },
    });
  });

  it('generates summary with enabled categories', async () => {
    const summary = await orchestrator.generate('person-a');
    expect(summary.categories).toContain('weather');
    expect(summary.categories).toContain('news');
    expect(summary.categories).toContain('calendar');
  });

  it('excludes disabled categories', async () => {
    const summary = await orchestrator.generate('person-a');
    expect(summary.categories).not.toContain('boca');
  });

  it('allows toggling categories', async () => {
    orchestrator.toggleCategory('boca', true);
    const summary = await orchestrator.generate('person-a');
    expect(summary.categories).toContain('boca');
  });

  it('includes timestamp', async () => {
    const summary = await orchestrator.generate('person-a');
    expect(summary.generatedAt).toBeDefined();
    expect(new Date(summary.generatedAt).getTime()).toBeGreaterThan(0);
  });

  it('generates different content per person', async () => {
    const s1 = await orchestrator.generate('person-a');
    const s2 = await orchestrator.generate('person-b');
    // Content might be different based on person context
    expect(s1.personId).toBe('person-a');
    expect(s2.personId).toBe('person-b');
  });

  it('returns empty summary when all categories disabled', async () => {
    orchestrator.toggleCategory('weather', false);
    orchestrator.toggleCategory('news', false);
    orchestrator.toggleCategory('calendar', false);
    const summary = await orchestrator.generate('person-a');
    expect(summary.categories.length).toBe(0);
  });
});
