# ADR-003: REST API Design Patterns with Next.js App Router

## Status

Accepted

## Context

IdeaFlow exposes several API endpoints for:

- User authentication and management
- Idea CRUD operations
- Clarification flow sessions
- Breakdown generation
- Task and deliverable management
- Analytics and metrics
- Health monitoring

The team needed to choose an API architecture that:

- Integrates well with Next.js App Router
- Provides type safety across frontend and backend
- Handles errors consistently
- Supports authentication and authorization
- Is easy to test and maintain

## Decision

Use **RESTful API with Next.js App Router** with the following patterns:

### 1. Route-Based Structure

Each API endpoint is a file in `src/app/api/` following REST conventions:

```
/api
  /ideas          -> Idea CRUD
  /ideas/[id]     -> Single idea
  /ideas/[id]/tasks -> Tasks for idea
  /clarify        -> Clarification flow
  /tasks          -> Task management
  /health         -> Health checks
```

### 2. Standardized Request/Response Types

All endpoints use shared type definitions:

```typescript
// Request types
interface ApiRequest {
  // Common request properties
}

// Response types
interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
```

### 3. Consistent Error Handling

All errors follow a standardized format:

```typescript
// Error codes defined in docs/error-codes.md
const ERROR_CODES = {
  UNAUTHORIZED: 'AUTH_001',
  FORBIDDEN: 'AUTH_002',
  NOT_FOUND: 'RESOURCE_001',
  VALIDATION_ERROR: 'VALIDATION_001',
  // ...
};
```

### 4. Authentication Pattern

All protected routes use Supabase JWT validation:

```typescript
// Middleware extracts and validates JWT
// Route handlers get user from request
async function handler(request: NextRequest) {
  const user = request.headers.get('x-user');
  if (!user) {
    return errorResponse('UNAUTHORIZED', 401);
  }
  // ...
}
```

### 5. Response Helpers

Standardized response creation:

```typescript
function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

function errorResponse(code: string, message: string, status = 400) {
  return NextResponse.json({ error: { code, message } }, { status });
}
```

### 6. Validation Pattern

Input validation using Zod schemas:

```typescript
const CreateIdeaSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
});

async function handler(request: NextRequest) {
  const body = await request.json();
  const result = CreateIdeaSchema.safeParse(body);
  if (!result.success) {
    return errorResponse('VALIDATION_001', result.error.message);
  }
  // ...
}
```

## Alternatives Considered

### 1. GraphQL

- **Pros**: Flexible queries,减少over-fetching, single endpoint
- **Cons**: Complexity, learning curve, N+1 query risks, less standard
- **Verdict**: Rejected; overkill for this project's needs

### 2. tRPC

- **Pros**: End-to-end type safety, great DX
- **Cons**: Vendor lock-in to Next.js, less portable
- **Verdict**: Consider for future if needs grow

### 3. OpenAPI/Swagger REST

- **Pros**: Standard contract, easy client generation
- **Cons**: Additional setup, maintenance overhead
- **Verdict**: Could add later if needed for external APIs

### 4. API Routes Only (No App Router)

- **Pros**: Simpler, less abstraction
- **Cons**: Missing newer Next.js features, less organized
- **Verdict**: Rejected; App Router is the future

## Consequences

### Positive

- **Consistency**: All endpoints follow same patterns
- **Type Safety**: Shared types used everywhere
- **Maintainability**: Easy to find and modify endpoints
- **Testability**: Clear interfaces make testing easier
- **DX**: Standardized errors help debugging

### Negative

- **Boilerplate**: Each route requires similar setup
- **Verbosity**: More files than a single handler
- **Learning Curve**: New patterns need documentation

### Mitigations

- Create helper functions for common patterns
- Document patterns in API guide
- Use route groups for organization

## References

- [API Documentation](../api.md)
- [Error Codes](../error-codes.md)
- [API Handler Utility](../../src/lib/api-handler.ts)
- [Route Examples](../../src/app/api/ideas/)

## Notes

- Consider adding OpenAPI spec for external consumers
- Rate limiting not yet fully implemented
- API versioning could be added if needed
