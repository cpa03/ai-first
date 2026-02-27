# ADR-006: Standardized Error Response Format

## Status

Accepted

## Context

API endpoints were returning inconsistent error formats:

- Some returned strings, others objects
- Error codes varied between endpoints
- No standard way to identify retryable errors
- Client code had to handle many different error shapes

This inconsistency made error handling tedious and error-prone throughout the codebase.

## Decision

Implement a standardized error response format across all API endpoints.

### Error Response Schema

```typescript
// Location: src/lib/errors.ts

interface ErrorResponse {
  error: string; // Human-readable error summary
  code: string; // Machine-readable error code
  fingerprint?: string; // Unique error identifier for tracing
  details?: ErrorDetail[]; // Field-specific validation errors
  timestamp: string; // ISO 8601 timestamp
  requestId?: string; // Request tracking identifier
  retryable?: boolean; // Whether the operation can be retried
  suggestions?: string[]; // User-friendly remediation steps
}

interface ErrorDetail {
  field?: string; // The field that caused the error
  message: string; // Human-readable detail
  code?: string; // Field-specific error code
}
```

### Error Codes Enum

| Code                     | HTTP Status | Description                          |
| ------------------------ | ----------- | ------------------------------------ |
| `VALIDATION_ERROR`       | 400         | Request body validation failed       |
| `RATE_LIMIT_EXCEEDED`    | 429         | Too many requests                    |
| `INTERNAL_ERROR`         | 500         | Unexpected server error              |
| `EXTERNAL_SERVICE_ERROR` | 502         | Third-party service failed           |
| `TIMEOUT_ERROR`          | 504         | Operation timed out                  |
| `AUTHENTICATION_ERROR`   | 401         | Invalid or missing credentials       |
| `AUTHORIZATION_ERROR`    | 403         | Insufficient permissions             |
| `NOT_FOUND`              | 404         | Resource not found                   |
| `CONFLICT`               | 409         | Resource conflict                    |
| `SERVICE_UNAVAILABLE`    | 503         | Service temporarily unavailable      |
| `CIRCUIT_BREAKER_OPEN`   | 503         | External service temporarily blocked |
| `RETRY_EXHAUSTED`        | 503         | All retry attempts exhausted         |

### Usage Example

```typescript
// In API route handler:
import { AppError, ErrorCode, createErrorResponse } from '@/lib/errors';

try {
  const result = await processRequest(data);
  return Response.json(result);
} catch (error) {
  if (error instanceof AppError) {
    return Response.json(createErrorResponse(error), {
      status: error.statusCode,
    });
  }
  // Handle unexpected errors
  return Response.json(
    createErrorResponse(
      new AppError('An unexpected error occurred', ErrorCode.INTERNAL_ERROR)
    ),
    { status: 500 }
  );
}
```

## Consequences

### Positive

- **Consistency**: All errors follow same structure
- **Debuggable**: requestId and fingerprint for tracing
- **Actionable**: suggestions help users fix issues
- **Retryable flag**: Clients know when to retry
- **Typed**: Full TypeScript support

### Negative

- **Migration effort**: Existing errors needed updating
- **Breaking changes**: Clients may depend on old format
- **Verbose**: More fields than sometimes needed

## Alternatives Considered

- **Use HTTP status only**: Too coarse-grained
- **Problem Details (RFC 7807)**: Similar but more complex
- **Provider-specific formats**: Would lose consistency

## References

- [Error Codes Reference](./error-codes.md)
- [Error Implementation](./src/lib/errors.ts)
- [API Error Handling](./api.md#error-responses)
