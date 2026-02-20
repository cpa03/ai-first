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
- `X-RateLimit-Limit`: Total requests allowed per rate limit window
- `X-RateLimit-Remaining`: Number of requests remaining in current window
- `X-RateLimit-Reset`: ISO 8601 timestamp when rate limit window resets
- `X-Error-Code`: Error code if the request failed
- `X-Retryable`: Whether the error is retryable (`true`/`false`)

**Example Headers:**

```http
X-Request-ID: req_1234567890_abc123
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 47
X-RateLimit-Reset: 2024-01-07T12:05:00Z
```

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

### Quick Reference: Error Handling by Scenario

| Scenario                 | Error Code               | Action               | Example                                         |
| ------------------------ | ------------------------ | -------------------- | ----------------------------------------------- |
| **Invalid request body** | `VALIDATION_ERROR`       | Fix request fields   | Check `details` array for field-specific errors |
| **Rate limit hit**       | `RATE_LIMIT_EXCEEDED`    | Wait and retry       | Use `Retry-After` header value                  |
| **AI service down**      | `CIRCUIT_BREAKER_OPEN`   | Wait for reset       | Check `nextAttemptTime` in response             |
| **Database timeout**     | `TIMEOUT_ERROR`          | Retry with backoff   | Use exponential backoff (1s, 2s, 4s)            |
| **Auth token expired**   | `AUTHENTICATION_ERROR`   | Re-authenticate      | Refresh token or re-login                       |
| **Resource not found**   | `NOT_FOUND`              | Check resource ID    | Verify ID exists and you have access            |
| **External API error**   | `EXTERNAL_SERVICE_ERROR` | Check service status | Monitor `/api/health/detailed`                  |

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

**Options Field Descriptions:**

All fields in the `options` object are optional:

- `complexity` (string): Complexity level for the breakdown. Options: `'simple'`, `'medium'`, `'complex'`. Default: AI-determined based on idea complexity
- `teamSize` (number): Number of team members available for the project. Used to parallelize tasks appropriately
- `timelineWeeks` (number): Desired timeline in weeks. Helps the AI create realistic schedules
- `constraints` (string[]): Array of project constraints or requirements. Examples: `["Must use TypeScript", "Mobile-first design", "GDPR compliant"]`

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

All API endpoints are rate-limited to prevent abuse. Rate limit headers are included in **all responses** (both successful and errors):

**Rate Limit Tiers:**

The API supports two types of rate limiting:

### Endpoint-based Rate Limiting

Each endpoint can be configured with specific rate limits:

- `strict`: 10 requests per minute
- `moderate`: 30 requests per minute
- `lenient`: 60 requests per minute

### User Role-based Rate Limiting (Future)

The system supports tiered rate limiting based on user roles (when authentication is implemented):

- `anonymous`: 30 requests per minute
- `authenticated`: 60 requests per minute
- `premium`: 120 requests per minute
- `enterprise`: 300 requests per minute

**Headers on All Responses:**

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 57
X-RateLimit-Reset: 2024-01-07T12:05:00Z
```

- `X-RateLimit-Limit`: Your rate limit for this endpoint
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: ISO 8601 timestamp when rate limit window resets

When rate limit is exceeded:

```json
{
  "error": "Too many requests",
  "code": "RATE_LIMIT_EXCEEDED",
  "timestamp": "2024-01-07T12:00:00Z",
  "requestId": "req_1234567890_abc123",
  "retryable": true
}
```

**Additional Headers on Rate Limit Errors:**

- `Retry-After`: Seconds until retry is allowed

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

## Ideas API

The Ideas API provides CRUD operations for managing user ideas.

### GET /api/ideas

Retrieve all ideas for the authenticated user with pagination and filtering.

**Query Parameters:**

- `status` (optional): Filter by status (`draft`, `clarified`, `breakdown`, `completed`, `all`)
- `limit` (optional): Number of results per page (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Request:**

```http
GET /api/ideas?status=draft&limit=10&offset=0
Authorization: Bearer <your-supabase-token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "ideas": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Build a fitness tracking app",
        "status": "draft",
        "createdAt": "2024-01-07T12:00:00Z",
        "updatedAt": "2024-01-07T12:00:00Z"
      }
    ],
    "pagination": {
      "total": 15,
      "limit": 10,
      "offset": 0,
      "hasMore": true
    }
  },
  "requestId": "req_1234567890_abc123"
}
```

**Status Codes:**

- `200`: Ideas retrieved successfully
- `401`: Authentication required
- `429`: Rate limit exceeded

**Rate Limit:** `lenient` (60 requests/minute)

---

### POST /api/ideas

Create a new idea.

**Request Body:**

```json
{
  "idea": "I want to build a mobile app for tracking fitness goals with social features"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "I want to build a mobile app for tracking fitness goals...",
    "status": "draft",
    "createdAt": "2024-01-07T12:00:00Z"
  },
  "requestId": "req_1234567890_abc123"
}
```

**Status Codes:**

- `201`: Idea created successfully
- `400`: Validation error
- `401`: Authentication required
- `429`: Rate limit exceeded

**Rate Limit:** `moderate` (30 requests/minute)

---

### GET /api/ideas/[id]

Retrieve a specific idea by ID.

**Request:**

```http
GET /api/ideas/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <your-supabase-token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "user_123",
    "title": "Build a fitness tracking app",
    "raw_text": "I want to build a mobile app for tracking fitness goals...",
    "status": "draft",
    "created_at": "2024-01-07T12:00:00Z",
    "updated_at": "2024-01-07T12:00:00Z"
  },
  "requestId": "req_1234567890_abc123"
}
```

**Status Codes:**

- `200`: Idea retrieved successfully
- `401`: Authentication required
- `403`: Not authorized to access this idea
- `404`: Idea not found
- `429`: Rate limit exceeded

**Rate Limit:** `moderate` (30 requests/minute)

---

### PUT /api/ideas/[id]

Update an existing idea.

**Request Body:**

```json
{
  "title": "Updated Fitness App Idea",
  "status": "clarified"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Updated Fitness App Idea",
    "status": "clarified",
    "createdAt": "2024-01-07T12:00:00Z",
    "updatedAt": "2024-01-07T14:00:00Z"
  },
  "requestId": "req_1234567890_abc123"
}
```

**Status Codes:**

- `200`: Idea updated successfully
- `400`: Validation error
- `401`: Authentication required
- `403`: Not authorized to modify this idea
- `404`: Idea not found
- `429`: Rate limit exceeded

**Rate Limit:** `moderate` (30 requests/minute)

---

### DELETE /api/ideas/[id]

Soft delete an idea (marks as deleted, doesn't remove from database).

**Request:**

```http
DELETE /api/ideas/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <your-supabase-token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Idea deleted successfully",
    "id": "550e8400-e29b-41d4-a716-446655440000"
  },
  "requestId": "req_1234567890_abc123"
}
```

**Status Codes:**

- `200`: Idea deleted successfully
- `401`: Authentication required
- `403`: Not authorized to delete this idea
- `404`: Idea not found
- `429`: Rate limit exceeded

**Rate Limit:** `moderate` (30 requests/minute)

---

## Tasks API

The Tasks API provides operations for managing tasks within deliverables.

### GET /api/tasks/[id]

Retrieve a specific task by ID.

**Request:**

```http
GET /api/tasks/task_123
Authorization: Bearer <your-supabase-token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "task": {
      "id": "task_123",
      "deliverable_id": "del_1",
      "title": "Design UI/UX",
      "description": "Create wireframes and prototypes",
      "status": "todo",
      "assignee": null,
      "estimate": 40,
      "start_date": null,
      "end_date": null,
      "actual_hours": null,
      "completion_percentage": 0,
      "priority_score": 5,
      "complexity_score": 3,
      "risk_level": "low",
      "tags": ["design", "ui"],
      "created_at": "2024-01-07T12:00:00Z"
    }
  },
  "requestId": "req_1234567890_abc123"
}
```

**Status Codes:**

- `200`: Task retrieved successfully
- `401`: Authentication required
- `403`: Not authorized to access this task
- `404`: Task not found
- `429`: Rate limit exceeded

**Rate Limit:** `lenient` (60 requests/minute)

---

### PUT /api/tasks/[id]

Update an existing task.

**Request Body:**

```json
{
  "title": "Updated Task Title",
  "status": "in_progress",
  "completion_percentage": 50,
  "assignee": "John Doe",
  "estimate": 60,
  "risk_level": "medium",
  "tags": ["design", "ui", "priority"]
}
```

**Field Descriptions:**

- `title` (optional): Task title
- `description` (optional): Task description
- `status` (optional): `todo`, `in_progress`, or `completed`
- `assignee` (optional): Person assigned to the task
- `estimate` (optional): Estimated hours (positive number)
- `start_date` (optional): Start date (ISO 8601)
- `end_date` (optional): End date (ISO 8601)
- `actual_hours` (optional): Actual hours spent
- `completion_percentage` (optional): 0-100
- `priority_score` (optional): Priority score
- `complexity_score` (optional): Complexity score
- `risk_level` (optional): `low`, `medium`, or `high`
- `tags` (optional): Array of tag strings

**Response:**

```json
{
  "success": true,
  "data": {
    "task": {
      "id": "task_123",
      "title": "Updated Task Title",
      "status": "in_progress",
      "completion_percentage": 50
    }
  },
  "requestId": "req_1234567890_abc123"
}
```

**Status Codes:**

- `200`: Task updated successfully
- `400`: Validation error
- `401`: Authentication required
- `403`: Not authorized to modify this task
- `404`: Task not found
- `429`: Rate limit exceeded

**Rate Limit:** `moderate` (30 requests/minute)

---

### DELETE /api/tasks/[id]

Soft delete a task.

**Request:**

```http
DELETE /api/tasks/task_123
Authorization: Bearer <your-supabase-token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Task deleted successfully",
    "taskId": "task_123"
  },
  "requestId": "req_1234567890_abc123"
}
```

**Status Codes:**

- `200`: Task deleted successfully
- `401`: Authentication required
- `403`: Not authorized to delete this task
- `404`: Task not found
- `429`: Rate limit exceeded

**Rate Limit:** `moderate` (30 requests/minute)

---

## Deliverables API

### POST /api/deliverables/[id]/tasks

Create a new task within a deliverable.

**Request Body:**

```json
{
  "title": "Implement authentication",
  "description": "Set up user authentication with Supabase",
  "status": "todo",
  "assignee": "Jane Doe",
  "estimate": 20,
  "risk_level": "medium",
  "tags": ["backend", "security"]
}
```

**Field Descriptions:**

- `title` (required): Task title (max 255 characters)
- `description` (optional): Task description
- `status` (optional): `todo` (default), `in_progress`, or `completed`
- `assignee` (optional): Person assigned
- `estimate` (optional): Estimated hours
- `risk_level` (optional): `low` (default), `medium`, or `high`
- `tags` (optional): Array of tag strings

**Response:**

```json
{
  "success": true,
  "data": {
    "task": {
      "id": "task_456",
      "deliverable_id": "del_1",
      "title": "Implement authentication",
      "status": "todo",
      "estimate": 20
    },
    "message": "Task created successfully"
  },
  "requestId": "req_1234567890_abc123"
}
```

**Status Codes:**

- `201`: Task created successfully
- `400`: Validation error
- `401`: Authentication required
- `403`: Not authorized to access this deliverable
- `404`: Deliverable not found
- `429`: Rate limit exceeded

**Rate Limit:** `moderate` (30 requests/minute)

---

## Metrics API

### GET /api/metrics

Retrieve Prometheus-compatible metrics for monitoring.

**Response:**

Returns metrics in Prometheus text format:

```
# HELP http_request_duration_seconds Duration of HTTP requests in seconds
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{method="GET",route="/api/health",status_code="200",le="0.001"} 15
http_request_duration_seconds_bucket{method="GET",route="/api/health",status_code="200",le="0.005"} 42
...

# HELP http_request_errors_total Total number of HTTP request errors
# TYPE http_request_errors_total counter
http_request_errors_total{method="POST",route="/api/clarify/start",status_code="400"} 3

# HELP circuit_breaker_state Circuit breaker state (0=closed, 1=half-open, 2=open)
# TYPE circuit_breaker_state gauge
circuit_breaker_state{name="openai"} 0
circuit_breaker_state{name="trello"} 1
```

**Available Metrics:**

| Metric                          | Type      | Description               |
| ------------------------------- | --------- | ------------------------- |
| `http_request_duration_seconds` | Histogram | Duration of HTTP requests |
| `http_request_errors_total`     | Counter   | Total HTTP request errors |
| `http_requests_total`           | Counter   | Total HTTP requests       |
| `circuit_breaker_state`         | Gauge     | Circuit breaker state     |
| `rate_limiter_hits_total`       | Counter   | Rate limiter hits         |

**Status Codes:**

- `200`: Metrics returned successfully
- `500`: Failed to generate metrics

**Rate Limit:** `strict` (10 requests/minute)

**Content-Type:** `text/plain; version=0.0.4; charset=utf-8`

---

## Kubernetes Health Endpoints

These endpoints are designed for container orchestration (Kubernetes, Docker) health checks.

### GET /api/health/live

Liveness probe - checks if the application process is running.

**Purpose:** Should the container be restarted?

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-07T12:00:00Z",
  "service": "liveness",
  "environment": "production"
}
```

**Status Codes:**

- `200`: Application is alive

**Rate Limit:** `strict` (10 requests/minute)

**Cache:** Public, 10 seconds TTL

---

### GET /api/health/ready

Readiness probe - checks if all dependencies are ready.

**Purpose:** Should the container receive traffic?

**Response (Ready):**

```json
{
  "status": "ready",
  "timestamp": "2024-01-07T12:00:00Z",
  "service": "readiness",
  "environment": "production",
  "checks": {
    "database": {
      "status": "ready",
      "responseTime": 12
    }
  }
}
```

**Response (Not Ready):**

```json
{
  "success": false,
  "error": "Service not ready",
  "code": "NOT_READY",
  "data": {
    "status": "not_ready",
    "checks": {
      "database": {
        "status": "not_ready",
        "error": "Connection refused"
      }
    }
  }
}
```

**Status Codes:**

- `200`: Service is ready to receive traffic
- `503`: Service is not ready

**Rate Limit:** `strict` (10 requests/minute)

**Cache:** Public, 10 seconds TTL

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
