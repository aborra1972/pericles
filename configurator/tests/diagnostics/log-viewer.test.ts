import { describe, it, expect, beforeEach } from 'vitest';
import { LogViewer } from '../../src/diagnostics/log-viewer.js';

describe('LogViewer', () => {
  let viewer: LogViewer;

  beforeEach(() => {
    viewer = new LogViewer();
    viewer.addEntries([
      { level: 'info', message: 'System started', timestamp: '2024-01-01T00:00:00Z' },
      { level: 'error', message: 'WiFi connection failed', timestamp: '2024-01-01T00:01:00Z' },
      { level: 'warn', message: 'Battery low', timestamp: '2024-01-01T00:02:00Z' },
      { level: 'debug', message: 'BLE scan started', timestamp: '2024-01-01T00:03:00Z' },
    ]);
  });

  it('returns all entries', () => {
    const entries = viewer.getEntries();
    expect(entries.length).toBe(4);
  });

  it('filters by level', () => {
    const errors = viewer.filterByLevel('error');
    expect(errors.length).toBe(1);
    expect(errors[0].message).toContain('WiFi');
  });

  it('searches by message', () => {
    const results = viewer.search('battery');
    expect(results.length).toBe(1);
    expect(results[0].level).toBe('warn');
  });

  it('returns empty for no matches', () => {
    const results = viewer.search('nonexistent');
    expect(results.length).toBe(0);
  });

  it('filters by level range', () => {
    // info and warn only
    const results = viewer.filterByLevels(['info', 'warn']);
    expect(results.length).toBe(2);
  });

  it('clears entries', () => {
    viewer.clear();
    expect(viewer.getEntries().length).toBe(0);
  });

  it('exports as JSON', () => {
    const json = viewer.exportJson();
    expect(json).toContain('WiFi');
    expect(json).toContain('error');
  });
});
