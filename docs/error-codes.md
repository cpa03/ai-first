# Error Code Reference

This document provides a comprehensive reference for all error codes used in the IdeaFlow API. Understanding these codes helps with debugging and error handling.

## Error Response Format

All errors follow this structure:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": [{ "field": "fieldName", "message": "Specific validation error" }],
  "timestamp": "2024-01-07T12:00:00Z",
  "requestId": "req_1234567890_abc123",
  "retryable": true,
  "suggestions": [
    "Actionable recovery suggestion 1",
    "Actionable recovery suggestion 2"
  ]
}
```

### Error Response Fields

- `error` (string): Human-readable error message describing what went wrong
- `code` (string): Error code for programmatic handling
- `details` (array, optional): Array of specific validation errors with field and message
- `timestamp` (string): ISO 8601 timestamp of when the error occurred
- `requestId` (string, optional): Unique request identifier for tracing and debugging
- `retryable` (boolean): Whether the error can be safely retried
- `suggestions` (array, optional): Array of actionable suggestions for recovering from the error

## Response Headers

Error responses include these headers:

- `X-Request-ID`: Unique request identifier (for tracing)
- `X-Error-Code`: The error code
- `X-Retryable`: Whether error is retryable (`true`/`false`)
- `Retry-After`: Seconds until retry (for rate limit errors)
- `X-RateLimit-Limit`: Your rate limit
- `X-RateLimit-Remaining`: Requests remaining

---

## Error Codes

### VALIDATION_ERROR

**Status Code:** 400
**Retryable:** No

Request validation failed. The request body or query parameters don't meet requirements.

**Common Causes:**

- Missing required fields
- Invalid field types
- Field values out of range
- Invalid UUID format
- Request body too large

**Example Response:**

```json
{
  "error": "Request validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "ideaId",
      "message": "ideaId must be a valid UUID"
    },
    {
      "field": "ideaText",
      "message": "ideaText must be between 10 and 10000 characters"
    }
  ],
  "timestamp": "2024-01-07T12:00:00Z",
  "requestId": "req_1234567890_abc123",
  "retryable": false,
  "suggestions": [
    "Check that all required fields are present in your request",
    "Ensure field values match the expected format",
    "Verify that string lengths are within the allowed limits",
    "Check that UUIDs are properly formatted"
  ]
}
```

**Resolution:** Fix the validation errors in your request and retry. See the `suggestions` field for specific guidance.

---

### RATE_LIMIT_EXCEEDED

**Status Code:** 429
**Retryable:** Yes

Request rate limit exceeded. Too many requests in a short period.

**Common Causes:**

- Exceeded requests per minute limit
- Exceeded daily quota
- Automated scripts hitting API too hard

**Example Response:**

```json
{
  "error": "Rate limit exceeded. Retry after 60 seconds",
  "code": "RATE_LIMIT_EXCEEDED",
  "details": [{ "message": "Limit: 50, Remaining: 0" }],
  "timestamp": "2024-01-07T12:00:00Z",
  "requestId": "req_1234567890_abc123",
  "retryable": true,
  "suggestions": [
    "Wait 60 seconds before making another request",
    "Implement client-side rate limiting to avoid this error",
    "Reduce your request frequency",
    "Contact support for higher rate limits if needed"
  ]
}
```

**HTTP Headers:**

```
Retry-After: 60
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1704614400
```

**Resolution:** Wait for the specified number of seconds, then retry. Implement exponential backoff in your client.

---

### INTERNAL_ERROR

**Status Code:** 500
**Retryable:** No

Unexpected internal server error. Something went wrong on the server.

**Common Causes:**

- Unhandled exceptions
- Database connection issues
- Configuration errors
- Unexpected runtime errors

**Example Response:**

```json
{
  "error": "An unexpected error occurred",
  "code": "INTERNAL_ERROR",
  "timestamp": "2024-01-07T12:00:00Z",
  "requestId": "req_1234567890_abc123",
  "retryable": false,
  "suggestions": [
    "An unexpected error occurred on the server",
    "Check /api/health/detailed for system status",
    "Contact support with requestId for assistance"
  ]
}
```

**Common Causes:**

- Unhandled exceptions
- Database connection issues
- Configuration errors
- Unexpected runtime errors

**Example Response:**

```json
{
  "error": "An unexpected error occurred",
  "code": "INTERNAL_ERROR",
  "timestamp": "2024-01-07T12:00:00Z",
  "requestId": "req_1234567890_abc123",
  "retryable": false
}
```

**Resolution:** Contact support with the request ID. Check the `/api/health/detailed` endpoint for system status.

---

### EXTERNAL_SERVICE_ERROR

**Status Code:** 502
**Retryable:** Yes

External service (OpenAI, Notion, etc.) returned an error.

**Common Causes:**

- OpenAI API quota exceeded
- Notion API rate limit
- External service downtime
- Invalid API credentials

**Example Response:**

```json
{
  "error": "External service error: openai - Quota exceeded",
  "code": "EXTERNAL_SERVICE_ERROR",
  "timestamp": "2024-01-07T12:00:00Z",
  "requestId": "req_1234567890_abc123",
  "retryable": true,
  "suggestions": [
    "An external service (AI provider, database, etc.) returned an error",
    "The system will automatically retry this operation",
    "Check your API credentials for external services",
    "Monitor /api/health/detailed for service status"
  ]
}
```

**Resolution:** Check external service status. Verify API credentials. The system will automatically retry with exponential backoff.

---

### TIMEOUT_ERROR

**Status Code:** 504
**Retryable:** Yes

Operation exceeded time limit and was aborted.

**Common Causes:**

- Slow external service response
- Large AI model processing
- Network latency
- Database query timeout

**Example Response:**

```json
{
  "error": "Request timed out after 60000ms",
  "code": "TIMEOUT_ERROR",
  "timestamp": "2024-01-07T12:00:00Z",
  "requestId": "req_1234567890_abc123",
  "retryable": true,
  "suggestions": [
    "The operation exceeded the time limit and was terminated",
    "Try again with a simpler or smaller request",
    "The system will automatically retry this operation",
    "Check if external services are experiencing high latency"
  ]
}
```

**Resolution:** The system will automatically retry. If persistent, check `/api/health/detailed` for service health.

---

### AUTHENTICATION_ERROR

**Status Code:** 401
**Retryable:** No

Authentication failed or missing.

**Common Causes:**

- Missing authorization header
- Invalid auth token
- Expired auth token
- Invalid API key

**Example Response:**

```json
{
  "error": "Authentication required",
  "code": "AUTHENTICATION_ERROR",
  "timestamp": "2024-01-07T12:00:00Z",
  "requestId": "req_1234567890_abc123",
  "retryable": false,
  "suggestions": [
    "Authentication is required to access this resource",
    "Provide a valid authorization token in Authorization header",
    "Check that your token has not expired",
    "Verify you have valid API credentials"
  ]
}
```

**Common Causes:**

- Missing authorization header
- Invalid auth token
- Expired auth token
- Invalid API key

**Example Response:**

```json
{
  "error": "Authentication required",
  "code": "AUTHENTICATION_ERROR",
  "timestamp": "2024-01-07T12:00:00Z",
  "requestId": "req_1234567890_abc123",
  "retryable": false
}
```

**Resolution:** Provide valid authentication credentials in the `Authorization` header.

---

### AUTHORIZATION_ERROR

**Status Code:** 403
**Retryable:** No

Insufficient permissions to access resource.

**Common Causes:**

- User doesn't have access to idea
- Insufficient role/permissions
- Attempting to access another user's data

**Example Response:**

```json
{
  "error": "You don't have permission to access this resource",
  "code": "AUTHORIZATION_ERROR",
  "timestamp": "2024-01-07T12:00:00Z",
  "requestId": "req_1234567890_abc123",
  "retryable": false,
  "suggestions": [
    "You do not have permission to access this resource",
    "Verify you have appropriate role or permissions",
    "Contact resource owner for access",
    "Check that you are accessing your own data"
  ]
}
```

**Common Causes:**

- User doesn't have access to idea
- Insufficient role/permissions
- Attempting to access another user's data

**Example Response:**

```json
{
  "error": "You don't have permission to access this resource",
  "code": "AUTHORIZATION_ERROR",
  "timestamp": "2024-01-07T12:00:00Z",
  "requestId": "req_1234567890_abc123",
  "retryable": false
}
```

**Resolution:** Verify you have appropriate permissions. Contact owner if you believe this is an error.

---

### NOT_FOUND

**Status Code:** 404
**Retryable:** No

Requested resource not found.

**Common Causes:**

- Invalid idea ID
- Clarification session expired
- Breakdown session doesn't exist
- Invalid route

**Example Response:**

```json
{
  "error": "Clarification session not found",
  "code": "NOT_FOUND",
  "timestamp": "2024-01-07T12:00:00Z",
  "requestId": "req_1234567890_abc123",
  "retryable": false,
  "suggestions": [
    "The requested resource was not found",
    "Verify that the resource ID is correct",
    "Check if session has expired",
    "Ensure you are using the correct endpoint"
  ]
}
```

**Common Causes:**

- Invalid idea ID
- Clarification session expired
- Breakdown session doesn't exist
- Invalid route

**Example Response:**

```json
{
  "error": "Clarification session not found",
  "code": "NOT_FOUND",
  "timestamp": "2024-01-07T12:00:00Z",
  "requestId": "req_1234567890_abc123",
  "retryable": false
}
```

**Resolution:** Verify the resource ID is correct. Check if the session has expired.

---

### CONFLICT

**Status Code:** 409
**Retryable:** No

Resource conflict or duplicate creation attempt.

**Common Causes:**

- Attempting to create duplicate session
- Concurrent modification conflicts
- Unique constraint violation

**Example Response:**

```json
{
  "error": "Clarification session already exists for this idea",
  "code": "CONFLICT",
  "timestamp": "2024-01-07T12:00:00Z",
  "requestId": "req_1234567890_abc123",
  "retryable": false,
  "suggestions": [
    "A conflict occurred with current state of the resource",
    "Check if a session already exists for this idea",
    "Resolve any concurrent modification conflicts",
    "Retry operation with updated data"
  ]
}
```

**Common Causes:**

- Attempting to create duplicate session
- Concurrent modification conflicts
- Unique constraint violation

**Example Response:**

```json
{
  "error": "Clarification session already exists for this idea",
  "code": "CONFLICT",
  "timestamp": "2024-01-07T12:00:00Z",
  "requestId": "req_1234567890_abc123",
  "retryable": false
}
```

**Resolution:** Check if session already exists. Use the existing session or delete and recreate.

---

### SERVICE_UNAVAILABLE

**Status Code:** 503
**Retryable:** Yes

Service temporarily unavailable for maintenance or high load.

**Common Causes:**

- Scheduled maintenance
- High system load
- Database maintenance
- AI service outage

**Example Response:**

```json
{
  "error": "Service temporarily unavailable",
  "code": "SERVICE_UNAVAILABLE",
  "timestamp": "2024-01-07T12:00:00Z",
  "requestId": "req_1234567890_abc123",
  "retryable": true,
  "suggestions": [
    "The service is temporarily unavailable",
    "Wait and retry with exponential backoff",
    "Check /api/health/detailed for system status and ETA",
    "Monitor for service recovery announcements"
  ]
}
```

**Common Causes:**

- Scheduled maintenance
- High system load
- Database maintenance
- AI service outage

**Example Response:**

```json
{
  "error": "Service temporarily unavailable",
  "code": "SERVICE_UNAVAILABLE",
  "timestamp": "2024-01-07T12:00:00Z",
  "requestId": "req_1234567890_abc123",
  "retryable": true
}
```

**Resolution:** Wait and retry with exponential backoff. Check `/api/health/detailed` for status updates.

---

### CIRCUIT_BREAKER_OPEN

**Status Code:** 503
**Retryable:** Yes

Circuit breaker is open due to repeated failures of external service.

**Common Causes:**

- External service degraded
- Too many consecutive failures
- Service outage

**Example Response:**

```json
{
  "error": "Circuit breaker open for openai. Retry after 2024-01-07T12:01:00Z",
  "code": "CIRCUIT_BREAKER_OPEN",
  "timestamp": "2024-01-07T12:00:00Z",
  "requestId": "req_1234567890_abc123",
  "retryable": true,
  "suggestions": [
    "The circuit breaker is open due to repeated failures",
    "Wait until reset time specified in error message",
    "The system will automatically test service recovery",
    "Use /api/health/detailed to monitor circuit breaker status"
  ]
}
```

**Common Causes:**

- External service degraded
- Too many consecutive failures
- Service outage

**Example Response:**

```json
{
  "error": "Circuit breaker open for openai. Retry after 2024-01-07T12:01:00Z",
  "code": "CIRCUIT_BREAKER_OPEN",
  "timestamp": "2024-01-07T12:00:00Z",
  "requestId": "req_1234567890_abc123",
  "retryable": true
}
```

**Resolution:** Wait until the specified retry time. The system will automatically test service recovery.

---

### RETRY_EXHAUSTED

**Status Code:** 502
**Retryable:** No

All retry attempts for an operation failed.

**Common Causes:**

- Persistent service failure
- Network issues
- Invalid request causing consistent failures

**Example Response:**

```json
{
  "error": "Failed after 3 attempts",
  "code": "RETRY_EXHAUSTED",
  "timestamp": "2024-01-07T12:00:00Z",
  "requestId": "req_1234567890_abc123",
  "retryable": false,
  "suggestions": [
    "The operation failed after 3 retry attempts",
    "Check /api/health/detailed for service status",
    "Verify your API credentials and quotas for external services",
    "Contact support with requestId if this persists"
  ]
}
```

**Common Causes:**

- Persistent service failure
- Network issues
- Invalid request causing consistent failures

**Example Response:**

```json
{
  "error": "Failed after 3 attempts",
  "code": "RETRY_EXHAUSTED",
  "timestamp": "2024-01-07T12:00:00Z",
  "requestId": "req_1234567890_abc123",
  "retryable": false
}
```

**Resolution:** Check `/api/health/detailed` for service status. Contact support with request ID if persistent.

---

## Error Handling Best Practices

### Client-Side Error Handling

```typescript
async function makeRequest(url: string, data: any) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      // Display error suggestions to user
      if (result.suggestions && result.suggestions.length > 0) {
        console.log('Suggestions for recovering from error:');
        result.suggestions.forEach((suggestion, index) => {
          console.log(`${index + 1}. ${suggestion}`);
        });
      }

      // Handle error based on code
      if (result.code === 'RATE_LIMIT_EXCEEDED') {
        const retryAfter = response.headers.get('Retry-After');
        console.log(`Retry after ${retryAfter} seconds`);
      } else if (result.code === 'VALIDATION_ERROR') {
        console.log('Validation errors:', result.details);
      } else if (result.retryable) {
        // Implement retry with exponential backoff
        await retryWithBackoff(() => makeRequest(url, data));
      }
      throw new Error(result.error);
    }

    return result;
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}
```

### Retry Strategy

For retryable errors, use exponential backoff:

```typescript
async function retryWithBackoff(fn: () => Promise<any>, maxRetries = 3) {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxRetries) break;

      const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
```

### Request Tracing

Always include the `X-Request-ID` in error reports:

```typescript
catch (error: any) {
  const requestId = error.requestId || 'unknown';
  console.error(`Request ${requestId} failed:`, error);

  // Send to error tracking
  Sentry.captureException(error, {
    extra: { requestId }
  });
}
```

## Common Error Scenarios

### Starting Clarification Fails

**Error:** `VALIDATION_ERROR` on `/api/clarify/start`

**Solutions:**

1. Check ideaId is valid UUID
2. Verify ideaText is 10-10000 characters
3. Ensure request body < 1MB
4. Check all required fields present

### Breakdown Times Out

**Error:** `TIMEOUT_ERROR` on `/api/breakdown`

**Solutions:**

1. Check `/api/health/detailed` for AI service status
2. Try with smaller/less complex idea
3. Reduce complexity in `options` parameter
4. Check AI provider quota

### Rate Limit Exceeded

**Error:** `RATE_LIMIT_EXCEEDED`

**Solutions:**

1. Wait for `Retry-After` seconds
2. Implement client-side rate limiting
3. Reduce request frequency
4. Contact support for higher limits

### Circuit Breaker Open

**Error:** `CIRCUIT_BREAKER_OPEN`

**Solutions:**

1. Wait until reset time in error message
2. Check external service status
3. System will auto-retry when service recovers
4. Monitor `/api/health/detailed` for updates

## Troubleshooting Steps

1. **Check Request ID**: Use the `X-Request-ID` to trace the request in logs
2. **Verify Health**: Check `/api/health/detailed` for system status
3. **Review Error Details**: Look at `details` array for specific validation issues
4. **Check Retryable**: Only retry if `retryable: true`
5. **Implement Backoff**: Always use exponential backoff for retries
6. **Contact Support**: Include request ID when reporting issues

## Support

For persistent errors:

1. Check `/api/health/detailed` endpoint
2. Note the `requestId` from error response
3. Check this documentation for error-specific guidance
4. Create an issue with the request ID and error code
