# API Reference

This document provides comprehensive API documentation for the IdeaFlow application. All endpoints return JSON responses and include request IDs for tracing.

## Base URL

```
http://localhost:3000 (development)
https://your-domain.com (production)
```

## Authentication

Currently, the application uses Supabase Auth for user authentication. Include your authentication token in requests:

```http
Authorization: Bearer <your-supabase-token>
```

## Common Headers

All API responses include these headers:

- `X-Request-ID`: Unique identifier for the request (useful for debugging)
- `X-Error-Code`: Error code if the request failed
- `X-Retryable`: Whether the error is retryable (`true`/`false`)

## Error Response Format

All errors follow a consistent format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": [{ "field": "fieldName", "message": "Validation message" }],
  "timestamp": "2024-01-07T12:00:00Z",
  "requestId": "req_1234567890_abc123",
  "retryable": true
}
```

For detailed error codes, see [Error Code Documentation](./error-codes.md).

## Resilience Patterns

The IdeaFlow API implements several resilience patterns to ensure reliable operation when integrating with external services:

### Circuit Breaker Pattern

Circuit breakers prevent cascading failures by stopping calls to failing services. When a service reaches a failure threshold, the circuit opens and subsequent calls fail fast without waiting for timeouts.

**Circuit Breaker States:**

- `closed`: Normal operation, requests flow through
- `open`: Service is failing, requests fail immediately
- `half-open`: Testing if service has recovered

**Circuit Breaker Behavior:**

1. **Failure Threshold**: After 5 consecutive failures, circuit opens
2. **Reset Timeout**: Circuit stays open for 60 seconds, then enters half-open
3. **Recovery Test**: In half-open, next request tests service health
4. **Close on Success**: Successful request closes circuit

**Monitoring Circuit Breakers:**

Check `/api/health/detailed` to see all circuit breaker states:

```json
{
  "circuitBreakers": [
    {
      "service": "openai",
      "state": "closed",
      "failures": 0
    },
    {
      "service": "trello",
      "state": "open",
      "failures": 6
    }
  ]
}
```

### Retry Logic

External API calls automatically retry with exponential backoff:

**Default Retry Configuration:**

- `maxRetries`: 3 attempts
- `initialDelayMs`: 1000ms
- `maxDelayMs`: 30000ms
- `backoffMultiplier`: 2x (delays: 1s, 2s, 4s)

**Retryable Errors:**

The system automatically retries on these errors:

- Network errors (ECONNRESET, ECONNREFUSED, ETIMEDOUT, ENOTFOUND)
- HTTP 429 (Rate Limit)
- HTTP 502, 503, 504 (Gateway/Service errors)
- QUOTA_EXCEEDED errors

**Non-Retryable Errors:**

These errors fail immediately:

- HTTP 400, 401, 403, 404, 409
- Validation errors
- Authentication errors

### Timeouts

All external API calls have timeout protection:

**Default Timeouts:**

- `OpenAI`: 60 seconds
- `Notion`: 30 seconds
- `Trello`: 30 seconds
- `GitHub`: 30 seconds
- `Database`: 10 seconds

Timeout errors return `TIMEOUT_ERROR` code with retryable=true, allowing automatic retry.

### Error Recovery

When an external service fails:

1. **Automatic Retry**: System retries with exponential backoff
2. **Circuit Breaker**: Repeated failures open circuit, preventing further calls
3. **Degraded Mode**: Export connectors show "degraded" status when some are down
4. **Health Monitoring**: `/api/health/detailed` shows real-time service health
5. **Manual Recovery**: Circuit breakers auto-reset after 60 seconds, or use admin endpoint to reset

### Client-Side Recommendations

**Best Practices:**

1. **Check Health First**: Call `/api/health/detailed` before bulk operations
2. **Handle Retryable Errors**: Implement exponential backoff for `retryable: true` errors
3. **Respect Rate Limits**: Include `Retry-After` header in retry logic
4. **Use Request IDs**: Log `X-Request-ID` for debugging failed requests

**Example Retry Implementation:**

```typescript
async function resilientCall(url: string, data: any) {
  let lastError: Error;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.code === 'CIRCUIT_BREAKER_OPEN') {
          // Wait and retry
          const retryAfter = new Date(result.nextAttemptTime);
          const delayMs = retryAfter.getTime() - Date.now();
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        if (result.retryable) {
          // Exponential backoff
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        throw new Error(result.error);
      }

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      if (attempt === 3) break;

      // Network errors - retry with backoff
      const delay = Math.pow(2, attempt - 1) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
```

---

## Health Endpoints

### GET /api/health

Basic health check endpoint that verifies environment configuration.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-07T12:00:00Z",
  "environment": "development",
  "checks": {
    "NEXT_PUBLIC_SUPABASE_URL": { "present": true, "required": true },
    "OPENAI_API_KEY": { "present": true, "required": false }
  },
  "summary": {
    "requiredVarsSet": 5,
    "totalRequiredVars": 5,
    "hasAIProvider": true,
    "environment": "development"
  }
}
```

**Status Codes:**

- `200`: Environment is healthy
- `500`: Error occurred

---

### GET /api/health/detailed

Comprehensive health check including database, AI services, export connectors, and circuit breaker states.

**Response:**

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
      }
    ]
  }
}
```

**Status Codes:**

- `200`: System is healthy
- `503`: System is unhealthy or degraded

**Circuit Breaker States:**

- `closed`: Normal operation
- `open`: Service is failing, not calling it
- `half-open`: Testing recovery

---

### GET /api/health/database

Check database health specifically.

**Response:**

```json
{
  "status": "healthy",
  "service": "database",
  "timestamp": "2024-01-07T12:00:00Z",
  "environment": "development"
}
```

**Status Codes:**

- `200`: Database is healthy
- `500`: Database error

---

## Clarification API

The Clarification API helps refine raw ideas by asking targeted questions.

### POST /api/clarify/start

Start a new clarification session for an idea.

**Request Body:**

```json
{
  "ideaId": "550e8400-e29b-41d4-a716-446655440000",
  "ideaText": "I want to build a mobile app for tracking fitness goals"
}
```

**Response:**

```json
{
  "success": true,
  "session": {
    "ideaId": "550e8400-e29b-41d4-a716-446655440000",
    "state": "clarifying",
    "questions": [
      {
        "id": "q1",
        "question": "What platform(s) should this app support?",
        "type": "choice",
        "options": ["iOS only", "Android only", "Both"]
      },
      {
        "id": "q2",
        "question": "What's your primary goal with this app?",
        "type": "text"
      }
    ],
    "currentQuestionIndex": 0
  },
  "requestId": "req_1234567890_abc123"
}
```

**Status Codes:**

- `200`: Clarification session started
- `400`: Validation error
- `500`: Internal error

---

### GET /api/clarify/start

Retrieve an existing clarification session.

**Query Parameters:**

- `ideaId` (required): The idea ID

**Request:**

```http
GET /api/clarify/start?ideaId=550e8400-e29b-41d4-a716-446655440000
```

**Response:**

```json
{
  "success": true,
  "session": {
    "ideaId": "550e8400-e29b-41d4-a716-446655440000",
    "state": "clarifying",
    "questions": [...],
    "answers": {
      "q1": "Both iOS and Android"
    },
    "currentQuestionIndex": 1
  },
  "requestId": "req_1234567890_abc123"
}
```

**Status Codes:**

- `200`: Session retrieved
- `404`: Session not found
- `500`: Internal error

---

### POST /api/clarify/answer

Submit an answer to a clarification question.

**Request Body:**

```json
{
  "ideaId": "550e8400-e29b-41d4-a716-446655440000",
  "questionId": "q1",
  "answer": "Both iOS and Android"
}
```

**Response:**

```json
{
  "success": true,
  "session": {
    "ideaId": "550e8400-e29b-41d4-a716-446655440000",
    "state": "clarifying",
    "answers": {
      "q1": "Both iOS and Android"
    },
    "currentQuestionIndex": 1
  }
}
```

**Validation:**

- `answer` must not exceed 5000 characters

**Status Codes:**

- `200`: Answer submitted
- `400`: Validation error
- `500`: Internal error

---

### POST /api/clarify/complete

Complete the clarification process and generate a refined idea.

**Request Body:**

```json
{
  "ideaId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**

```json
{
  "success": true,
  "refinedIdea": "Build a cross-platform mobile fitness tracking app that supports both iOS and Android, with features for setting goals, tracking workouts, and monitoring progress over time.",
  "confidenceScore": 0.92,
  "clarifiedAt": "2024-01-07T12:00:00Z"
}
```

**Status Codes:**

- `200`: Clarification completed
- `400`: Validation error
- `500`: Internal error

---

## Breakdown API

The Breakdown API converts clarified ideas into actionable project plans with deliverables, tasks, and timelines.

### POST /api/breakdown

Start a new breakdown process for a clarified idea.

**Request Body:**

```json
{
  "ideaId": "550e8400-e29b-41d4-a716-446655440000",
  "refinedIdea": "Build a cross-platform mobile fitness tracking app...",
  "userResponses": {
    "targetAudience": "Fitness enthusiasts aged 18-45",
    "timeline": "3 months",
    "budget": "$50,000",
    "teamSize": "4"
  },
  "options": {
    "complexity": "medium",
    "includeTimeline": true,
    "includeDependencies": true
  }
}
```

**Response:**

```json
{
  "success": true,
  "session": {
    "id": "bd_1234567890_abc123",
    "ideaId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "analyzing",
    "deliverables": [
      {
        "id": "del_1",
        "title": "Core App Development",
        "description": "Develop main mobile application features",
        "priority": "high",
        "estimateHours": 240,
        "tasks": [
          {
            "id": "task_1",
            "title": "Design UI/UX",
            "description": "Create wireframes and prototypes",
            "estimate": 40,
            "status": "todo",
            "dependencies": []
          }
        ]
      }
    ],
    "timeline": {
      "startDate": "2024-01-15",
      "endDate": "2024-04-15",
      "phases": [
        {
          "name": "Phase 1: Foundation",
          "startDate": "2024-01-15",
          "endDate": "2024-02-15",
          "deliverables": ["del_1"]
        }
      ],
      "criticalPath": ["task_1", "task_2", "task_5"]
    },
    "confidenceScore": 0.85,
    "estimatedTotalHours": 320,
    "aiModel": "gpt-4",
    "createdAt": "2024-01-07T12:00:00Z"
  },
  "requestId": "req_1234567890_abc123"
}
```

**Status Codes:**

- `200`: Breakdown started/completed
- `400`: Validation error
- `429`: Rate limit exceeded
- `500`: Internal error

---

### GET /api/breakdown

Retrieve an existing breakdown session.

**Query Parameters:**

- `ideaId` (required): The idea ID

**Request:**

```http
GET /api/breakdown?ideaId=550e8400-e29b-41d4-a716-446655440000
```

**Response:**

```json
{
  "success": true,
  "session": {
    "id": "bd_1234567890_abc123",
    "ideaId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "deliverables": [...],
    "timeline": {...},
    "confidenceScore": 0.85,
    "estimatedTotalHours": 320
  },
  "requestId": "req_1234567890_abc123"
}
```

**Status Codes:**

- `200`: Session retrieved
- `404`: Session not found
- `429`: Rate limit exceeded
- `500`: Internal error

---

## Rate Limiting

All API endpoints are rate-limited to prevent abuse. Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704614400
```

**Rate Limit Tiers:**

- `strict`: 10 requests per minute
- `moderate`: 50 requests per minute
- `lenient`: 100 requests per minute

When rate limit is exceeded:

```json
{
  "error": "Rate limit exceeded. Retry after 60 seconds",
  "code": "RATE_LIMIT_EXCEEDED",
  "timestamp": "2024-01-07T12:00:00Z",
  "requestId": "req_1234567890_abc123",
  "retryable": true
}
```

**HTTP Headers:**

- `Retry-After`: Seconds until retry is allowed
- `X-RateLimit-Limit`: Your rate limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## Request Size Limits

- Maximum request body size: 1MB
- Maximum idea text length: 10,000 characters
- Maximum answer length: 5,000 characters

---

## CORS

The API supports CORS for cross-origin requests. Configure allowed origins in your environment:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Testing APIs

### Using cURL

```bash
# Start clarification
curl -X POST http://localhost:3000/api/clarify/start \
  -H "Content-Type: application/json" \
  -d '{
    "ideaId": "550e8400-e29b-41d4-a716-446655440000",
    "ideaText": "Build a fitness tracking app"
  }'

# Check health
curl http://localhost:3000/api/health/detailed
```

### Using JavaScript/Fetch

```javascript
// Start breakdown
const response = await fetch('/api/breakdown', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    ideaId: '550e8400-e29b-41d4-a716-446655440000',
    refinedIdea: 'Build a fitness tracking app...',
    userResponses: {
      timeline: '3 months',
      budget: '$50,000',
    },
  }),
});

const data = await response.json();
console.log(data);
```

---

## WebSocket Support (Future)

WebSocket support will be added for real-time updates on long-running operations like breakdown processing.

---

## Changelog

### Version 0.1.0 (Current)

- Initial API release
- Clarification flow endpoints
- Breakdown engine endpoints
- Health monitoring endpoints
- Rate limiting implementation
- Error standardization

---

## Support

For issues or questions:

- Check the [error codes documentation](./error-codes.md)
- Review request IDs in error responses
- Check `/api/health/detailed` for system status
- Create an issue in the repository with the request ID
