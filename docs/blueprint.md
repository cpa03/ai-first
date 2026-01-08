# Integration Blueprint

This document outlines the integration patterns and architectural decisions for building robust, resilient integrations in IdeaFlow.

## Table of Contents

1. [Core Principles](#core-principles)
2. [API Design Patterns](#api-design-patterns)
3. [Resilience Patterns](#resilience-patterns)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Circuit Breakers](#circuit-breakers)
7. [Retry Logic](#retry-logic)
8. [Timeouts](#timeouts)
9. [Health Monitoring](#health-monitoring)
10. [API Standardization](#api-standardization)

## Core Principles

### Contract First

Define API contracts before implementation:

```typescript
export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  requestId: string;
  timestamp: string;
}

export interface ApiContext {
  requestId: string;
  request: NextRequest;
  rateLimit: RateLimitInfo;
}
```

### Resilience

External services WILL fail; handle gracefully:

- Timeouts on all external calls
- Retry with exponential backoff
- Circuit breakers to prevent cascading failures
- Fallbacks for degraded functionality

### Consistency

Predictable patterns everywhere:

- Standardized error responses
- Consistent naming conventions
- Uniform API structure
- Reusable middleware

### Backward Compatibility

Don't break consumers:

- Version endpoints when breaking changes are required
- Maintain old endpoints for deprecation period
- Use feature flags for gradual rollouts

### Self-Documenting

Intuitive, well-documented APIs:

- TypeScript types for all interfaces
- JSDoc comments on complex functions
- Example requests/responses in documentation
- Clear error messages with suggested fixes

### Idempotency

Safe operations produce same result:

- Use request IDs for deduplication
- Design operations to be safe when retried
- Return same response for identical requests

## API Design Patterns

### Standard Response Format

All successful responses follow this pattern:

```typescript
{
  "success": true,
  "data": { ... },
  "requestId": "req_1234567890_abc123",
  "timestamp": "2024-01-07T12:00:00Z"
}
```

### Error Response Format

All errors follow this pattern:

```typescript
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": [
    { "field": "fieldName", "message": "Validation message" }
  ],
  "timestamp": "2024-01-07T12:00:00Z",
  "requestId": "req_1234567890_abc123",
  "retryable": true
}
```

### Request ID Generation

Every request gets a unique ID for tracing:

```typescript
export function generateRequestId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `req_${timestamp}_${random}`;
}
```

Include in all responses:

- Header: `X-Request-ID`
- Body: `requestId` field

### Route Handler Wrapper

Use `withApiHandler` for all API routes:

```typescript
import {
  withApiHandler,
  standardSuccessResponse,
  ApiContext,
} from '@/lib/api-handler';

async function handlePost(context: ApiContext) {
  const { request } = context;
  const { idea } = await request.json();

  const result = await processIdea(idea);

  return standardSuccessResponse({ session: result }, context.requestId);
}

export const POST = withApiHandler(handlePost, {
  rateLimit: 'moderate',
  validateSize: true,
});
```

## Resilience Patterns

### Resilience Framework

Centralized resilience management in `src/lib/resilience.ts`:

```typescript
export const resilienceManager = {
  execute<T>(
    operation: () => Promise<T>,
    config: ResilienceConfig,
    context?: string
  ): Promise<T>
};
```

### Per-Service Configuration

Default configurations for each service:

```typescript
export const defaultResilienceConfigs: Record<string, ResilienceConfig> = {
  openai: {
    timeoutMs: 60000,
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 10000,
    circuitBreakerThreshold: 5,
    circuitBreakerResetMs: 60000,
  },
  github: {
    timeoutMs: 30000,
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 5000,
    circuitBreakerThreshold: 5,
    circuitBreakerResetMs: 30000,
  },
  notion: {
    timeoutMs: 30000,
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 5000,
    circuitBreakerThreshold: 5,
    circuitBreakerResetMs: 30000,
  },
  trello: {
    timeoutMs: 15000,
    maxRetries: 3,
    baseDelayMs: 500,
    maxDelayMs: 3000,
    circuitBreakerThreshold: 3,
    circuitBreakerResetMs: 20000,
  },
};
```

### Wrapping External API Calls

```typescript
import { resilienceManager, defaultResilienceConfigs } from '@/lib/resilience';

const result = await resilienceManager.execute(
  async () => {
    return await externalAPI.fetchData();
  },
  defaultResilienceConfigs.github,
  'github-fetch-user'
);
```

## Error Handling

### Error Code Hierarchy

Standardized error codes in `src/lib/errors.ts`:

```typescript
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  PAYLOAD_TOO_LARGE = 'PAYLOAD_TOO_LARGE',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  CIRCUIT_BREAKER_OPEN = 'CIRCUIT_BREAKER_OPEN',
  RETRY_EXHAUSTED = 'RETRY_EXHAUSTED',
}
```

### Specialized Error Classes

```typescript
export class ValidationError extends AppError {
  constructor(details: ErrorDetail[]) {
    super('Validation failed', ErrorCode.VALIDATION_ERROR, 400, details);
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, service: string, originalError?: Error) {
    super(
      `${service}: ${message}`,
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      502,
      undefined,
      originalError
    );
    this.service = service;
  }
}
```

### Error Response Generation

```typescript
export function toErrorResponse(
  error: unknown,
  requestId: string
): NextResponse {
  const errorResponse = {
    error: error instanceof Error ? error.message : 'Unknown error',
    code: error instanceof AppError ? error.code : 'INTERNAL_ERROR',
    details: error instanceof AppError ? error.details : undefined,
    timestamp: new Date().toISOString(),
    requestId,
    retryable: error instanceof AppError ? error.retryable : false,
  };

  const status = error instanceof AppError ? error.statusCode : 500;

  return NextResponse.json(errorResponse, { status });
}
```

## Rate Limiting

### Rate Limit Tiers

Role-based rate limiting:

```typescript
export const rateLimitConfigs = {
  strict: { limit: 10, windowMs: 60000 }, // 10/min
  moderate: { limit: 50, windowMs: 60000 }, // 50/min
  lenient: { limit: 100, windowMs: 60000 }, // 100/min
};
```

### Rate Limit Middleware

```typescript
export function checkRateLimit(
  identifier: string,
  config: { limit: number; windowMs: number }
): { allowed: boolean; info: RateLimitInfo } {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  const requests = rateLimitStore.get(identifier) || [];
  const recentRequests = requests.filter((r) => r >= windowStart);

  if (recentRequests.length >= config.limit) {
    return {
      allowed: false,
      info: {
        limit: config.limit,
        remaining: 0,
        reset: Math.max(...recentRequests) + config.windowMs,
      },
    };
  }

  recentRequests.push(now);
  rateLimitStore.set(identifier, recentRequests);

  return {
    allowed: true,
    info: {
      limit: config.limit,
      remaining: config.limit - recentRequests.length,
      reset: windowStart + config.windowMs,
    },
  };
}
```

### Rate Limit Headers

Include in all responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704614400
```

### Rate Limit Response

```json
{
  "error": "Rate limit exceeded. Retry after 60 seconds",
  "code": "RATE_LIMIT_EXCEEDED",
  "timestamp": "2024-01-07T12:00:00Z",
  "requestId": "req_1234567890_abc123",
  "retryable": true
}
```

## Circuit Breakers

### Circuit Breaker States

- **Closed**: Normal operation, requests pass through
- **Open**: Service failing, requests blocked
- **Half-Open**: Testing recovery, allow limited requests

### Circuit Breaker Configuration

```typescript
export interface CircuitBreakerConfig {
  threshold: number; // Failures before opening
  resetTimeout: number; // Time before half-open
  timeout: number; // Timeout per request
}
```

### Circuit Breaker Usage

```typescript
import { CircuitBreaker } from '@/lib/resilience';

const circuitBreaker = new CircuitBreaker({
  threshold: 5,
  resetTimeout: 60000,
  timeout: 30000,
});

try {
  const result = await circuitBreaker.execute(async () => {
    return await externalAPI.call();
  });
  return result;
} catch (error) {
  if (circuitBreaker.isOpen()) {
    console.log('Circuit breaker open, using fallback');
    return await fallbackData();
  }
  throw error;
}
```

### Circuit Breaker Monitoring

```typescript
const states = resilienceManager.getCircuitBreakerStates();

{
  "openai": {
    "state": "closed",
    "failures": 0,
    "lastFailure": null,
    "nextAttemptTime": null
  },
  "github": {
    "state": "open",
    "failures": 5,
    "lastFailure": "2024-01-07T12:00:00Z",
    "nextAttemptTime": "2024-01-07T12:01:00Z"
  }
}
```

## Retry Logic

### Exponential Backoff with Jitter

```typescript
export function calculateDelay(
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number
): number {
  const exponentialDelay = baseDelayMs * Math.pow(2, attempt - 1);
  const jitter = Math.random() * 0.3 * exponentialDelay;
  const delay = exponentialDelay + jitter;
  return Math.min(delay, maxDelayMs);
}
```

### Retryable Error Detection

```typescript
export function isRetryableError(error: Error): boolean {
  if (error.name === 'AbortError') return true;
  if (error.message.includes('ETIMEDOUT')) return true;
  if (error.message.includes('ECONNREFUSED')) return true;
  if (error.message.includes('ECONNRESET')) return true;
  if (error.message.includes('ENOTFOUND')) return true;
  if (error.message.includes('EAI_AGAIN')) return true;

  const statusCode = (error as any).statusCode;
  if (statusCode && statusCode >= 500) return true;
  if (statusCode === 408) return true;
  if (statusCode === 429) return true;

  return false;
}
```

### Retry Manager

```typescript
export class RetryManager {
  async withRetry<T>(
    operation: () => Promise<T>,
    config: {
      maxRetries: number;
      baseDelayMs: number;
      maxDelayMs: number;
      shouldRetry?: (error: Error, attempt: number) => boolean;
    }
  ): Promise<T>;
}
```

### Retry Usage Example

```typescript
import { RetryManager } from '@/lib/resilience';

const retryManager = new RetryManager();

const result = await retryManager.withRetry(
  async () => {
    return await externalAPI.call();
  },
  {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 10000,
  }
);
```

## Timeouts

### Timeout Manager

```typescript
export class TimeoutManager {
  async withTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number,
    context?: string
  ): Promise<T>;
}
```

### Timeout Usage

```typescript
import { TimeoutManager } from '@/lib/resilience';

const timeoutManager = new TimeoutManager();

try {
  const result = await timeoutManager.withTimeout(
    async () => {
      return await externalAPI.call();
    },
    30000,
    'external-api-call'
  );
  return result;
} catch (error) {
  if (error.name === 'TimeoutError') {
    console.log('Request timed out after 30s');
  }
  throw error;
}
```

### Timeout Configuration

Per-service timeouts in `src/lib/config/constants.ts`:

```typescript
export const TIMEOUT_CONFIG = {
  DEFAULT: 30000,
  QUICK: 5000,
  STANDARD: 10000,
  LONG: 60000,

  TRELLO: {
    CREATE_BOARD: 10000,
    CREATE_LIST: 10000,
    CREATE_CARD: 10000,
  },
  GITHUB: {
    GET_USER: 10000,
    CREATE_REPO: 30000,
  },
  NOTION: {
    CLIENT_TIMEOUT: 30000,
  },
};
```

### AbortController Cleanup

```typescript
export async function executeWithTimeout<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const result = await operation(controller.signal);
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    if (controller.signal.aborted) {
      throw new TimeoutError(
        `Operation timed out after ${timeoutMs}ms`,
        ErrorCode.TIMEOUT_ERROR
      );
    }
    throw error;
  }
}
```

## Health Monitoring

### Health Endpoints

#### Basic Health Check

`GET /api/health`

```json
{
  "status": "healthy",
  "timestamp": "2024-01-07T12:00:00Z",
  "environment": "development"
}
```

#### Detailed Health Check

`GET /api/health/detailed`

```json
{
  "status": "healthy",
  "timestamp": "2024-01-07T12:00:00Z",
  "version": "0.1.0",
  "uptime": 3600,
  "checks": {
    "database": {
      "status": "up",
      "latency": 45,
      "lastChecked": "2024-01-07T12:00:00Z"
    },
    "ai": {
      "status": "up",
      "latency": 234,
      "lastChecked": "2024-01-07T12:00:00Z"
    },
    "exports": {
      "status": "degraded",
      "error": "2/5 connectors",
      "lastChecked": "2024-01-07T12:00:00Z"
    },
    "circuitBreakers": [
      {
        "service": "openai",
        "state": "closed",
        "failures": 0
      },
      {
        "service": "trello",
        "state": "open",
        "failures": 5,
        "nextAttemptTime": "2024-01-07T12:01:00Z"
      }
    ]
  }
}
```

#### Database Health Check

`GET /api/health/database`

```json
{
  "status": "healthy",
  "service": "database",
  "timestamp": "2024-01-07T12:00:00Z",
  "environment": "development"
}
```

### Health Check Implementation

```typescript
export async function getHealthStatus(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthChecks;
}> {
  const checks: HealthChecks = {
    database: await checkDatabase(),
    ai: await checkAIService(),
    exports: await checkExportConnectors(),
  };

  const statuses = Object.values(checks).map((c) => c.status);

  if (statuses.some((s) => s === 'down')) {
    return { status: 'unhealthy', checks };
  }

  if (statuses.some((s) => s === 'degraded')) {
    return { status: 'degraded', checks };
  }

  return { status: 'healthy', checks };
}
```

## API Standardization

### Standard Success Response

```typescript
export function standardSuccessResponse<T>(
  data: T,
  requestId: string,
  status: number = 200,
  rateLimit?: RateLimitInfo
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    requestId,
    timestamp: new Date().toISOString(),
  };

  const nextResponse = NextResponse.json(response, { status });

  if (rateLimit) {
    nextResponse.headers.set('X-RateLimit-Limit', String(rateLimit.limit));
    nextResponse.headers.set(
      'X-RateLimit-Remaining',
      String(rateLimit.remaining)
    );
    nextResponse.headers.set(
      'X-RateLimit-Reset',
      String(new Date(rateLimit.reset).toISOString())
    );
  }

  return nextResponse;
}
```

### Request Size Validation

```typescript
export function validateRequestSize(request: NextRequest): ValidationResult {
  const MAX_SIZE = 1 * 1024 * 1024; // 1MB

  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > MAX_SIZE) {
    return {
      valid: false,
      errors: [
        {
          field: 'body',
          message: `Request body exceeds maximum size of ${MAX_SIZE} bytes`,
        },
      ],
    };
  }

  return { valid: true };
}
```

### Standard Response Headers

All API responses include:

```http
X-Request-ID: req_1234567890_abc123
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704614400
Content-Type: application/json
```

Error responses additionally include:

```http
X-Error-Code: ERROR_CODE
X-Retryable: true
```

## Anti-Patterns

### ❌ Don't Do This

Let external failures cascade to users:

```typescript
const result = await externalAPI.call(); // No timeout, retry, circuit breaker
return result;
```

### ✅ Do This Instead

Wrap external calls in resilience:

```typescript
const result = await resilienceManager.execute(
  async () => await externalAPI.call(),
  defaultResilienceConfigs.external,
  'external-api-call'
);
return result;
```

### ❌ Don't Do This

Inconsistent naming/response formats:

```typescript
return { data: result }; // Some routes
return { result: result }; // Other routes
return { payload: result }; // Different routes
```

### ✅ Do This Instead

Standardized response format:

```typescript
return standardSuccessResponse({ data: result }, requestId);
```

### ❌ Don't Do This

Expose internal implementation:

```typescript
return {
  data: result,
  _internalField: value,            // Leaks implementation
  _debugInfo: { ... }             // Should not be in API
};
```

### ✅ Do This Instead

Clean, external-facing API:

```typescript
return standardSuccessResponse({ data: result }, requestId);
```

### ❌ Don't Do This

External calls without timeouts:

```typescript
const result = await fetch('https://api.example.com/data');
```

### ✅ Do This Instead

Always set reasonable timeouts:

```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);

try {
  const result = await fetch('https://api.example.com/data', {
    signal: controller.signal,
  });
  clearTimeout(timeoutId);
  return result;
} catch (error) {
  clearTimeout(timeoutId);
  if (controller.signal.aborted) {
    throw new TimeoutError('Request timed out', ErrorCode.TIMEOUT_ERROR);
  }
  throw error;
}
```

### ❌ Don't Do This

Infinite retries:

```typescript
while (true) {
  try {
    return await operation();
  } catch (error) {
    // Retry forever
  }
}
```

### ✅ Do This Instead

Retry with limits and backoff:

```typescript
await retryManager.withRetry(operation, {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
});
```

## Monitoring and Observability

### Request Tracing

Every request has a unique ID:

```typescript
const requestId = generateRequestId();

console.log(`[${requestId}] Processing request`);
console.log(`[${requestId}] External API call`);
console.log(`[${requestId}] Response received`);
```

### Circuit Breaker Logging

```typescript
if (circuitBreaker.shouldOpen()) {
  console.warn(
    `[CIRCUIT BREAKER] Opening circuit for ${service} after ${failures} failures`
  );
}
```

### Retry Logging

```typescript
console.warn(`[RETRY] Attempt ${attempt}/${maxRetries} for ${operation}`, {
  error: error.message,
});
```

### Error Metrics

Track error rates per service:

```typescript
export const errorMetrics = {
  openai: { total: 0, success: 0, failure: 0 },
  github: { total: 0, success: 0, failure: 0 },
  notion: { total: 0, success: 0, failure: 0 },
};
```

## Best Practices

### 1. Always validate inputs

```typescript
const validation = validateIdea(idea);
if (!validation.valid) {
  throw new ValidationError(validation.errors);
}
```

### 2. Always handle errors gracefully

```typescript
try {
  const result = await operation();
  return standardSuccessResponse({ data: result }, requestId);
} catch (error) {
  return toErrorResponse(error, requestId);
}
```

### 3. Always include request IDs

```typescript
const requestId = generateRequestId();
console.log(`[${requestId}] Processing request`);
return standardSuccessResponse({ data: result }, requestId);
```

### 4. Always use timeouts

```typescript
const result = await resilienceManager.execute(operation, { timeoutMs: 30000 });
```

### 5. Always check circuit breakers

```typescript
const circuitBreaker = resilienceManager.getCircuitBreaker('service');
if (circuitBreaker.isOpen()) {
  return fallbackData();
}
```

### 6. Always log errors with context

```typescript
console.error(`[${requestId}] Failed to call external API`, {
  error,
  service,
  endpoint,
});
```

### 7. Always test failure paths

```typescript
describe('API Error Handling', () => {
  it('should return 502 when external service fails', async () => {
    mockExternalAPI.mockRejectedValue(new Error('Service unavailable'));

    const response = await POST(request);
    expect(response.status).toBe(502);
    expect(response.headers.get('X-Error-Code')).toBe('EXTERNAL_SERVICE_ERROR');
    expect(response.headers.get('X-Retryable')).toBe('true');
  });
});
```

## Rollback Protocol

If issues arise after deployment:

1. **Check Health Endpoint**

   ```bash
   curl http://localhost:3000/api/health/detailed
   ```

2. **Identify Failing Service**
   - Look at circuit breaker states
   - Check error rates
   - Review logs with request IDs

3. **Reset Circuit Breaker** (if safe)

   ```typescript
   await resilienceManager.resetCircuitBreaker('service-name');
   ```

4. **Review Error Logs**

   ```bash
   grep "req_[0-9]*" logs/app.log | tail -100
   ```

5. **Assess Impact**
   - Are downstream consumers affected?
   - Is data corruption possible?
   - Is user experience degraded?

6. **Rollback Decision**
   - Breaking changes → Revert immediately
   - Non-breaking but faulty → Fix forward urgently
   - Performance issues → Consider rollback if severe

7. **Document the Issue**
   - Create incident report
   - Document root cause
   - Update monitoring thresholds
   - Add test case to prevent regression

## Testing

### Integration Testing

```typescript
describe('External API Integration', () => {
  it('should retry on timeout', async () => {
    mockFetch.mockRejectedValueOnce(new Error('ETIMEDOUT'));
    mockFetch.mockResolvedValueOnce({ data: 'success' });

    const result = await callExternalAPI();
    expect(result).toEqual('success');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should open circuit breaker after threshold', async () => {
    for (let i = 0; i < 5; i++) {
      mockFetch.mockRejectedValue(new Error('Service unavailable'));
      try {
        await callExternalAPI();
      } catch (error) {
        // Expected
      }
    }

    mockFetch.mockResolvedValue({ data: 'success' });
    const circuitBreaker = resilienceManager.getCircuitBreaker('service');
    expect(circuitBreaker.state).toBe('open');

    await expect(callExternalAPI()).rejects.toThrow('Circuit breaker open');
  });
});
```

### Load Testing

```bash
# Test rate limiting
ab -n 200 -c 10 http://localhost:3000/api/clarify

# Test timeout behavior
curl --max-time 5 http://localhost:3000/api/breakdown

# Test circuit breaker
# Simulate service failures and verify circuit opens
```

### Chaos Testing

```typescript
describe('Chaos Testing', () => {
  it('should handle random network failures', async () => {
    let failureCount = 0;
    mockFetch.mockImplementation(() => {
      if (Math.random() < 0.3) {
        failureCount++;
        return Promise.reject(new Error('Random network failure'));
      }
      return Promise.resolve({ data: 'success' });
    });

    const result = await callExternalAPI();
    expect(result).toEqual('success');
    expect(failureCount).toBeGreaterThan(0);
  });
});
```

## Deployment Checklist

Before deploying integration changes:

- [ ] All API endpoints use `standardSuccessResponse()`
- [ ] All error responses use `toErrorResponse()`
- [ ] All external calls wrapped in resilience framework
- [ ] All requests have timeout configured
- [ ] All services have circuit breaker configured
- [ ] Rate limiting enabled on all public endpoints
- [ ] Health endpoint checks all critical services
- [ ] Circuit breaker states exposed in health endpoint
- [ ] Request IDs logged for all requests
- [ ] Error metrics are collected and monitored
- [ ] Integration tests pass with 100% success rate
- [ ] Load tests pass without failures
- [ ] Documentation updated with new patterns
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured
- [ ] On-call team notified of deployment

## References

- [API Reference](./api.md)
- [Error Codes](./error-codes.md)
- [Integration Hardening Implementation](./integration-hardening.md)
- [Health Monitoring](./health-monitoring.md)
- [Security Assessment](./security-assessment.md)

---

**Last Updated**: 2024-01-08
**Maintained By**: Integration Engineer
