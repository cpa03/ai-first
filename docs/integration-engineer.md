# Integration Engineer Documentation

## Overview

This document provides comprehensive documentation for integration engineers working on IdeaFlow. It covers the integration architecture, common patterns, troubleshooting guides, and best practices for maintaining robust external service integrations.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Integration Components](#integration-components)
3. [Resilience Patterns](#resilience-patterns)
4. [Export Connectors](#export-connectors)
5. [Common Issues & Fixes](#common-issues--fixes)
6. [Testing & Validation](#testing--validation)
7. [Monitoring & Observability](#monitoring--observability)

---

## Architecture Overview

IdeaFlow integrates with multiple external services:

- **AI Providers**: OpenAI, Anthropic (for idea breakdown and clarification)
- **Export Destinations**: Notion, Trello, GitHub Projects, Google Tasks
- **Database**: Supabase (PostgreSQL + Vector store)
- **Authentication**: Supabase Auth

### Integration Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Application                          │
├─────────────────────────────────────────────────────────────┤
│  Export Manager      │  AI Service      │  Database Service │
│  (src/lib/export-    │  (src/lib/ai.ts) │  (src/lib/db.ts)  │
│   connectors/)       │                  │                   │
├──────────────────────┴──────────────────┴───────────────────┤
│                    Resilience Framework                      │
│              (src/lib/resilience/)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Circuit   │  │   Retry     │  │      Timeout        │  │
│  │   Breaker   │  │   Manager   │  │      Manager        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                      Error Handling                          │
│               (src/lib/errors.ts)                            │
├─────────────────────────────────────────────────────────────┤
│                  External Services                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐ │
│  │  OpenAI  │ │  Notion  │ │  Trello  │ │ GitHub Projects│ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Integration Components

### 1. Export Connectors (`src/lib/export-connectors/`)

Each external service has a dedicated connector implementing the `ExportConnector` base class:

- **NotionExporter** (`notion-exporter.ts`): Exports projects to Notion pages
- **TrelloExporter** (`trello-exporter.ts`): Creates boards, lists, and cards
- **GitHubProjectsExporter** (`github-projects-exporter.ts`): Creates repos, projects, and issues
- **GoogleTasksExporter** (`google-tasks-exporter.ts`): OAuth-based task list export
- **MarkdownExporter** (`markdown-exporter.ts`): Local file export
- **JSONExporter** (`json-exporter.ts`): Structured JSON export

#### Base Class Interface (`base.ts`)

All connectors extend `ExportConnector` which provides:

```typescript
abstract class ExportConnector {
  abstract readonly type: string;
  abstract readonly name: string;

  abstract export(
    data: ExportData,
    options?: Record<string, unknown>
  ): Promise<ExportResult>;
  abstract validateConfig(): Promise<boolean>;
  abstract getAuthUrl?(): Promise<string>;
  abstract handleAuthCallback?(code: string): Promise<void>;

  protected getResilienceConfig(): ResilienceConfig;
  protected executeWithResilience<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T>;
}
```

### 2. AI Service (`src/lib/ai.ts`)

Handles all AI provider interactions with:

- **Model Configuration**: Provider-specific settings (OpenAI, Anthropic)
- **Cost Tracking**: Daily limits and usage monitoring
- **Context Windowing**: Conversation state management
- **Response Caching**: Duplicate request prevention
- **Resilience Patterns**: Automatic retry and circuit breaking

### 3. Database Service (`src/lib/db.ts`)

Supabase client wrapper providing:

- **Connection Management**: Client and admin clients
- **CRUD Operations**: Ideas, deliverables, tasks, vectors
- **Soft Delete**: Non-destructive record removal
- **Health Checks**: Database connectivity validation

---

## Resilience Patterns

All external integrations use the resilience framework to handle failures gracefully.

### Circuit Breaker Pattern

Prevents cascading failures by stopping calls to failing services:

```typescript
import { circuitBreakerManager } from '@/lib/resilience';

// Check circuit state before operation
const states = circuitBreakerManager.getAllStatuses();
if (states['openai']?.state === 'open') {
  throw new CircuitBreakerError('openai', new Date(states['openai'].nextAttemptTime));
}

// Execute with automatic circuit breaker
const result = await resilienceManager.execute(
  async () => await openai.chat.completions.create(...),
  defaultResilienceConfigs.openai,
  'openai-chat-completion'
);
```

### Retry with Exponential Backoff

Automatic retry for transient failures:

- **Max Retries**: 3 attempts (configurable per service)
- **Initial Delay**: 1 second
- **Backoff Multiplier**: 2x (1s → 2s → 4s)
- **Max Delay**: 10-30 seconds depending on service

### Timeout Protection

Prevents indefinite hangs:

- **OpenAI**: 60 seconds
- **Notion**: 30 seconds
- **Trello**: 15 seconds
- **GitHub**: 30 seconds
- **Database**: 10 seconds

### Service-Specific Configurations

Located in `src/lib/resilience/config.ts`:

```typescript
export const defaultResilienceConfigs = {
  openai: {
    retry: { maxRetries: 3, baseDelayMs: 1000, maxDelayMs: 10000 },
    timeout: { timeoutMs: 60000 },
    circuitBreaker: { failureThreshold: 5, resetTimeoutMs: 60000 },
  },
  github: {
    retry: { maxRetries: 3, baseDelayMs: 1000, maxDelayMs: 5000 },
    timeout: { timeoutMs: 30000 },
    circuitBreaker: { failureThreshold: 5, resetTimeoutMs: 30000 },
  },
  notion: {
    retry: { maxRetries: 3, baseDelayMs: 1000, maxDelayMs: 5000 },
    timeout: { timeoutMs: 30000 },
    circuitBreaker: { failureThreshold: 5, resetTimeoutMs: 30000 },
  },
  trello: {
    retry: { maxRetries: 3, baseDelayMs: 500, maxDelayMs: 3000 },
    timeout: { timeoutMs: 15000 },
    circuitBreaker: { failureThreshold: 3, resetTimeoutMs: 20000 },
  },
  supabase: {
    retry: { maxRetries: 2, baseDelayMs: 1000, maxDelayMs: 10000 },
    timeout: { timeoutMs: 10000 },
    circuitBreaker: { failureThreshold: 10, resetTimeoutMs: 60000 },
  },
};
```

---

## Export Connectors

### Connector Configuration

Each connector validates its configuration before use:

```typescript
// Example: Trello configuration validation
async validateConfig(): Promise<boolean> {
  const apiKey = process.env.TRELLO_API_KEY;
  const token = process.env.TRELLO_TOKEN;

  if (!apiKey || !token) return false;

  const response = await this.executeWithResilience(
    () => fetch(`${this.API_BASE}/members/me?key=${apiKey}&token=${token}`),
    'validate-config'
  );
  return response.ok;
}
```

### Required Environment Variables

#### Notion

- `NOTION_API_KEY` - Integration token
- `NOTION_CLIENT_ID` - OAuth client ID (optional)
- `NOTION_CLIENT_SECRET` - OAuth client secret (optional)
- `NOTION_PARENT_PAGE_ID` - Default parent page (optional)

#### Trello

- `TRELLO_API_KEY` - API key
- `TRELLO_TOKEN` - User token

#### GitHub Projects

- `GITHUB_TOKEN` - Personal access token
- `GITHUB_CLIENT_ID` - OAuth client ID (optional)

#### Google Tasks

- `GOOGLE_CLIENT_ID` - OAuth client ID
- `GOOGLE_CLIENT_SECRET` - OAuth client secret

---

## Common Issues & Fixes

### Issue 1: Incorrect Resilience Config for Google Tasks

**Location**: `src/lib/export-connectors/base.ts`

**Problem**: Google Tasks exporter was incorrectly mapped to `defaultResilienceConfigs.github` instead of having its own configuration.

**Fix Applied**:

```typescript
if (type === 'google-tasks') {
  // Google Tasks uses default resilience config
  return {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 10000,
    timeoutMs: TIMEOUT_CONFIG.DEFAULT,
    failureThreshold: 5,
    resetTimeoutMs: 60000,
  };
}
```

**Impact**: Ensures Google Tasks operations use appropriate timeouts and retry settings.

### Issue 2: Circuit Breaker State Leaks

**Symptom**: Circuit breakers not resetting properly after service recovery.

**Solution**: Use the health check endpoint to monitor and manually reset if needed:

```typescript
// Check health endpoint
const health = await fetch('/api/health/detailed');
const data = await health.json();

// Reset specific circuit breaker if needed
import { circuitBreakerManager } from '@/lib/resilience';
circuitBreakerManager.reset('trello');
```

### Issue 3: Timeout Handling in Export Operations

**Problem**: Export operations hanging indefinitely when external services are slow.

**Solution**: All export connectors use `executeWithResilience` which includes timeout protection:

```typescript
protected async executeWithResilience<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T> {
  const config = this.getResilienceConfig();
  return resilienceManager.execute(
    operation,
    config,
    `${this.type}-${context || 'operation'}`
  );
}
```

### Issue 4: API Rate Limiting

**Symptom**: 429 errors from external services.

**Solution**: The resilience framework automatically retries on rate limit errors:

```typescript
// Retryable errors include:
// - HTTP 429 (Rate Limit)
// - HTTP 502, 503, 504 (Gateway errors)
// - Network errors (ECONNRESET, ECONNREFUSED, ETIMEDOUT)
```

Monitor rate limits in logs and adjust `rateLimitConfigs` if needed.

---

## Testing & Validation

### Unit Tests

Test individual connectors:

```typescript
describe('NotionExporter', () => {
  it('should validate configuration', async () => {
    const exporter = new NotionExporter();
    const isValid = await exporter.validateConfig();
    // Assert based on environment
  });

  it('should handle export errors gracefully', async () => {
    const exporter = new NotionExporter();
    const result = await exporter.export({
      idea: { id: 'test', title: 'Test', raw_text: 'Test' },
    });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### Integration Tests

Test full export workflows:

```typescript
describe('Export Integration', () => {
  it('should export to Trello', async () => {
    const result = await exportManager.exportToTrello({
      idea: testIdea,
      deliverables: testDeliverables,
      tasks: testTasks,
    });
    expect(result.success).toBe(true);
    expect(result.url).toBeDefined();
  });
});
```

### Validation Commands

```bash
# Type checking
npm run type-check

# Linting
npx eslint src --ext .ts,.tsx

# Build verification
npm run build

# Test all connectors
npm run test:integration
```

---

## Monitoring & Observability

### Health Endpoints

- `/api/health` - Basic system health
- `/api/health/database` - Database connectivity
- `/api/health/detailed` - Comprehensive status including circuit breakers

### Circuit Breaker Monitoring

```typescript
// Get all circuit breaker states
const states = circuitBreakerManager.getAllStatuses();

// Example response:
{
  'openai': {
    state: 'closed', // 'closed' | 'open' | 'half-open'
    failures: 0,
    nextAttemptTime: undefined
  },
  'trello': {
    state: 'open',
    failures: 5,
    nextAttemptTime: '2024-01-07T12:00:30Z'
  }
}
```

### Key Metrics to Monitor

1. **Circuit Breaker Open Frequency**
   - Alert when breakers open frequently
   - Track which services have the most failures

2. **Retry Success Rates**
   - Monitor retry effectiveness per service
   - Adjust retry configurations based on patterns

3. **Export Success Rates**
   - Track successful vs failed exports per connector
   - Monitor export duration trends

4. **AI Cost Tracking**
   - Daily cost monitoring via `aiService.getTodayCost()`
   - Alert when approaching `COST_LIMIT_DAILY`

### Logging Best Practices

All integrations use structured logging with request IDs:

```typescript
import { createLogger } from '@/lib/logger';

const logger = createLogger('NotionExporter');

// Log with context
logger.error('Export failed', {
  error: error.message,
  ideaId: data.idea.id,
  attempt: retryCount,
});
```

---

## Troubleshooting Guide

### Export Failures

**Symptom**: Export returns `{ success: false, error: ... }`

**Steps**:

1. Check connector configuration: `await connector.validateConfig()`
2. Verify environment variables are set
3. Check circuit breaker state in `/api/health/detailed`
4. Review logs for specific error messages
5. Test API credentials directly with curl/Postman

### Circuit Breaker Won't Close

**Symptom**: Service remains unavailable after recovery

**Steps**:

1. Check `/api/health/detailed` for circuit breaker states
2. Manually reset if needed:
   ```typescript
   circuitBreakerManager.reset('service-name');
   ```
3. Verify service is actually healthy with direct API call
4. Check for persistent authentication issues

### Timeout Errors

**Symptom**: Operations fail with `TimeoutError`

**Steps**:

1. Check external service status page
2. Verify network connectivity
3. Increase timeout in resilience config if needed
4. Consider implementing request queuing for large operations

### Authentication Failures

**Symptom**: `401 Unauthorized` or `403 Forbidden` errors

**Steps**:

1. Verify API keys/tokens in environment variables
2. Check token expiration dates
3. Ensure required scopes/permissions are granted
4. Test with fresh credentials

---

## Development Guidelines

### Adding a New Export Connector

1. Create new file in `src/lib/export-connectors/`
2. Extend `ExportConnector` base class
3. Implement required methods: `export`, `validateConfig`
4. Add to `ExportManager` in `manager.ts`
5. Add connector to `connectors.ts` exports
6. Update documentation
7. Add tests

### Example:

```typescript
// src/lib/export-connectors/jira-exporter.ts
import { ExportConnector, ExportResult, ExportData } from './base';

export class JiraExporter extends ExportConnector {
  readonly type = 'jira';
  readonly name = 'Jira';

  async export(
    data: ExportData,
    options?: Record<string, unknown>
  ): Promise<ExportResult> {
    // Implementation with resilience patterns
    return this.executeWithResilience(async () => {
      // Jira API calls here
    }, 'export');
  }

  async validateConfig(): Promise<boolean> {
    // Configuration validation
  }
}
```

### Code Review Checklist

- [ ] Resilience patterns implemented correctly
- [ ] Error handling uses standardized error classes
- [ ] PII redaction applied to all logging
- [ ] Environment variables documented
- [ ] Tests added for new functionality
- [ ] Health check integration verified
- [ ] Circuit breaker configuration appropriate for service

---

## References

- [Integration Hardening](./integration-hardening.md) - Detailed resilience implementation
- [Agent Guidelines](./agent-guidelines.md) - Code standards and practices
- [Error Codes](./error-codes.md) - Error handling reference
- [Health Monitoring](./health-monitoring.md) - Health endpoint documentation
- [Architecture](./architecture.md) - System architecture overview

---

## Version History

| Version | Date       | Changes                                      |
| ------- | ---------- | -------------------------------------------- |
| 1.0.0   | 2024-01-07 | Initial documentation                        |
| 1.0.1   | 2025-02-07 | Fixed Google Tasks resilience config mapping |

---

**Last Updated**: 2025-02-07  
**Maintainer**: Integration Engineer  
**Review Status**: Approved
