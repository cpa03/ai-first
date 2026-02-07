# API Specialist

## Overview

The API Specialist is responsible for maintaining, fixing, and improving the IdeaFlow API layer. This includes API routes, handlers, validation, error handling, and related utilities.

## Responsibilities

### 1. API Route Maintenance

- Ensure all API routes follow consistent patterns
- Validate request/response formats
- Maintain proper error handling
- Implement proper rate limiting

### 2. Error Handling

- Standardize error responses across all endpoints
- Ensure proper error codes and messages
- Maintain retryable error detection
- Implement circuit breaker patterns

### 3. Validation

- Input validation for all API endpoints
- Request size validation
- Parameter sanitization
- Type checking

### 4. Performance & Reliability

- Rate limiting implementation
- Timeout handling
- Circuit breaker configuration
- Health check endpoints

## Known Issues & Fixes

### Fixed Issues

#### 1. Missing eslint-plugin-react-hooks

**Issue:** ESLint couldn't find the plugin "eslint-plugin-react-hooks"
**Fix:** Added dependency to package.json

```bash
npm install eslint-plugin-react-hooks@latest --save-dev
```

#### 2. setState in Effect (clarify/page.tsx)

**Issue:** Calling setState synchronously within an effect triggers cascading renders
**File:** `src/app/clarify/page.tsx:51`
**Status:** Fixed by initializing state from URL params directly

#### 3. Unused Options Parameter (manager.ts)

**Issue:** 'options' parameter is assigned a value but never used
**File:** `src/lib/export-connectors/manager.ts:24`
**Status:** Fixed by prefixing with underscore

## API Architecture

### Route Structure

```
src/app/api/
├── admin/rate-limit/       # Admin endpoints
├── clarify/                # Clarification flow
│   ├── start/route.ts      # Start clarification
│   ├── answer/route.ts     # Submit answer
│   ├── complete/route.ts   # Complete clarification
│   └── route.ts            # Main clarification endpoint
├── breakdown/              # Breakdown engine
│   └── route.ts            # Get/create breakdowns
├── health/                 # Health monitoring
│   ├── route.ts            # Basic health check
│   ├── detailed/route.ts   # Detailed health check
│   └── database/route.ts   # Database health
└── ideas/                  # Idea management
    └── [id]/
        ├── route.ts        # CRUD operations
        └── session/route.ts # Session management
```

### Core Libraries

#### api-handler.ts

Main API handler wrapper that provides:

- Rate limiting
- Request ID generation
- Error handling
- Response standardization

#### errors.ts

Error handling utilities:

- `AppError` - Base application error
- `ValidationError` - Input validation errors
- `RateLimitError` - Rate limit exceeded
- `ExternalServiceError` - External service failures
- `TimeoutError` - Operation timeouts
- `CircuitBreakerError` - Circuit breaker open
- `RetryExhaustedError` - All retries failed

#### validation.ts

Input validation functions:

- `validateIdea()` - Validate idea text
- `validateIdeaId()` - Validate idea ID format
- `validateUserResponses()` - Validate user response object
- `validateRequestSize()` - Validate request body size

#### rate-limit.ts

Rate limiting implementation:

- `checkRateLimit()` - Check if request is allowed
- `rateLimitConfigs` - Configuration for different tiers
- Rate limit headers in responses

### Error Response Format

All errors follow a consistent format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": [{ "field": "fieldName", "message": "Validation message" }],
  "timestamp": "2024-01-07T12:00:00Z",
  "requestId": "req_1234567890_abc123",
  "retryable": true,
  "suggestions": ["Suggested fix 1", "Suggested fix 2"]
}
```

### Response Headers

All API responses include these headers:

- `X-Request-ID`: Unique identifier for the request
- `X-RateLimit-Limit`: Total requests allowed per window
- `X-RateLimit-Remaining`: Remaining requests in window
- `X-RateLimit-Reset`: ISO 8601 timestamp when window resets
- `X-Error-Code`: Error code (if error)
- `X-Retryable`: Whether error is retryable (`true`/`false`)

## Testing

### Running API Tests

```bash
# Run all tests
npm test

# Run specific test files
npm test -- api-handler.test.ts
npm test -- validation.test.ts
npm test -- errors.test.ts
```

### Test Coverage

- Request/response handling
- Error scenarios
- Rate limiting
- Validation
- Circuit breakers
- Timeout handling

## Best Practices

### 1. API Handler Usage

Always use `withApiHandler` wrapper:

```typescript
export const POST = withApiHandler(handlePost, { rateLimit: 'moderate' });
```

### 2. Error Handling

Throw appropriate error types:

```typescript
throw new ValidationError([{ field: 'idea', message: 'Idea is required' }]);
throw new AppError('Not found', ErrorCode.NOT_FOUND, 404);
```

### 3. Response Formatting

Use standard success response:

```typescript
return standardSuccessResponse(data, context.requestId, 200, context.rateLimit);
```

### 4. Validation

Always validate inputs:

```typescript
const validation = validateIdea(idea);
if (!validation.valid) {
  throw new ValidationError(validation.errors);
}
```

### 5. Rate Limiting

Choose appropriate rate limit tier:

- `strict`: 10 req/min (health checks, admin)
- `moderate`: 30 req/min (standard operations)
- `lenient`: 60 req/min (read operations)

## Debugging

### Request Tracing

All requests include `X-Request-ID` header. Use this to trace requests through logs.

### Health Checks

Check system status:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/health/detailed
```

### Log Levels

Set log level via environment:

```bash
LOG_LEVEL=debug  # debug, info, warn, error
```

## Security Considerations

1. **PII Redaction**: All errors are automatically redacted for PII
2. **Rate Limiting**: Prevents abuse and DoS attacks
3. **Request Size Limits**: Prevents large payload attacks
4. **Input Validation**: Sanitizes all inputs
5. **CORS**: Configured for allowed origins

## Future Improvements

- [ ] Add API versioning
- [ ] Implement OpenAPI/Swagger documentation
- [ ] Add request/response logging middleware
- [ ] Implement API key authentication
- [ ] Add request metrics and analytics
- [ ] Implement webhook support
- [ ] Add API rate limit dashboard

## Related Documentation

- [API Reference](./api.md)
- [Error Codes](./error-codes.md)
- [Architecture](./architecture.md)
- [Integration Hardening](./integration-hardening.md)

## Changelog

### Version 0.1.1

- Fixed missing eslint-plugin-react-hooks dependency
- Fixed setState in effect issue in clarify page
- Fixed unused options parameter in ExportManager
- Updated API documentation
- Improved error handling consistency

---

**Last Updated:** 2026-02-07  
**Maintainer:** API Specialist Agent  
**Status:** Active Development
