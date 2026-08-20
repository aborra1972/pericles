export type ConversationStatus = 'active' | 'ended' | 'timeout';

export interface Conversation {
  id: string;
  personId: string;
  deviceId: string;
  status: ConversationStatus;
  createdAt: string;
  endedAt?: string;
}

export interface CreateConversationParams {
  personId: string;
  deviceId: string;
}

export interface ConversationManagerOptions {
  timeoutMs: number;
}

export class ConversationManager {
  private conversations = new Map<string, Conversation>();
  private timeouts = new Map<string, ReturnType<typeof setTimeout>>();
  private timeoutMs: number;

  constructor(options: ConversationManagerOptions) {
    this.timeoutMs = options.timeoutMs;
  }

  create(params: CreateConversationParams): Conversation {
    const id = crypto.randomUUID();
    const conv: Conversation = {
      id,
      personId: params.personId,
      deviceId: params.deviceId,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    this.conversations.set(id, conv);

    const timeout = setTimeout(() => {
      const stored = this.conversations.get(id);
      if (stored?.status === 'active') {
        stored.status = 'timeout';
      }
    }, this.timeoutMs);

    this.timeouts.set(id, timeout);

    return conv;
  }

  end(id: string): Conversation | null {
    const conv = this.conversations.get(id);
    if (!conv) return null;

    conv.status = 'ended';
    conv.endedAt = new Date().toISOString();

    const timeout = this.timeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(id);
    }

    return conv;
  }

  getStatus(id: string): Conversation | null {
    return this.conversations.get(id) ?? null;
  }

  listActive(deviceId: string): Conversation[] {
    return Array.from(this.conversations.values()).filter(
      (c) => c.deviceId === deviceId && c.status === 'active',
    );
  }
}
