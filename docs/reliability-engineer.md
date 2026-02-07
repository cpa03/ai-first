# Reliability Engineer Guide

This document provides guidelines and best practices for maintaining code reliability in the AI-First application.

## Overview

As a reliability engineer, your primary responsibilities include:

- Identifying and fixing bugs that affect system stability
- Ensuring proper error handling and recovery mechanisms
- Maintaining code quality through linting and type checking
- Writing and maintaining reliable tests
- Monitoring system health and performance

## Recent Fixes & Improvements

### 1. ESLint Plugin Dependencies

**Issue**: `eslint-plugin-react-hooks` was missing from devDependencies, causing lint to fail.

**Fix**:

```bash
npm install eslint-plugin-react-hooks@latest --save-dev
```

**Impact**: Linting now works correctly, catching React hooks violations.

### 2. React Hooks Violations in clarify/page.tsx

**Issue**: Using `setState` directly within `useEffect` caused cascading renders and violated React best practices.

**Before**:

```typescript
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const ideaFromUrl = urlParams.get('idea');

  if (ideaFromUrl) {
    setIdea(decodeURIComponent(ideaFromUrl)); // Violation!
  }
  setLoading(false);
}, []);
```

**After**:

```typescript
function getInitialParams() {
  if (typeof window === 'undefined') {
    return { idea: '', ideaId: '' };
  }
  const urlParams = new URLSearchParams(window.location.search);
  return {
    idea: urlParams.get('idea')
      ? decodeURIComponent(urlParams.get('idea')!)
      : '',
    ideaId: urlParams.get('ideaId') || '',
  };
}

// Use lazy initialization
const [idea] = useState<string>(() => getInitialParams().idea);
```

**Key Principles**:

- Initialize state from URL params using lazy initialization
- Use `requestAnimationFrame` for hydration markers instead of direct setState in effects
- Avoid synchronizing external state (URL) with React state in effects

### 3. Unused Parameters in Export Manager

**Issue**: Constructor parameter `options` was defined but never used.

**Fix**: Prefix unused parameters with underscore:

```typescript
constructor(_options: ExportManagerOptions = {}) {
  // Parameter intentionally unused for future extensibility
}
```

### 4. Test Logic Bug in Resilience Tests

**Issue**: Test used `.includes('retryable')` which matched both "retryable error" and "non-retryable error".

**Before**:

```typescript
shouldRetry: (error) => error.message.includes('retryable');
```

**After**:

```typescript
shouldRetry: (error) => error.message === 'retryable error';
```

**Lesson**: String matching with `.includes()` can have unintended matches. Use exact matching or proper regex with word boundaries when precision matters.

## Build & Quality Checks

### Running Checks

```bash
# Run linter
npm run lint

# Run TypeScript type checking
npm run type-check

# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

### Pre-commit Checklist

- [ ] `npm run lint` passes with no errors (warnings OK if < 50)
- [ ] `npm run type-check` passes with no errors
- [ ] All tests pass: `npm test`
- [ ] No `any` types added (unless absolutely necessary)
- [ ] Error handling added for all async operations
- [ ] PII redaction applied to all logs

## Reliability Patterns

### 1. Error Handling

Always use structured error handling with custom error classes:

```typescript
import { AppError, ErrorCode } from '@/lib/errors';

try {
  await riskyOperation();
} catch (error) {
  if (error instanceof AppError) {
    // Handle known error type
    logger.errorWithContext('Operation failed', {
      code: error.code,
      retryable: error.retryable,
    });
  } else {
    // Wrap unknown errors
    throw new AppError(
      'Unexpected error',
      ErrorCode.INTERNAL_ERROR,
      500,
      undefined,
      false
    );
  }
}
```

### 2. Retry Logic

Use the built-in retry manager for resilient operations:

```typescript
import { withRetry } from '@/lib/resilience';

const result = await withRetry(
  () => fetchData(),
  {
    maxRetries: 3,
    baseDelay: 1000,
    shouldRetry: (error) => error.message.includes('timeout'),
  },
  'fetchData-operation'
);
```

### 3. Circuit Breaker

Protect external service calls with circuit breakers:

```typescript
import { CircuitBreaker } from '@/lib/resilience';

const breaker = new CircuitBreaker('external-service', {
  failureThreshold: 5,
  resetTimeout: 30000,
});

try {
  const result = await breaker.execute(() => callExternalService());
} catch (error) {
  if (error.message.includes('Circuit breaker is OPEN')) {
    // Handle circuit breaker open state
  }
}
```

### 4. PII Redaction

Always redact PII in logs:

```typescript
import { createLogger } from '@/lib/logger';

const logger = createLogger('MyComponent');

// Automatic PII redaction
logger.info('User action', { userId, email: user.email }); // Email will be redacted
```

### 5. Rate Limiting

Implement rate limiting for API endpoints:

```typescript
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const rateLimitResult = await checkRateLimit(request);

  if (!rateLimitResult.success) {
    return new Response('Rate limit exceeded', {
      status: 429,
      headers: {
        'Retry-After': String(rateLimitResult.retryAfter),
      },
    });
  }

  // Process request
}
```

## Testing Best Practices

### 1. Test Reliability

Tests should be deterministic and not depend on timing:

```typescript
// Bad - depends on actual timing
await new Promise((resolve) => setTimeout(resolve, 1000));

// Good - use Jest fake timers
jest.useFakeTimers();
jest.advanceTimersByTime(1000);
```

### 2. Error Testing

Test both success and error paths:

```typescript
it('should handle errors gracefully', async () => {
  const operation = jest
    .fn()
    .mockRejectedValueOnce(new Error('First failure'))
    .mockRejectedValueOnce(new Error('Second failure'))
    .mockResolvedValue('success');

  await expect(operation()).rejects.toThrow('First failure');
});
```

### 3. Mock External Services

Always mock external dependencies:

```typescript
jest.mock('@/lib/ai', () => ({
  aiService: {
    generateQuestions: jest.fn().mockResolvedValue({
      questions: [{ id: '1', text: 'Test?' }],
    }),
  },
}));
```

## Monitoring & Observability

### Health Checks

Monitor system health via the health API:

```bash
curl /api/health
curl /api/health/detailed
curl /api/health/database
```

### Logging Levels

Use appropriate log levels:

- **ERROR**: System errors that require immediate attention
- **WARN**: Potential issues that don't affect functionality
- **INFO**: Important business events
- **DEBUG**: Detailed information for debugging

### Context in Logs

Always include context for easier debugging:

```typescript
logger.errorWithContext('Operation failed', {
  component: 'ExportManager',
  action: 'exportToNotion',
  metadata: {
    ideaId,
    format: 'notion',
  },
});
```

## Common Issues & Solutions

### Issue: Flaky Tests

**Solution**:

- Use `jest.useFakeTimers()` for timing-dependent code
- Mock external services consistently
- Avoid race conditions with proper async/await

### Issue: Memory Leaks

**Solution**:

- Clean up subscriptions in `useEffect` cleanup
- Cancel pending requests on unmount
- Use `AbortController` for fetch requests

### Issue: Type Errors

**Solution**:

- Enable strict TypeScript mode
- Avoid `any` types
- Use proper type guards
- Run `npm run type-check` regularly

### Issue: Performance Degradation

**Solution**:

- Use React.memo for expensive components
- Implement proper caching strategies
- Lazy load non-critical components
- Monitor bundle size

## Resources

- [React Performance](https://react.dev/learn/render-and-commit)
- [Jest Best Practices](https://jestjs.io/docs/best-practices)
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)
- [Error Handling Patterns](https://github.com/goldbergyoni/nodebestpractices#2-error-handling-practices)

## Contact

For reliability issues or questions:

- Create an issue in the GitHub repository
- Tag with `reliability` label
- Include steps to reproduce and expected behavior
