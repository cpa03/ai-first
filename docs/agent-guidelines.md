# Agent Guidelines

This document outlines strict rules and guidelines that all AI agents must follow when working with the IdeaFlow codebase. These guidelines ensure consistency, safety, and maintainability.

## Core Principles

1. **No direct pushes to main branch** - All agent changes go through feature branches and PRs
2. **All changes must be logged and tracked** - Every action must be auditable
3. **Human-in-the-loop policy for critical decisions** - Destructive ops require human approval
4. **Rate-limits and cost guardrails must be implemented** - Prevent abuse and excessive costs
5. **Secrets must never be committed to the repository** - Use GitHub secrets or environment variables
6. **All code changes must include appropriate tests** - Ensure code quality
7. **Rollback procedures must be documented for all changes** - Enable quick recovery
8. **Use the resilience framework** - All external API calls must use resilience patterns
9. **Implement proper error handling** - Use standardized error classes and codes
10. **Monitor health and circuit breakers** - Check system status before operations

---

## Branch Management

### Feature Branch Naming

All agent work must use feature branches with this pattern:

```
agent/<agent-name>-YYYYMMDD-HHMM
```

Examples:

- `agent/clarifier-20240107-1200`
- `agent/breakdown-20240107-1430`
- `agent/security-20240107-1600`

### Branch Operations

1. Create feature branch from `main`
2. Make changes on feature branch
3. Create PR from feature branch to `main`
4. Never merge directly to `main`
5. Delete branch after merge (optional)

### Syncing with Main

Before pushing or creating PR, sync with latest `main`:

```bash
git fetch origin main
git rebase origin/main
```

---

## Commit Guidelines

### Commit Message Format

All commits must include the `AGENT=<agent-name>` prefix:

```
AGENT=<agent-name>: <type>: <subject>

<body>

<footer>
```

### Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Commit Examples

```
AGENT=clarifier: feat: add multi-question support

- Support multiple questions in single session
- Improve question routing logic
- Add validation for question types

Fixes #123
```

```
AGENT=breakdown: fix: handle timeout errors gracefully

- Implement circuit breaker for AI calls
- Add retry logic with exponential backoff
- Update error handling
```

### Commit Rules

1. Always include `AGENT=<agent-name>` prefix
2. Use conventional commit format
3. Reference relevant issue/PR numbers
4. Keep subject line under 72 characters
5. Use imperative mood ("Add" not "Added")
6. Explain "why" and "what", not just "how"
7. Keep messages concise and clear

---

## Pull Request Guidelines

### PR Template

All PRs must include this machine-readable metadata:

```markdown
---
agent_name: <agent-name>
task_id: <task-identifier>
confidence_score: <0.0-1.0>
human_review_required: true|false
---

## Summary

<brief description of changes>

## Changes Made

- [ ] Feature 1
- [ ] Feature 2
- [ ] Bug fix 1

## Testing

- [ ] Unit tests added
- [ ] Integration tests added
- [ ] All tests pass
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Error handling implemented
- [ ] Resilience patterns used
- [ ] Rollback plan documented
```

### PR Labels

Use appropriate labels:

- `requires-human`: Requires human review before merge
- `breaking-change`: Breaking changes to API/DB
- `enhancement`: New feature or improvement
- `bug-fix`: Bug correction
- `documentation`: Documentation updates
- `testing`: Test additions/fixes

### PR Review Process

1. Automated tests must pass
2. Code review required for non-trivial changes
3. Label with `requires-human` for destructive changes
4. At least one approval required
5. Resolve all review comments before merge

---

## Error Handling Requirements

### Use Standardized Error Classes

Agents must use error classes from `@/lib/errors`:

```typescript
import {
  ValidationError,
  RateLimitError,
  ExternalServiceError,
  TimeoutError,
  CircuitBreakerError,
  AppError,
  ErrorCode,
} from '@/lib/errors';
```

### Error Usage Patterns

**Validation Errors:**

```typescript
import { ValidationError } from '@/lib/errors';

if (!ideaId || !isValidUUID(ideaId)) {
  throw new ValidationError([
    { field: 'ideaId', message: 'ideaId must be a valid UUID' },
  ]);
}
```

**External Service Errors:**

```typescript
import { ExternalServiceError } from '@/lib/errors';
import { resilienceManager } from '@/lib/resilience';

try {
  await resilienceManager.execute(
    async () => await openai.chat.completions.create(...),
    defaultResilienceConfigs.openai,
    'openai-chat-completion'
  );
} catch (error) {
  throw new ExternalServiceError(
    'Failed to generate completion',
    'openai',
    error
  );
}
```

**Timeout Errors:**

```typescript
import { TimeoutError } from '@/lib/errors';
import { timeoutManager } from '@/lib/resilience';

try {
  result = await timeoutManager.execute(() => longRunningOperation(), 30000);
} catch (error) {
  throw new TimeoutError('Operation timed out', 30000);
}
```

### API Route Error Handling

All API routes must use `toErrorResponse()`:

```typescript
import { toErrorResponse, generateRequestId } from '@/lib/errors';

export async function POST(request: Request) {
  const requestId = generateRequestId();

  try {
    // Business logic here
    return NextResponse.json({ success: true, requestId });
  } catch (error) {
    return toErrorResponse(error, requestId);
  }
}
```

### Logging and Tracing

All errors must be logged with request ID:

```typescript
import { generateRequestId } from '@/lib/errors';

const requestId = generateRequestId();

try {
  // Operation
} catch (error) {
  console.error(`[${requestId}] Operation failed:`, error);
  throw error;
}
```

---

## Resilience Framework Requirements

### External API Calls

All external API calls MUST be wrapped in resilience framework:

```typescript
import { resilienceManager, defaultResilienceConfigs } from '@/lib/resilience';

// Good - uses resilience
const result = await resilienceManager.execute(
  async () => {
    return await fetch('https://api.example.com/data');
  },
  defaultResilienceConfigs.openai,
  'external-api-call'
);

// Bad - direct call without resilience
const response = await fetch('https://api.example.com/data');
```

### Configuration

Use pre-defined configs from `defaultResilienceConfigs`:

```typescript
import { defaultResilienceConfigs } from '@/lib/resilience';

// Available configs:
// - defaultResilienceConfigs.openai
// - defaultResilienceConfigs.notion
// - defaultResilienceConfigs.trello
// - defaultResilienceConfigs.github
// - defaultResilienceConfigs.supabase
```

### Circuit Breaker Awareness

Before calling external services, check circuit breaker state:

```typescript
import { resilienceManager } from '@/lib/resilience';

const states = resilienceManager.getCircuitBreakerStates();

if (states['openai'].state === 'open') {
  // Circuit is open, handle gracefully
  throw new CircuitBreakerError(
    'openai',
    new Date(states['openai'].nextAttemptTime)
  );
}
```

### Timeout Configuration

Always specify timeouts for external operations:

```typescript
import { timeoutManager } from '@/lib/resilience';

// Good - with timeout
const result = await timeoutManager.execute(
  () => longRunningOperation(),
  30000 // 30 seconds
);

// Bad - no timeout
const result = await longRunningOperation();
```

---

## Rate Limiting Requirements

### Implement Rate Limits

Agents must enforce rate limiting on their operations:

```typescript
import {
  checkRateLimit,
  rateLimitConfigs,
  rateLimitResponse,
} from '@/lib/rate-limit';

const rateLimitResult = checkRateLimit(
  clientIp,
  rateLimitConfigs.moderate // or strict, lenient
);

if (!rateLimitResult.allowed) {
  return rateLimitResponse(rateLimitResult.resetTime);
}
```

### Rate Limit Tiers

- `strict`: 10 requests/minute - For expensive operations
- `moderate`: 30 requests/minute - For standard operations
- `lenient`: 60 requests/minute - For cheap operations

### Rate Limit Enforcement

All API routes must check rate limits:

```typescript
export async function POST(request: Request) {
  // Always check rate limit first
  const rateLimitResult = checkRateLimit(
    request.headers.get('x-forwarded-for') || 'unknown',
    rateLimitConfigs.moderate
  );

  if (!rateLimitResult.allowed) {
    return rateLimitResponse(rateLimitResult.resetTime);
  }

  // Business logic here
}
```

---

## Input Validation Requirements

### Validate All Inputs

All API inputs must be validated:

```typescript
import {
  validateIdea,
  validateIdeaId,
  validateUserResponses,
  validateRequestSize,
} from '@/lib/validation';

// Validate request size
const sizeValidation = validateRequestSize(request);
if (!sizeValidation.valid) {
  throw new ValidationError(sizeValidation.errors);
}

// Validate idea ID
const idValidation = validateIdeaId(ideaId);
if (!idValidation.valid) {
  throw new ValidationError(idValidation.errors);
}

// Validate idea text
const ideaValidation = validateIdea(ideaText);
if (!ideaValidation.valid) {
  throw new ValidationError(ideaValidation.errors);
}
```

### Validation Rules

- Request body: max 1MB
- Idea text: 10-10,000 characters
- Answer text: max 5,000 characters
- IDs: must be valid UUID
- Required fields: must be present and non-empty

---

## PII Protection Requirements

### Redact Sensitive Information

All user input must be redacted before logging:

```typescript
import { redactPII } from '@/lib/pii-redaction';

// Bad - logs raw data
console.log('User input:', userInput);

// Good - redacts PII
const safeText = redactPII(userInput);
console.log('User input:', safeText);
```

### PII Patterns

Redacted information includes:

- Email addresses
- Phone numbers
- Credit card numbers
- Social security numbers
- API keys and tokens

### Audit Logging

Use redacted versions in all logs and agent actions:

```typescript
const safeText = redactPII(userInput);
await this.logAgentAction('clarifier', 'start_clarification', {
  ideaText: safeText, // Redacted version
  ideaId: ideaId,
});
```

---

## Health Monitoring Requirements

### Check System Health

Before expensive operations, check system health:

```typescript
import { dbService } from '@/lib/db';

// Check database health
const health = await dbService.healthCheck();
if (health.status !== 'healthy') {
  throw new AppError(
    'Database is not healthy',
    ErrorCode.SERVICE_UNAVAILABLE,
    503
  );
}
```

### Monitor Circuit Breakers

Check circuit breaker states before operations:

```typescript
import { resilienceManager } from '@/lib/resilience';

const states = resilienceManager.getCircuitBreakerStates();
const openBreakers = Object.values(states).filter((s) => s.state === 'open');

if (openBreakers.length > 2) {
  throw new AppError(
    'Multiple circuit breakers open',
    ErrorCode.SERVICE_UNAVAILABLE,
    503
  );
}
```

### Log Agent Actions

All agent actions must be logged:

```typescript
await this.logAgentAction('agent-name', 'action-name', {
  ideaId: ideaId,
  operation: 'operation-name',
  metadata: {
    /* additional data */
  },
});
```

---

## Testing Requirements

### Unit Tests

All new code must include unit tests:

```typescript
describe('ClarifierAgent', () => {
  it('should start clarification session', async () => {
    const agent = new ClarifierAgent();
    const result = await agent.startClarification(ideaId, ideaText);
    expect(result.success).toBe(true);
  });

  it('should validate idea text', () => {
    const result = validateIdea('short');
    expect(result.valid).toBe(false);
  });
});
```

### Integration Tests

Test integrations with external services:

```typescript
describe('Clarifier Integration', () => {
  it('should integrate with AI service', async () => {
    const response = await fetch('/api/clarify/start', {
      method: 'POST',
      body: JSON.stringify({ ideaId, ideaText }),
    });
    expect(response.ok).toBe(true);
  });
});
```

### Test Coverage

- Target: > 90% code coverage for core components
- All critical paths must be tested
- Error handling must have tests
- Edge cases must be covered

---

## Cost Guardrails

### Monitor AI Costs

Agents must track and limit AI usage:

```typescript
import { aiService } from '@/lib/ai';

// Before calling AI
const costLimit = parseFloat(process.env.COST_LIMIT_DAILY || '10.0');
const currentCost = await aiService.getTodayCost();

if (currentCost >= costLimit) {
  throw new AppError(
    'Daily cost limit exceeded',
    ErrorCode.RATE_LIMIT_EXCEEDED,
    429
  );
}
```

### Use Context Windowing

Optimize token usage with context windowing:

```typescript
const context: ContextWindow = {
  shortTerm: recentMessages,
  longTermSummary: summary,
  maxTokens: 4000,
};

const result = await aiService.callModelWithContext(messages, config, context);
```

### Prefer Efficient Models

Use the most cost-effective model for the task:

```typescript
const config: AIModelConfig = {
  provider: 'openai',
  model: 'gpt-3.5-turbo', // Not gpt-4 unless necessary
  maxTokens: 1000,
  temperature: 0.7,
};
```

---

## Security Requirements

### Never Commit Secrets

- Use GitHub Actions secrets
- Use environment variables
- Use Supabase secrets
- Never write API keys in code

### Input Sanitization

All user inputs must be sanitized:

```typescript
import { redactPII } from '@/lib/pii-redaction';
import { validateIdea } from '@/lib/validation';

// Validate and redact
const validation = validateIdea(userInput);
if (!validation.valid) {
  throw new ValidationError(validation.errors);
}

const safeInput = redactPII(userInput);
```

### SQL Injection Prevention

Use parameterized queries:

```typescript
// Good - parameterized
const { data, error } = await supabase
  .from('ideas')
  .select('*')
  .eq('id', ideaId);

// Bad - string concatenation
const query = `SELECT * FROM ideas WHERE id = '${ideaId}'`;
```

### XSS Prevention

Sanitize output in frontend:

```typescript
import DOMPurify from 'dompurify';

const safeHTML = DOMPurify.sanitize(userContent);
```

---

## Documentation Requirements

### Update Documentation

Agents must update relevant documentation when making changes:

- API changes → Update `docs/api.md`
- Architecture changes → Update `docs/architecture.md`
- New error codes → Update `docs/error-codes.md`
- Health monitoring changes → Update `docs/health-monitoring.md`
- Agent behavior changes → Update `docs/agent-guidelines.md`

### Code Comments

Add comments for complex logic:

```typescript
// Circuit breaker pattern to prevent cascading failures
// When service fails 5 consecutive times, open circuit for 60s
// See docs/integration-hardening.md for details
const result = await resilienceManager.execute(...);
```

---

## Rollback Requirements

### Document Rollback Plan

Every change must include a rollback plan:

```markdown
## Rollback Plan

If this change causes issues:

1. Revert commit: `git revert <commit-hash>`
2. Redeploy: `vercel --prod`
3. Monitor health: `/api/health/detailed`
4. If database changes: Run rollback migration
```

### Database Rollback

For schema changes, provide rollback migration:

```sql
-- Migration: 002_add_user_settings.sql

-- Rollback: 002_rollback_user_settings.sql
DROP TABLE IF EXISTS user_settings;
```

### Feature Flags

Use feature flags for risky changes:

```typescript
const newFeatureEnabled = process.env.FEATURE_NEW_ALGORITHM === 'true';

if (newFeatureEnabled) {
  // New implementation
} else {
  // Old implementation (fallback)
}
```

---

## Development Process

1. **Read agent-policy.md** before any action
2. **Create feature branch** with proper naming
3. **Implement changes** following all guidelines
4. **Add tests** for new functionality
5. **Update documentation** as needed
6. **Run lint and typecheck**: `npm run lint && npm run type-check`
7. **Run tests**: `npm test`
8. **Create PR** with machine-readable template
9. **Monitor CI** for build and test results
10. **Address review comments**
11. **Merge after approval**

---

## Prohibited Actions

❌ **Direct commits to main**
❌ **Committing secrets or API keys**
❌ **Bypassing rate limiting**
❌ **Calling external APIs without resilience**
❌ **Skipping validation**
❌ **Not logging errors with request IDs**
❌ **Not updating documentation**
❌ **Destructive DB ops without rollback plan**
❌ **Ignoring test failures**
❌ **Merging without approval** (except trivial changes)

---

## Success Criteria

- [ ] All code follows guidelines
- [ ] All tests pass
- [ ] All documentation updated
- [ ] Error handling implemented
- [ ] Resilience patterns used
- [ ] Rollback plan documented
- [ ] Security best practices followed
- [ ] PII protected
- [ ] Health check passes
- [ ] PR approved and merged

---

## Reference Documentation

- [API Reference](./api.md)
- [Architecture](./architecture.md)
- [Error Codes](./error-codes.md)
- [Health Monitoring](./health-monitoring.md)
- [Integration Hardening](./integration-hardening.md)
- [Security Headers](./security-headers.md)
