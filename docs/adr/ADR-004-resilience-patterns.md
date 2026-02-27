# ADR-004: Resilience Patterns for External Integrations

## Status

Accepted

## Context

IdeaFlow integrates with several external services:

- **Supabase**: Database and authentication
- **OpenAI**: AI completions for idea breakdown
- **Anthropic**: Alternative AI provider
- **GitHub**: Repository automation
- **Notion**: Export destination

Each external service can fail due to:

- Network issues
- Rate limiting
- Service outages
- Timeouts
- Invalid responses

The system needs to handle these failures gracefully without crashing the application or providing poor user experience.

## Decision

Implement a comprehensive resilience framework with three core patterns:

### 1. Circuit Breaker

Prevents cascading failures by stopping requests to failing services:

```typescript
interface CircuitBreakerConfig {
  failureThreshold: number; // Failures before opening
  successThreshold: number; // Successes before closing
  timeout: number; // Time to wait before retry
}

class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open';

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      throw new CircuitOpenError();
    }
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}
```

**States:**

- **Closed**: Normal operation, requests pass through
- **Open**: Service considered failing, requests rejected immediately
- **Half-Open**: Testing if service recovered, limited requests allowed

### 2. Retry with Exponential Backoff

Automatically retries failed operations with increasing delays:

```typescript
interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // Initial delay in ms
  maxDelay: number; // Maximum delay cap
  backoffMultiplier: number;
  retryableErrors: string[]; // Error codes that trigger retry
}

async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig
): Promise<T> {
  let lastError: Error;
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isRetryable(error) || attempt === config.maxRetries) {
        throw error;
      }
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
        config.maxDelay
      );
      await sleep(delay);
    }
  }
  throw lastError!;
}
```

### 3. Timeout Management

Prevents operations from hanging indefinitely:

```typescript
interface TimeoutConfig {
  default: number; // Default timeout in ms
  perOperation: Map<string, number>; // Operation-specific timeouts
}

async function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number
): Promise<T> {
  let timeoutHandle: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new TimeoutError(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([operation, timeoutPromise]);
  } finally {
    clearTimeout(timeoutHandle!);
  }
}
```

### 4. Resilient Wrapper

Unified interface combining all patterns:

```typescript
interface ResilientOperationConfig {
  circuitBreaker?: CircuitBreakerConfig;
  retry?: RetryConfig;
  timeout?: number;
}

async function resilient<T>(
  operation: () => Promise<T>,
  config: ResilientOperationConfig
): Promise<T> {
  let op = operation;

  if (config.timeout) {
    op = () => withTimeout(op(), config.timeout);
  }

  if (config.retry) {
    op = () => withRetry(op, config.retry);
  }

  if (config.circuitBreaker) {
    op = () => circuitBreaker.execute(op);
  }

  return op();
}
```

### 5. Configuration by Service

Each external service has tailored configuration:

| Service   | Circuit Breaker | Retry     | Timeout |
| --------- | --------------- | --------- | ------- |
| Supabase  | 5 failures, 30s | 3 retries | 10s     |
| OpenAI    | 3 failures, 60s | 3 retries | 60s     |
| Anthropic | 3 failures, 60s | 3 retries | 60s     |
| GitHub    | 5 failures, 30s | 3 retries | 15s     |

## Alternatives Considered

### 1. Use Only Retries

- **Pros**: Simple to implement
- **Cons**: Can overwhelm failing services, no fast-fail
- **Verdict**: Insufficient alone

### 2. Third-Party Resilience Libraries (e.g., opossum)

- **Pros**: Battle-tested, feature-rich
- **Cons**: Additional dependency, may not match our needs exactly
- **Verdict**: Could evaluate later

### 3. Let Failures Crash the App

- **Pros**: Simpler code, failures are visible
- **Cons**: Poor UX, cascading failures possible
- **Verdict**: Unacceptable for production

### 4. Infinite Retries with No Backoff

- **Pros**: Eventually succeeds
- **Cons**: Can cause thundering herd, infinite loops
- **Verdict**: Dangerous pattern, rejected

## Consequences

### Positive

- **Reliability**: System handles failures gracefully
- **Observability**: Clear error types, easy debugging
- **User Experience**: Users see meaningful errors, not crashes
- **Performance**: Fast-fail prevents resource exhaustion
- **Maintainability**: Centralized configuration

### Negative

- **Complexity**: Additional code to understand
- **Latency**: Retries add delay on failures
- **Testing**: Need to simulate failure scenarios

### Mitigations

- Document each pattern clearly
- Add logging for all state changes
- Test with chaos engineering
- Monitor circuit breaker states

## References

- [Resilience Framework](../../src/lib/resilience/)
- [Circuit Breaker Implementation](../../src/lib/resilience/circuit-breaker.ts)
- [Retry Manager](../../src/lib/resilience/retry-manager.ts)
- [Timeout Manager](../../src/lib/resilience/timeout-manager.ts)
- [Resilient Wrapper](../../src/lib/resilience/resilient-wrapper.ts)

## Notes

- Consider adding bulkhead pattern for parallel operations
- Could add cache fallback for read operations
- Monitor and alert on circuit breaker state changes
- Review timeouts as services evolve
