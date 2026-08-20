export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
}

export interface ChatResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIProvider {
  chat(request: ChatRequest): Promise<ChatResponse>;
}

export interface MockAIProviderOptions {
  shouldError?: boolean;
}

export class MockAIProvider implements AIProvider {
  private shouldError: boolean;

  constructor(options?: MockAIProviderOptions) {
    this.shouldError = options?.shouldError ?? false;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    if (this.shouldError) {
      throw new Error('Mock error');
    }

    const lastMessage = request.messages[request.messages.length - 1];
    const responseContent = this.generateResponse(lastMessage.content);
    const maxTokens = request.maxTokens ?? 100;
    const completionTokens = Math.min(responseContent.split(' ').length, maxTokens);

    return {
      content: responseContent,
      usage: {
        promptTokens: request.messages.reduce((sum, m) => sum + m.content.split(' ').length, 0),
        completionTokens,
        totalTokens: request.messages.reduce((sum, m) => sum + m.content.split(' ').length, 0) + completionTokens,
      },
    };
  }

  private generateResponse(input: string): string {
    // Deterministic response based on input
    const hash = this.simpleHash(input);
    const responses = [
      'I understand your message.',
      'That is an interesting point.',
      'Let me think about that.',
      'I agree with your perspective.',
      'Here is what I think about that.',
    ];
    return responses[hash % responses.length];
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
  }
}
