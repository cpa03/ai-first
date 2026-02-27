# ADR-004: Implement Rate Limiting at API Level

## Status

Accepted

## Context

The IdeaFlow API exposes endpoints that generate AI responses, which are computationally expensive and cost-sensitive. Without rate limiting:

- Malicious users could exhaust API quotas
- Costs could spiral from runaway requests
- Service quality could degrade for legitimate users
- External AI provider rate limits could be hit

We needed a robust, configurable rate limiting solution that works in serverless environments.

## Decision

Implement in-memory rate limiting at the API route level with tiered access control.

### Rate Limit Tiers

| Tier          | Requests/Minute | Use Case                    |
| ------------- | --------------- | --------------------------- |
| Anonymous     | 30              | Unauthenticated users       |
| Authenticated | 60              | Regular logged-in users     |
| Premium       | 120             | Paying subscribers          |
| Enterprise    | 300             | Large organization accounts |

### Endpoint Presets

| Preset   | Requests/Minute | Use Case                   |
| -------- | --------------- | -------------------------- |
| Strict   | 10              | Admin/sensitive endpoints  |
| Moderate | 30              | Standard API endpoints     |
| Lenient  | 60              | Public/read-only endpoints |

### Implementation

```typescript
// Location: src/lib/rate-limit.ts
// Configuration: src/lib/config/rate-limit-config.ts

// Example usage in API route:
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(request: Request) {
  const rateLimitResult = await checkRateLimit({
    identifier: userId || ipAddress,
    tier: userRole || 'anonymous',
  });

  if (!rateLimitResult.success) {
    return Response.json(
      { error: 'RATE_LIMIT_EXCEEDED', retryAfter: rateLimitResult.reset },
      { status: 429, headers: { 'Retry-After': String(rateLimitResult.reset) } }
    );
  }
}
```

## Consequences

### Positive

- **Cost control**: Prevents runaway AI API costs
- **Fair usage**: All users get equitable access
- **Configurable**: Environment variable overrides per tier
- **Serverless-friendly**: In-memory, no external dependencies
- **Granular**: Different limits per endpoint type and user tier

### Negative

- **Memory usage**: In-memory store uses server memory
- **Not distributed**: Multiple instances have separate limits
- **No persistence**: Limits reset on cold starts
- **Complex**: Multiple configuration options to manage

## Alternatives Considered

- **Third-party services (Redis, Upstash)**: Would add latency and cost
- **API Gateway rate limiting**: Tied to hosting provider
- **Token bucket algorithm**: More complex to implement correctly

## References

- [Rate Limit Implementation](./error-codes.md#rate-limiting)
- [Rate Limit Configuration](./api.md#rate-limits)
- [Security Headers](./security-headers.md)
