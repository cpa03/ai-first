# ADR-005: Use Circuit Breaker Pattern for External AI Services

## Status

Accepted

## Context

IdeaFlow relies on external AI providers (OpenAI, Anthropic) for generating breakdowns and plans. These external services can:

- Experience downtime or degraded performance
- Have rate limits that get exceeded
- Return errors during high load
- Experience network issues

Without protection, a single failing AI provider could:

- Block all breakdown generation
- Cause cascading failures
- Exhaust server resources with retries

## Decision

Implement a Circuit Breaker pattern to protect against failing external AI services.

### Circuit Breaker States

```
CLOSED (Normal) → Failures accumulate → OPEN (Failing) → Recovery timeout → HALF_OPEN (Testing)
```

| State         | Behavior                                         |
| ------------- | ------------------------------------------------ |
| **Closed**    | Requests pass through normally, failures counted |
| **Open**      | Requests fail immediately, no AI calls made      |
| **Half-Open** | Limited requests allowed to test recovery        |

### Configuration

| Service   | Timeout | Failure Threshold | Recovery Time |
| --------- | ------- | ----------------- | ------------- |
| OpenAI    | 30s     | 5 failures        | 30s           |
| Anthropic | 30s     | 5 failures        | 30s           |
| GitHub    | 10s     | 3 failures        | 30s           |
| Notion    | 10s     | 3 failures        | 30s           |

### Implementation

```typescript
// Location: src/lib/resilience/

// Using the resilient wrapper:
import { resilient } from '@/lib/resilience';

const result = await resilient(() => openai.chat.completions.create(messages), {
  service: 'openai',
  timeoutMs: 30000,
  failureThreshold: 5,
  retryConfig: { maxAttempts: 3, baseDelayMs: 1000 },
});

// Circuit breaker automatically:
// - Tracks failures per service
// - Opens circuit after threshold
// - Allows recovery attempts
// - Logs all state changes
```

## Consequences

### Positive

- **Fault isolation**: One provider failure doesn't cascade
- **Automatic recovery**: Self-healing after failures
- **Observable**: Detailed logging of state transitions
- **Configurable**: Per-service thresholds and timeouts
- **Resource efficiency**: No wasted retries on failing services

### Negative

- **Complexity**: Additional code to understand and maintain
- **Potential delays**: Recovery time before service is retried
- **State management**: Circuit state needs to be tracked
- **Testing challenges**: Circuit states hard to reproduce in tests

## Alternatives Considered

- **Simple retry only**: Doesn't prevent cascading failures
- **No protection**: Would cause complete failure during outages
- **Heavy circuit breaker library**: Overkill for our needs

## References

- [Resilience Module](./integration-hardening.md)
- [Circuit Breaker Implementation](./src/lib/resilience/circuit-breaker.ts)
- [Resilience Configuration](./src/lib/resilience/config.ts)
