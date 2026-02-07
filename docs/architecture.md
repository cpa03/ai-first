# Architecture

## Project Structure

The project follows a Next.js 14+ app router structure with Supabase integration and AI abstraction layer.

```
src/
├── app/                 # Next.js app router pages
│   ├── clarify/         # Clarification flow pages
│   ├── results/         # Results display pages
│   ├── api/             # API routes
│   │   ├── health/      # Health check endpoints
│   │   ├── clarify/     # Clarification API
│   │   └── breakdown/   # Breakdown API
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # React components
├── lib/                 # Utility functions
│   ├── ai.ts           # AI service abstraction
│   ├── db.ts           # Database service
│   ├── exports.ts      # Export connectors
│   ├── resilience.ts   # Resilience framework
│   ├── errors.ts      # Error handling
│   ├── validation.ts  # Input validation
│   ├── rate-limit.ts  # Rate limiting
│   ├── pii-redaction.ts # PII protection
│   ├── api-handler.ts  # API request handler
│   ├── api-client.ts   # API client utilities
│   ├── cache.ts        # Caching layer
│   ├── config/         # Configuration
│   │   └── constants.ts # Constants and config
│   ├── prompts/        # AI prompt templates
│   │   ├── clarifier/  # Clarification agent prompts
│   │   └── breakdown/  # Breakdown agent prompts
│   └── agents/         # AI agent implementations
│       ├── clarifier.ts  # Clarification agent
│       └── breakdown-engine.ts # Breakdown engine
└── styles/              # Global styles
supabase/
├── schema.sql           # Database schema
├── migrations/          # Database migration files
└── seeds/               # Seed data
ai/
├── agent-configs/       # Agent configuration files
│   ├── clarifier.yml
│   └── breakdown-engine.yml
docs/                    # Documentation
config/                  # Configuration files
tests/                   # Test files
```

## Database Schema

- users (via Supabase Auth)
- ideas (id, user_id, title, raw_text, created_at, status)
- idea_sessions (idea_id, state, last_agent, metadata JSON)
- deliverables (idea_id, title, description, priority, estimate_hours)
- tasks (deliverable_id, title, description, assignee, status, estimate)
- vectors (embedding vectors/references)
- agent_logs (agent, action, payload, timestamp)

## AI Abstraction Layer

- Abstract model calls from OpenAI/Anthropic
- Implement context windowing strategy
- Add cost guardrails and rate limiting
- Support programmatic integrations
- Wraps all calls in resilience framework

## Resilience Framework

The application implements a comprehensive resilience framework to ensure robust external service integration:

### Core Components

1. **Circuit Breaker**
   - Prevents cascading failures from degraded services
   - Three states: closed (normal), open (failing), half-open (testing)
   - Configurable failure thresholds and reset timeouts
   - Automatic state transitions based on success/failure

2. **Retry Manager**
   - Automatic retry with exponential backoff
   - Configurable max retries (default: 3)
   - Jitter to prevent thundering herd
   - Smart detection of retryable errors (timeouts, rate limits, 5xx)

3. **Timeout Manager**
   - Enforces timeout on any async operation
   - Clean abort with proper resource cleanup
   - Configurable per-service:
     - OpenAI: 60s
     - Notion: 30s
     - Trello: 15s
     - GitHub: 30s
     - Supabase: 10s

### Service Configuration

```typescript
const defaultResilienceConfigs = {
  openai: { maxRetries: 3, timeoutMs: 60000, failThreshold: 5, resetMs: 60000 },
  notion: { maxRetries: 3, timeoutMs: 30000, failThreshold: 5, resetMs: 30000 },
  trello: { maxRetries: 3, timeoutMs: 15000, failThreshold: 3, resetMs: 20000 },
  github: { maxRetries: 3, timeoutMs: 30000, failThreshold: 5, resetMs: 30000 },
  supabase: {
    maxRetries: 2,
    timeoutMs: 10000,
    failThreshold: 10,
    resetMs: 60000,
  },
};
```

### Usage Pattern

```typescript
import { resilienceManager } from '@/lib/resilience';

const result = await resilienceManager.execute(
  async () => {
    return await externalAPICall();
  },
  defaultResilienceConfigs.openai,
  'openai-chat-completion'
);
```

## Error Handling System

Standardized error handling across the entire application:

### Error Classes

- **ValidationError**: Invalid request input (400)
- **RateLimitError**: Rate limit exceeded (429)
- **ExternalServiceError**: External API failures (502)
- **TimeoutError**: Operation timed out (504)
- **CircuitBreakerError**: Service circuit open (503)
- **RetryExhaustedError**: All retries failed (502)

### Error Response Format

All errors return consistent JSON:

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

### Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Unexpected server error
- `EXTERNAL_SERVICE_ERROR`: External API failure
- `TIMEOUT_ERROR`: Operation timed out
- `AUTHENTICATION_ERROR`: Auth required
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource conflict
- `SERVICE_UNAVAILABLE`: Service unavailable
- `CIRCUIT_BREAKER_OPEN`: Circuit breaker tripped
- `RETRY_EXHAUSTED`: All retry attempts failed

### Request Tracing

Every request gets a unique ID included in all responses and logs:

```typescript
const requestId = generateRequestId(); // req_1234567890_abc123
```

Headers: `X-Request-ID`, `X-Error-Code`, `X-Retryable`

## Health Monitoring

Comprehensive health monitoring system for visibility into system status:

### Health Endpoints

1. **GET /api/health**
   - Basic environment check
   - Validates required variables
   - Checks AI provider availability

2. **GET /api/health/detailed**
   - Database health and latency
   - AI service availability
   - Export connector status
   - Circuit breaker states
   - Overall system status (healthy/degraded/unhealthy)

3. **GET /api/health/database**
   - Database-specific health check
   - Connection testing

### Monitoring Metrics

- Service availability (up/down/degraded)
- Latency measurements (ms)
- Circuit breaker states
- Failed requests count
- Uptime tracking

### Recommended Monitoring

- Poll `/api/health/detailed` every 30s
- Alert on status = 'unhealthy'
- Track circuit breaker open events
- Monitor retry success rates

## Rate Limiting

Protects the system from abuse and ensures fair usage:

### Rate Limit Tiers

- **strict**: 10 requests/minute
- **moderate**: 30 requests/minute
- **lenient**: 60 requests/minute

### Implementation

```typescript
import { checkRateLimit, rateLimitConfigs } from '@/lib/rate-limit';

const result = checkRateLimit(clientIp, rateLimitConfigs.moderate);

if (!result.allowed) {
  return rateLimitResponse(result.resetTime);
}
```

### Response Headers

- `X-RateLimit-Limit`: Your limit
- `X-RateLimit-Remaining`: Requests left
- `X-RateLimit-Reset`: Unix timestamp reset
- `Retry-After`: Seconds until retry (on error)

### Rate Limit Error

```json
{
  "error": "Rate limit exceeded. Retry after 60 seconds",
  "code": "RATE_LIMIT_EXCEEDED",
  "timestamp": "2024-01-07T12:00:00Z",
  "requestId": "req_1234567890_abc123",
  "retryable": true
}
```

## Input Validation

Strict validation on all API inputs:

### Validation Rules

- Request body size: max 1MB
- Idea text: max 10,000 characters
- Answer text: max 5,000 characters
- UUID validation for IDs
- Required field checking

### Validation Functions

```typescript
import {
  validateIdea,
  validateIdeaId,
  validateUserResponses,
  validateRequestSize,
} from '@/lib/validation';

const result = validateIdea(ideaText);
if (!result.valid) {
  throw new ValidationError(result.errors);
}
```

### Validation Errors

```json
{
  "error": "Request validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "ideaText",
      "message": "ideaText must be between 10 and 10000 characters"
    }
  ],
  "timestamp": "2024-01-07T12:00:00Z",
  "requestId": "req_1234567890_abc123",
  "retryable": false
}
```

## PII Protection

Protects user privacy by redacting sensitive information:

### Redaction Strategy

- Email addresses
- Phone numbers
- Credit card numbers
- Social security numbers
- Custom patterns

### Usage

```typescript
import { redactPII } from '@/lib/pii-redaction';

const safeText = redactPII(userInput);
// "Contact john@example.com for help"
// → "Contact █████████████ for help"
```

### Audit Logging

All logs use redacted versions of user input, never raw data.

## Export Connectors

- Placeholder for Notion/Trello integrations
- Define JSON schema for programmatic integrations
- Timeout protection on all external calls
- Circuit breaker protection
- Retry logic for transient failures

## Security Features

- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (production)
- Permissions-Policy
- Request validation
- PII redaction
- Audit logging

See [Security Headers Guide](./security-headers.md) for details.
