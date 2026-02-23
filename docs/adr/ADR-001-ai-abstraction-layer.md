# ADR-001: AI Provider Abstraction Layer

## Status

Accepted

## Context

IdeaFlow's core value proposition is transforming raw ideas into structured project plans using AI. The system needs to:

1. Call AI models for clarification, breakdown, and timeline generation
2. Support multiple AI providers (OpenAI, Anthropic) to avoid vendor lock-in
3. Handle rate limits, timeouts, and failures gracefully
4. Enable testing without making actual API calls
5. Track costs and usage across providers

Initially, the codebase had direct OpenAI API calls scattered throughout. This created several problems:

- **Vendor Lock-in**: Switching providers required changes in multiple files
- **Testing Difficulty**: Tests had to mock the OpenAI SDK directly
- **Inconsistent Error Handling**: Different files handled errors differently
- **No Cost Visibility**: Hard to track API usage and costs

## Decision

Implement an AI abstraction layer (`src/lib/ai.ts`) with the following architecture:

### Core Interface

```typescript
interface AIProvider {
  complete(
    prompt: string,
    options?: CompletionOptions
  ): Promise<CompletionResult>;
  embed?(text: string): Promise<number[]>;
}
```

### Implementation Details

1. **Provider Registry**: Map of provider names to implementations
2. **Factory Pattern**: `getAIProvider()` returns configured provider
3. **Resilience Integration**: All calls wrapped with circuit breaker and retry
4. **Configuration-Driven**: Provider selection via environment variables
5. **Structured Logging**: All calls logged with timing and token counts

### Supported Providers

| Provider  | Model  | Use Case                                |
| --------- | ------ | --------------------------------------- |
| OpenAI    | GPT-4o | Complex reasoning, breakdown generation |
| Anthropic | Claude | Alternative for cost optimization       |
| Mock      | -      | Testing and development                 |

### Configuration

```typescript
const AI_CONFIG = {
  provider: process.env.AI_PROVIDER || 'openai',
  model: process.env.AI_MODEL || 'gpt-4o',
  timeout: 60000,
  maxRetries: 3,
};
```

## Alternatives Considered

### 1. Direct Provider SDKs

- **Pros**: Simpler initial setup, access to provider-specific features
- **Cons**: Vendor lock-in, scattered error handling, difficult testing
- **Verdict**: Rejected due to maintenance burden

### 2. LangChain

- **Pros**: Pre-built abstractions, ecosystem support
- **Cons**: Additional dependency, abstraction leak, complexity
- **Verdict**: Rejected; our needs are simple enough for custom abstraction

### 3. Single Provider Only

- **Pros**: Simpler codebase
- **Cons**: Vendor lock-in, no cost optimization options
- **Verdict**: Rejected; flexibility is critical for product strategy

## Consequences

### Positive

- **Provider Independence**: Can switch providers by changing config
- **Testability**: Mock provider enables fast, deterministic tests
- **Observability**: Centralized logging and metrics for AI calls
- **Resilience**: Built-in circuit breaker and retry logic
- **Cost Control**: Track usage per provider, optimize spending

### Negative

- **Abstraction Cost**: Additional layer adds complexity
- **Feature Lag**: Provider-specific features require explicit support
- **Type Safety**: Generic interface may miss provider-specific options

### Mitigations

- Keep the interface minimal and focused
- Add provider-specific extensions through options object
- Document provider capabilities and limitations

## References

- [AI Service Implementation](../../src/lib/ai.ts)
- [Resilience Framework](../../src/lib/resilience/)
- [Architecture Documentation](../architecture.md#ai-abstraction-layer)

## Notes

- Consider adding streaming support for long-running completions
- May need to add embedding provider interface for vector search features
- Monitor provider-specific rate limits and adjust configuration accordingly
