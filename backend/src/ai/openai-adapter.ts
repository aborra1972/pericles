import type { AIProvider, ChatRequest, ChatResponse } from './mock-provider.js';

export interface OpenAIAdapterOptions {
  apiKey: string;
  model?: string;
}

export class OpenAIAdapter implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor(options: OpenAIAdapterOptions) {
    this.apiKey = options.apiKey;
    this.model = options.model ?? 'gpt-4o';
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: request.messages,
        max_tokens: request.maxTokens,
        temperature: request.temperature,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
    };
  }
}
