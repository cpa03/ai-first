# Backend Engineer Guide

## Overview

This document provides comprehensive guidance for backend engineers working on the IdeaFlow application. It covers architecture, coding standards, common patterns, and troubleshooting.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Key Backend Components](#key-backend-components)
4. [Coding Standards](#coding-standards)
5. [API Development](#api-development)
6. [Database Operations](#database-operations)
7. [Error Handling](#error-handling)
8. [Resilience Patterns](#resilience-patterns)
9. [Testing](#testing)
10. [Common Issues & Solutions](#common-issues--solutions)
11. [Build & Deployment](#build--deployment)

---

## Architecture Overview

IdeaFlow is a Next.js 14+ application with a robust backend architecture featuring:

- **API Routes**: Next.js App Router API endpoints
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **AI Integration**: OpenAI/Anthropic via abstraction layer
- **Resilience Framework**: Circuit breakers, retries, timeouts
- **Export Connectors**: Notion, Trello, GitHub Projects, Google Tasks

### Design Principles

1. **Separation of Concerns**: Business logic separated from API handlers
2. **Resilience First**: All external calls wrapped in resilience framework
3. **Type Safety**: Full TypeScript coverage with strict types
4. **Security**: PII redaction, input validation, rate limiting
5. **Observability**: Comprehensive logging and health monitoring

---

## Project Structure

```
src/
├── app/api/              # API route handlers
│   ├── clarify/         # Clarification flow endpoints
│   ├── breakdown/       # Breakdown engine endpoints
│   └── health/          # Health check endpoints
├── lib/                 # Backend utilities
│   ├── agents/          # AI agent implementations
│   ├── config/          # Configuration constants
│   ├── export-connectors/  # Export integrations
│   ├── resilience/      # Resilience framework
│   ├── ai.ts           # AI service abstraction
│   ├── api-handler.ts  # API request wrapper
│   ├── db.ts           # Database service
│   ├── errors.ts       # Error classes
│   ├── rate-limit.ts   # Rate limiting
│   └── validation.ts   # Input validation
└── types/              # TypeScript type definitions
```

---

## Key Backend Components

### 1. Database Service (`src/lib/db.ts`)

The `DatabaseService` class provides CRUD operations for all entities:

```typescript
import { dbService } from '@/lib/db';

// Create an idea
const idea = await dbService.createIdea({
  user_id: 'user-123',
  title: 'My Project',
  raw_text: 'Project description...',
  status: 'draft',
});

// Get ideas for a user
const ideas = await dbService.getUserIdeas('user-123');

// Update with admin privileges
await dbService.updateIdea('idea-123', { status: 'completed' });
```

**Key Patterns:**

- Use `supabaseClient` for user-scoped operations (respects RLS)
- Use `supabaseAdmin` for admin operations (bypasses RLS)
- Soft deletes via `deleted_at` timestamp
- Automatic PII redaction in agent logs

### 2. API Handler Wrapper (`src/lib/api-handler.ts`)

All API routes should use the `withApiHandler` wrapper:

```typescript
import { withApiHandler, standardSuccessResponse } from '@/lib/api-handler';
import { validateIdea } from '@/lib/validation';

export const POST = withApiHandler(
  async ({ request, requestId, rateLimit }) => {
    const body = await request.json();

    // Validate input
    const validation = validateIdea(body.idea);
    if (!validation.valid) {
      throw new ValidationError(validation.errors);
    }

    // Process request
    const result = await processIdea(body.idea);

    return standardSuccessResponse(result, requestId, 200, rateLimit);
  },
  { rateLimit: 'moderate' }
);
```

**Features:**

- Automatic rate limiting
- Request ID generation
- Error handling with standardized responses
- Response header management

### 3. Resilience Framework (`src/lib/resilience/`)

All external service calls must use the resilience framework:

```typescript
import { resilienceManager, defaultResilienceConfigs } from '@/lib/resilience';

const result = await resilienceManager.execute(
  async () => {
    return await openai.chat.completions.create({...});
  },
  defaultResilienceConfigs.openai,
  'openai-chat-completion'
);
```

**Configuration Presets:**

- `openai`: 3 retries, 60s timeout, 5 failure threshold
- `notion`: 3 retries, 30s timeout, 5 failure threshold
- `trello`: 3 retries, 15s timeout, 3 failure threshold
- `github`: 3 retries, 30s timeout, 5 failure threshold
- `supabase`: 2 retries, 10s timeout, 10 failure threshold

### 4. Error Handling (`src/lib/errors.ts`)

Use structured error classes:

```typescript
import {
  ValidationError,
  ExternalServiceError,
  RateLimitError,
  CircuitBreakerError,
} from '@/lib/errors';

// Validation errors (400)
throw new ValidationError([
  { field: 'idea', message: 'Idea text is required' },
]);

// External service errors (502)
throw new ExternalServiceError('API request failed', 'openai', originalError);

// Rate limit errors (429)
throw new RateLimitError(retryAfter, limit, remaining);
```

---

## Coding Standards

### TypeScript

1. **Strict Types**: Enable strict mode in tsconfig.json
2. **No `any`**: Avoid `any` types; use `unknown` with type guards
3. **Explicit Returns**: Always specify function return types
4. **Interfaces Over Types**: Use interfaces for object shapes

```typescript
// Good
interface User {
  id: string;
  email: string;
}

async function getUser(id: string): Promise<User | null> {
  // Implementation
}

// Avoid
function getUser(id: any): any {
  // Implementation
}
```

### Error Handling

1. **Always catch and transform errors** in API handlers
2. **Use custom error classes** for different scenarios
3. **Include request IDs** in all error responses
4. **Log errors** with appropriate context

```typescript
try {
  const result = await riskyOperation();
  return standardSuccessResponse(result, requestId);
} catch (error) {
  // Log with context
  logger.error('Operation failed', { requestId, error });

  // Transform to AppError
  if (error instanceof AppError) {
    throw error;
  }

  throw new ExternalServiceError(
    'Operation failed',
    'service-name',
    error instanceof Error ? error : undefined
  );
}
```

### Async/Await

1. **Always use async/await** over raw promises
2. **Handle all errors** with try/catch
3. **Use Promise.all** for parallel operations

```typescript
// Good
async function fetchData(): Promise<Data> {
  const [users, posts] = await Promise.all([fetchUsers(), fetchPosts()]);
  return { users, posts };
}

// Avoid
function fetchData() {
  return fetchUsers().then((users) => {
    return fetchPosts().then((posts) => {
      return { users, posts };
    });
  });
}
```

---

## API Development

### Creating New Endpoints

1. Create route file in `src/app/api/[resource]/route.ts`
2. Use `withApiHandler` wrapper
3. Validate all inputs
4. Return standardized responses

```typescript
// src/app/api/ideas/route.ts
import { NextRequest } from 'next/server';
import { withApiHandler, standardSuccessResponse } from '@/lib/api-handler';
import { dbService } from '@/lib/db';
import { validateIdea } from '@/lib/validation';
import { ValidationError } from '@/lib/errors';

export const POST = withApiHandler(
  async ({ request, requestId, rateLimit }) => {
    const body = await request.json();

    // Validate
    const validation = validateIdea(body.idea);
    if (!validation.valid) {
      throw new ValidationError(validation.errors);
    }

    // Create
    const idea = await dbService.createIdea({
      user_id: body.userId,
      title: body.title,
      raw_text: body.idea,
      status: 'draft',
    });

    return standardSuccessResponse({ idea }, requestId, 201, rateLimit);
  },
  { rateLimit: 'moderate' }
);

export const GET = withApiHandler(
  async ({ request, requestId, rateLimit }) => {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      throw new ValidationError([
        { field: 'userId', message: 'User ID is required' },
      ]);
    }

    const ideas = await dbService.getUserIdeas(userId);
    return standardSuccessResponse({ ideas }, requestId, 200, rateLimit);
  },
  { rateLimit: 'lenient' }
);
```

### Response Format

All successful responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "requestId": "req_1234567890_abc123",
  "timestamp": "2024-01-07T12:00:00Z"
}
```

All error responses follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": [{ "field": "fieldName", "message": "Validation message" }],
  "timestamp": "2024-01-07T12:00:00Z",
  "requestId": "req_1234567890_abc123",
  "retryable": true,
  "suggestions": ["Try this...", "Or this..."]
}
```

---

## Database Operations

### Schema Overview

**Core Tables:**

- `users`: Managed by Supabase Auth
- `ideas`: User ideas/projects
- `idea_sessions`: Session state for clarification/breakdown
- `deliverables`: Project deliverables
- `tasks`: Individual tasks
- `vectors`: Embeddings and context data
- `agent_logs`: AI agent activity logs

### Query Patterns

```typescript
// Select with filters
const { data, error } = await supabase
  .from('ideas')
  .select('*')
  .eq('user_id', userId)
  .is('deleted_at', null)
  .order('created_at', { ascending: false });

// Join query
const { data, error } = await supabase
  .from('deliverables')
  .select('*, tasks(*)')
  .eq('idea_id', ideaId)
  .is('deleted_at', null);

// Upsert
const { data, error } = await supabase
  .from('idea_sessions')
  .upsert({ idea_id: ideaId, state: newState })
  .select()
  .single();

// Soft delete
const { error } = await supabase
  .from('ideas')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', ideaId);
```

### RLS Policies

Row Level Security is enforced on all tables. The backend uses:

- `supabaseClient` for user operations (respects RLS)
- `supabaseAdmin` for admin/system operations (bypasses RLS)

---

## Error Handling

### Error Hierarchy

```
AppError (base class)
├── ValidationError (400)
├── RateLimitError (429)
├── ExternalServiceError (502)
├── TimeoutError (504)
├── CircuitBreakerError (503)
├── RetryExhaustedError (502)
└── AuthenticationError (401)
```

### Best Practices

1. **Always transform unknown errors** to AppError instances
2. **Include requestId** in all error responses
3. **Provide actionable suggestions** for user-facing errors
4. **Log before throwing** for debugging
5. **Use appropriate status codes**

---

## Resilience Patterns

### Circuit Breaker

Prevents cascading failures by stopping calls to failing services.

```typescript
import { circuitBreakerManager } from '@/lib/resilience';

// Check circuit state
const state = circuitBreakerManager.get('openai');
console.log(state?.getState()); // 'closed', 'open', or 'half-open'

// Reset circuit manually
if (state?.getState() === 'open') {
  circuitBreakerManager.reset('openai');
}
```

**States:**

- `closed`: Normal operation
- `open`: Failing fast, not calling service
- `half-open`: Testing recovery

### Retry Logic

Automatic retries with exponential backoff:

```typescript
const result = await resilienceManager.execute(async () => await apiCall(), {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2, // 1s, 2s, 4s delays
});
```

### Timeout Management

Enforce timeouts on any operation:

```typescript
const result = await resilienceManager.execute(
  async () => await slowOperation(),
  { timeoutMs: 30000 }
);
```

---

## Testing

### Test Structure

```
tests/
├── api/              # API route tests
├── *.test.ts        # Unit tests
└── integration.test.ts  # Integration tests
```

### Writing Tests

```typescript
import { describe, it, expect, jest } from '@jest/globals';
import { POST } from '@/app/api/ideas/route';

describe('POST /api/ideas', () => {
  it('should create a new idea', async () => {
    const request = new Request('http://localhost:3000/api/ideas', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'user-123',
        title: 'Test Idea',
        idea: 'This is a test idea with sufficient length...',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.idea).toBeDefined();
  });

  it('should return 400 for invalid input', async () => {
    const request = new Request('http://localhost:3000/api/ideas', {
      method: 'POST',
      body: JSON.stringify({ idea: 'short' }), // Too short
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

### Running Tests

```bash
# All tests
npm test

# Specific test file
npm test -- tests/api/ideas.test.ts

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

---

## Common Issues & Solutions

### Issue: "Supabase client not initialized"

**Cause:** Environment variables not set
**Solution:** Check `.env.local` has:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Issue: Circuit breaker always open

**Cause:** Service consistently failing
**Solution:**

1. Check service health: `GET /api/health/detailed`
2. Verify API credentials
3. Reset circuit: `circuitBreakerManager.reset('service-name')`

### Issue: Rate limit exceeded

**Cause:** Too many requests from same IP
**Solution:**

1. Implement client-side rate limiting
2. Use exponential backoff for retries
3. Check `Retry-After` header

### Issue: TypeScript errors in tests

**Cause:** Test files need relaxed rules
**Solution:** Tests are excluded from strict linting. Run:

```bash
npm run type-check  # Check src only
npm test            # Tests run with ts-jest
```

### Issue: AI service timeouts

**Cause:** OpenAI/Anthropic API slow
**Solution:**

1. Increase timeout in resilience config
2. Implement request queuing
3. Use fallback models

---

## Build & Deployment

### Build Commands

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Full validation
npm run type-check && npm run lint && npm run build
```

### Environment Variables

Required for production:

```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI Services (at least one required)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Optional: Export Connectors
NOTION_API_KEY=
NOTION_PARENT_PAGE_ID=
TRELLO_API_KEY=
TRELLO_TOKEN=
GITHUB_TOKEN=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Deployment Checklist

- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] Health checks passing (`/api/health/detailed`)
- [ ] Rate limits configured appropriately
- [ ] Circuit breaker thresholds tuned
- [ ] Error monitoring enabled
- [ ] Logs shipping to aggregator

---

## Resources

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Architecture Documentation](./architecture.md)
- [API Reference](./api.md)

---

## Contributing

1. Follow TypeScript strict mode
2. Add tests for new features
3. Update this documentation
4. Ensure `npm run lint` passes
5. Ensure `npm run type-check` passes
6. Ensure `npm test` passes

---

## Changelog

### 2024-01-07

- Initial backend engineer guide
- Fixed lint command in package.json
- Documented resilience patterns
- Added troubleshooting section

---

_Last updated: 2024-01-07 by Backend Engineer Agent_
