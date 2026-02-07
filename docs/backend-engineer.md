# Backend Engineer Guide

## Overview

This document provides comprehensive guidance for backend engineers working on the IdeaFlow application. It covers the backend architecture, common issues, debugging strategies, and best practices.

## Architecture

### Project Structure

```
src/
├── lib/                    # Core backend logic
│   ├── db.ts              # Database service and types
│   ├── ai.ts              # AI service abstraction
│   ├── errors.ts          # Error handling classes
│   ├── validation.ts      # Input validation
│   ├── rate-limit.ts      # Rate limiting
│   ├── pii-redaction.ts   # PII protection
│   ├── cache.ts           # Caching layer
│   ├── logger.ts          # Logging service
│   ├── api-handler.ts     # API request handler
│   ├── api-client.ts      # API client utilities
│   ├── resilience/        # Resilience framework
│   │   ├── manager.ts
│   │   ├── circuit-breaker.ts
│   │   ├── retry-manager.ts
│   │   └── timeout-manager.ts
│   ├── export-connectors/ # Export integrations
│   │   ├── manager.ts
│   │   ├── base.ts
│   │   ├── notion-exporter.ts
│   │   ├── trello-exporter.ts
│   │   └── ...
│   └── agents/            # AI agent implementations
│       ├── clarifier.ts
│       └── breakdown-engine/
├── app/api/               # API routes (Next.js App Router)
│   ├── health/
│   ├── clarify/
│   ├── breakdown/
│   └── ideas/
└── types/                 # TypeScript type definitions
    └── database.ts
```

### Key Components

#### 1. Database Service (`src/lib/db.ts`)

The `DatabaseService` is a singleton that provides typed database operations using Supabase.

**Key Features:**

- Singleton pattern for connection pooling
- Separate client and admin connections
- Automatic PII redaction in logs
- Type-safe operations with TypeScript

**Important Notes:**

- Uses `as never` type assertions for Supabase operations (required due to strict typing)
- Includes `reinitializeClients()` and `resetInstance()` methods for testing
- All database operations validate client initialization before executing

**Usage:**

```typescript
import { DatabaseService } from '@/lib/db';

const db = DatabaseService.getInstance();
const idea = await db.createIdea({ user_id: '...', title: '...', ... });
```

#### 2. Export Connectors (`src/lib/export-connectors/`)

Provides export functionality to various external services.

**Available Connectors:**

- **JSON**: Basic JSON export
- **Markdown**: Markdown document generation with content preview
- **Notion**: Notion page creation
- **Trello**: Trello board creation
- **GitHub Projects**: GitHub project export
- **Google Tasks**: Google Tasks integration

**Important Changes:**

- All connectors are now always registered (removed `window` check that was causing test issues)
- `ExportResult` interface includes optional `content` property for markdown exports

**Usage:**

```typescript
import { exportManager } from '@/lib/export-connectors';

const result = await exportManager.exportToMarkdown(data);
if (result.success) {
  console.log(result.content); // Markdown content
  console.log(result.url); // Data URL
}
```

#### 3. Resilience Framework (`src/lib/resilience/`)

Provides fault tolerance for external service calls.

**Components:**

- **Circuit Breaker**: Prevents cascading failures
- **Retry Manager**: Automatic retries with exponential backoff
- **Timeout Manager**: Enforces operation timeouts
- **Resilience Manager**: Orchestrates all resilience patterns

**Configuration:**

```typescript
const defaultResilienceConfigs = {
  openai: { maxRetries: 3, timeoutMs: 60000, failThreshold: 5, resetMs: 60000 },
  notion: { maxRetries: 3, timeoutMs: 30000, failThreshold: 5, resetMs: 30000 },
  trello: { maxRetries: 3, timeoutMs: 15000, failThreshold: 3, resetMs: 20000 },
};
```

#### 4. AI Service (`src/lib/ai.ts`)

Abstracts AI model interactions (OpenAI, Anthropic).

**Features:**

- Provider-agnostic interface
- Automatic retries via resilience framework
- Cost guardrails
- Context window management

## Common Issues & Fixes

### 1. Supabase Type Errors

**Problem:** TypeScript errors with Supabase operations (`as any` not assignable to `never`)

**Solution:** Use `as never` type assertion:

```typescript
// Before (causes error)
.insert(idea as any)

// After (works)
.insert(idea as never)
```

### 2. DatabaseService Singleton in Tests

**Problem:** Tests fail because singleton was initialized before mocks

**Solution:** Reset and reinitialize in test setup:

```typescript
beforeEach(() => {
  DatabaseService.resetInstance();
  const db = DatabaseService.getInstance();
  db.reinitializeClients();
});
```

### 3. Export Connectors Not Registered

**Problem:** Server-side connectors (Notion, Trello) not available in tests

**Solution:** All connectors are now always registered in `ExportManager` constructor. The previous `typeof window === 'undefined'` check was removed.

### 4. Markdown Export Missing Content

**Problem:** Tests expect `result.content` but only `url` was returned

**Solution:** Added `content` property to `ExportResult` interface and `MarkdownExporter`:

```typescript
return {
  success: true,
  url: `data:text/markdown;charset=utf-8,${encodeURIComponent(markdown)}`,
  content: markdown, // Added
};
```

## Testing

### Backend Test Files

- `tests/backend-comprehensive.test.ts` - Main backend service tests
- `tests/export-resilience-integration.test.ts` - Export connector resilience tests
- `tests/errors.test.ts` - Error handling tests
- `tests/validation.test.ts` - Input validation tests
- `tests/resilience.test.ts` - Resilience framework tests

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- --testPathPattern="backend-comprehensive"

# Run with coverage
npm run test:coverage
```

### Test Environment Setup

Tests use mocks for external dependencies:

- Supabase client mocked via `createMockSupabaseClient()`
- OpenAI client mocked via Jest mocks
- Environment variables set via `mockEnvVars`

## API Endpoints

### Health Endpoints

- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed system health
- `GET /api/health/database` - Database health

### Clarification Flow

- `POST /api/clarify/start` - Start clarification session
- `POST /api/clarify/answer` - Submit answer
- `POST /api/clarify/complete` - Complete clarification

### Breakdown

- `POST /api/breakdown` - Generate project breakdown
- `GET /api/breakdown` - Get existing breakdown

### Ideas

- `GET /api/ideas` - List ideas
- `POST /api/ideas` - Create idea
- `GET /api/ideas/:id` - Get idea
- `PATCH /api/ideas/:id` - Update idea
- `DELETE /api/ideas/:id` - Delete idea

## Best Practices

### 1. Error Handling

Always use typed errors from `src/lib/errors.ts`:

```typescript
import { ValidationError, ExternalServiceError } from '@/lib/errors';

throw new ValidationError('Invalid input', [
  { field: 'title', message: 'Required' },
]);
```

### 2. Database Operations

- Always check client initialization
- Use transactions for multi-step operations
- Sanitize data before logging (PII redaction)

### 3. External Service Calls

Always wrap external calls with resilience framework:

```typescript
import { resilienceManager, defaultResilienceConfigs } from '@/lib/resilience';

const result = await resilienceManager.execute(
  async () => await externalAPICall(),
  defaultResilienceConfigs.openai,
  'openai-chat-completion'
);
```

### 4. Type Safety

- Define interfaces for all data structures
- Use TypeScript strict mode
- Avoid `any` when possible (use `unknown` with type guards)

### 5. Logging

Use the structured logger with PII redaction:

```typescript
import { createLogger } from '@/lib/logger';

const logger = createLogger('ServiceName');
logger.info('Operation completed', { ideaId: '...' });
logger.error('Operation failed', error);
```

## Build & Deployment

### Build Commands

```bash
npm run build          # Production build
npm run type-check     # TypeScript type checking
npm run lint           # ESLint
npm test               # Run tests
```

### Environment Variables

Required for backend:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side)
- `OPENAI_API_KEY` - OpenAI API key
- `NOTION_API_KEY` - Notion integration key (optional)
- `TRELLO_API_KEY` - Trello API key (optional)
- `TRELLO_TOKEN` - Trello token (optional)
- `GITHUB_TOKEN` - GitHub token (optional)

## Debugging

### Enable Debug Logging

Set log level in `src/lib/config/constants.ts`:

```typescript
export const LOG_LEVEL = LogLevel.DEBUG;
```

### Common Debug Commands

```bash
# Check health endpoint
curl http://localhost:3000/api/health/detailed

# Test clarification API
curl -X POST http://localhost:3000/api/clarify/start \
  -H "Content-Type: application/json" \
  -d '{"ideaId": "...", "ideaText": "..."}'
```

## Recent Changes

### Fixed Issues

1. **Markdown Exporter**: Added `content` property to export result
2. **Export Manager**: Removed window check to always register all connectors
3. **Database Service**: Added test helpers (`reinitializeClients`, `resetInstance`)
4. **TypeScript**: Fixed Supabase type errors with proper type assertions

### Known Issues

- Export resilience integration tests have mocking issues (core functionality works)
- Some ESLint warnings in test files (non-critical)

## Resources

- [Architecture Documentation](./architecture.md)
- [API Reference](./api.md)
- [Error Codes](./error-codes.md)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
