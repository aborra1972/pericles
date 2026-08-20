import { describe, it, expect, beforeEach } from 'vitest';
import { FakeWeatherAdapter } from '../../src/integrations/fake-weather.js';
import { FakeNewsAdapter } from '../../src/integrations/fake-news.js';
import { FakeBocaAdapter } from '../../src/integrations/fake-boca.js';

describe('FakeWeatherAdapter', () => {
  let adapter: FakeWeatherAdapter;

  beforeEach(() => {
    adapter = new FakeWeatherAdapter();
  });

  it('returns weather for a location', async () => {
    const weather = await adapter.getWeather('Buenos Aires');
    expect(weather.location).toBe('Buenos Aires');
    expect(weather.temperature).toBeDefined();
    expect(weather.condition).toBeDefined();
  });

  it('handles errors', async () => {
    adapter.setShouldError(true);
    await expect(adapter.getWeather('Buenos Aires')).rejects.toThrow();
  });
});

describe('FakeNewsAdapter', () => {
  let adapter: FakeNewsAdapter;

  beforeEach(() => {
    adapter = new FakeNewsAdapter();
  });

  it('returns headlines', async () => {
    const news = await adapter.getHeadlines();
    expect(Array.isArray(news)).toBe(true);
    if (news.length > 0) {
      expect(news[0].title).toBeDefined();
      expect(news[0].source).toBeDefined();
    }
  });

  it('handles errors', async () => {
    adapter.setShouldError(true);
    await expect(adapter.getHeadlines()).rejects.toThrow();
  });
});

describe('FakeBocaAdapter', () => {
  let adapter: FakeBocaAdapter;

  beforeEach(() => {
    adapter = new FakeBocaAdapter();
  });

  it('returns next match info', async () => {
    const match = await adapter.getNextMatch();
    expect(match).toBeDefined();
    expect(match.opponent).toBeDefined();
    expect(match.date).toBeDefined();
  });

  it('handles errors', async () => {
    adapter.setShouldError(true);
    await expect(adapter.getNextMatch()).rejects.toThrow();
  });
});
