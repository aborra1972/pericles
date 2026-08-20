# ADR-008: AI Provider

## Status

Proposed

## Context

Pericles uses AI for conversation, daily briefings, memory summarization, and personality expression. The PRD establishes:
- OpenAI is the MVP provider
- Three user-facing quality profiles: `Económico`, `Equilibrado`, `Máxima calidad`
- The backend can change the internal model per profile without exposing technical names
- API keys are stored server-side; the device never holds them
- The architecture must admit Gemini, Anthropic, or Ollama in future phases
- On failure, retry then fall back to offline mode

## Decision

### Provider Adapter Pattern

**Chosen**: An abstract `AIProvider` interface with OpenAI as the first implementation.

```typescript
interface AIProvider {
  name: string;
  converse(request: ConverseRequest): Promise<ConverseResponse>;
  converseStream(request: ConverseRequest): AsyncIterable<StreamChunk>;
  healthCheck(): Promise<boolean>;
}

interface ConverseRequest {
  messages: Message[];
  model: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
}

interface ConverseResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

interface StreamChunk {
  content: string;
  done: boolean;
}
```

Adding a new provider means implementing this interface. No changes to the backend routing or device protocol.

### Quality Profiles

Three user-facing profiles that map to concrete models:

| Profile | Display Name | Model | Max Tokens | Temperature | Cost Tier |
|---------|-------------|-------|------------|-------------|-----------|
| `economico` | Económico | `gpt-4o-mini` | 1024 | 0.7 | Low |
| `equilibrado` | Equilibrado | `gpt-4o` | 2048 | 0.7 | Medium |
| `maxima` | Máxima calidad | `gpt-4o` | 4096 | 0.8 | Medium-High |

**Profile configuration** (server-side, not exposed to device):

```typescript
const PROFILES = {
  economico: {
    model: 'gpt-4o-mini',
    maxTokens: 1024,
    temperature: 0.7,
    systemPromptModifiers: [],
  },
  equilibrado: {
    model: 'gpt-4o',
    maxTokens: 2048,
    temperature: 0.7,
    systemPromptModifiers: [],
  },
  maxima: {
    model: 'gpt-4o',
    maxTokens: 4096,
    temperature: 0.8,
    systemPromptModifiers: [
      'Be more thoughtful and detailed in your responses.',
      'Take time to consider nuances and edge cases.',
    ],
  },
};
```

The device sends `"profile": "equilibrado"` — never a model name. The backend resolves to the actual model. This lets us change models without device updates.

### System Prompt Architecture

The system prompt is assembled server-side from components:

```
Base personality (CHARACTER.md content)
  + Profile modifiers (quality-level additions)
  + Person context (name, preferences, memories)
  + Session context (time of day, recent conversation)
  + Safety instructions (content boundaries)
```

The device sends minimal context; the backend builds the full prompt. This keeps the prompt engineering on the server where it can be updated without firmware changes.

### Retry Strategy

```
Request fails
  → Wait 1s, retry (attempt 2)
  → Wait 3s, retry (attempt 3)
  → Wait 10s, retry (attempt 4)
  → All retries exhausted → enter offline mode
```

**Offline mode**:
- Device shows `offline` overlay on current face
- Device responds with cached/common responses from local storage
- Conversation continues in degraded mode (no AI, no memory)
- When connectivity returns, queued messages are processed (MVP: volatile queue, lost on reboot)

### Model Selection via Environment

```typescript
// ADR-008: AI Provider configuration
OPENAI_API_KEY=sk-...           // From ADR-003
OPENAI_MODEL_ECONOMIC=gpt-4o-mini
OPENAI_MODEL_BALANCED=gpt-4o
OPENAI_MODEL_PREMIUM=gpt-4o
```

Models can be swapped per-profile without code changes. The configurator's "quality" selector maps to profile names, not model names.

### Future Provider Support

The adapter pattern allows adding providers without changing the core:

```typescript
// Future: Gemini adapter
class GeminiProvider implements AIProvider {
  name = 'gemini';
  async converse(request: ConverseRequest) { /* ... */ }
  async converseStream(request: ConverseRequest) { /* ... */ }
  async healthCheck() { /* ... */ }
}

// Future: Anthropic adapter
class AnthropicProvider implements AIProvider { /* ... */ }

// Future: Ollama adapter (local)
class OllamaProvider implements AIProvider { /* ... */ }
```

Provider selection is a backend configuration, not a device setting. The device only knows about quality profiles.

### Response Post-Processing

After receiving the AI response, the backend:

1. **Extracts emotion hint**: the system prompt instructs the model to include an emotion tag like `[emotion: happy]` at the start of the response. The backend strips this tag and passes it separately to the device for skin selection.
2. **Extracts memory candidates**: the system prompt instructs the model to include `[memory: ...]` tags for information worth remembering. The backend processes these into memory entries.
3. **Formats for display**: the backend ensures the response is suitable for the 240×240 round display (line breaks, length limits).

```typescript
interface ConverseResponse {
  text: string;           // Clean text for TTS and display
  emotion: EmotionType;   // For skin selection
  memories: MemoryDraft[]; // For memory creation
  usage: TokenUsage;      // For cost tracking
}
```

## Consequences

- **Backend owns the AI**: the device is a thin client for AI interaction. Model changes, prompt engineering, and provider switching happen server-side.
- **Quality profiles hide complexity**: users choose "Económico" or "Máxima calidad" — never model names or temperatures.
- **Retry is automatic**: the device doesn't handle retries; the backend does. The device just shows status.
- **Offline mode is degraded but functional**: conversation continues without AI, using cached responses.
- **Future-proof**: adding Gemini or Anthropic means writing one adapter class. No device changes needed.

## Test Strategy

- Profile resolution: map each profile name to the correct model and parameters
- Retry logic: mock provider failure → verify retry timing → verify fallback to offline
- Emotion extraction: send response with `[emotion: happy]` → verify clean text + emotion
- Memory extraction: send response with `[memory: ...]` → verify memory draft is created
- Provider health check: mock provider → verify health endpoint reflects status
- Cost tracking: verify token usage is logged per request

## Rollback Boundary

This ADR defines the AI provider abstraction and quality profiles. Reverting means removing the adapter pattern and hardcoding OpenAI calls. Provider switching and quality profiles would need rewriting.
