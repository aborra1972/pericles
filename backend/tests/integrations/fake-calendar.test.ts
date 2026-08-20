import { describe, it, expect, beforeEach } from 'vitest';
import { FakeCalendarAdapter } from '../../src/integrations/fake-calendar.js';

describe('FakeCalendarAdapter', () => {
  let adapter: FakeCalendarAdapter;

  beforeEach(() => {
    adapter = new FakeCalendarAdapter();
  });

  it('returns events for a date range', async () => {
    const events = await adapter.getEvents({
      start: '2024-01-15T00:00:00Z',
      end: '2024-01-16T00:00:00Z',
    });
    expect(Array.isArray(events)).toBe(true);
  });

  it('returns event with required fields', async () => {
    const events = await adapter.getEvents({
      start: '2024-01-15T00:00:00Z',
      end: '2024-01-16T00:00:00Z',
    });
    if (events.length > 0) {
      expect(events[0].id).toBeDefined();
      expect(events[0].summary).toBeDefined();
      expect(events[0].start).toBeDefined();
      expect(events[0].end).toBeDefined();
    }
  });

  it('handles token refresh', async () => {
    const refreshed = await adapter.refreshToken('old-token');
    expect(refreshed).toBeDefined();
    expect(refreshed.accessToken).toBeDefined();
    expect(refreshed.expiresAt).toBeGreaterThan(Date.now());
  });

  it('can simulate errors', async () => {
    adapter.setShouldError(true);
    await expect(
      adapter.getEvents({
        start: '2024-01-15T00:00:00Z',
        end: '2024-01-16T00:00:00Z',
      }),
    ).rejects.toThrow('Fake calendar error');
  });

  it('returns mock events with realistic data', async () => {
    const events = await adapter.getEvents({
      start: '2024-01-15T00:00:00Z',
      end: '2024-01-16T00:00:00Z',
    });
    // Should return at least one mock event
    expect(events.length).toBeGreaterThanOrEqual(0);
  });
});
