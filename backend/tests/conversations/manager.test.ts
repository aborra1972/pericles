import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConversationManager } from '../../src/conversations/manager.js';

describe('ConversationManager', () => {
  let manager: ConversationManager;

  beforeEach(() => {
    vi.useFakeTimers();
    manager = new ConversationManager({ timeoutMs: 30000 });
  });

  it('creates a conversation', () => {
    const conv = manager.create({
      personId: 'person-a',
      deviceId: 'device-abc',
    });
    expect(conv.id).toBeDefined();
    expect(conv.personId).toBe('person-a');
    expect(conv.status).toBe('active');
  });

  it('ends a conversation', () => {
    const conv = manager.create({ personId: 'p', deviceId: 'd' });
    const ended = manager.end(conv.id);
    expect(ended?.status).toBe('ended');
    expect(ended?.endedAt).toBeDefined();
  });

  it('returns null for unknown conversation', () => {
    const ended = manager.end('nonexistent');
    expect(ended).toBeNull();
  });

  it('times out after timeout', () => {
    const conv = manager.create({ personId: 'p', deviceId: 'd' });
    vi.advanceTimersByTime(31000);
    const status = manager.getStatus(conv.id);
    expect(status?.status).toBe('timeout');
  });

  it('explicit close does not timeout', () => {
    const conv = manager.create({ personId: 'p', deviceId: 'd' });
    manager.end(conv.id);
    vi.advanceTimersByTime(60000);
    const status = manager.getStatus(conv.id);
    expect(status?.status).toBe('ended');
  });

  it('lists active conversations for a device', () => {
    manager.create({ personId: 'p', deviceId: 'd1' });
    manager.create({ personId: 'p', deviceId: 'd1' });
    manager.create({ personId: 'p', deviceId: 'd2' });
    const active = manager.listActive('d1');
    expect(active.length).toBe(2);
  });

  it('does not list ended conversations', () => {
    const conv = manager.create({ personId: 'p', deviceId: 'd' });
    manager.end(conv.id);
    const active = manager.listActive('d');
    expect(active.length).toBe(0);
  });
});
