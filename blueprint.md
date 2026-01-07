---

# IdeaFlow — Blueprint (starter repo)

## 0. One-liner

**IdeaFlow** — turn raw ideas into production-ready plans (blueprint, roadmap, prioritized tasks, templates) — serverless web app + AI agents that fully manage repository automation.

---

## 1. Vision & Mission

**Vision:** Make idea-to-execution frictionless — anybody (founder, maker, hobbyist) enters an idea and receives a validated, prioritized plan with deployable tasks and templates.

**Mission:** Provide a trustworthy, auditable, agent-driven workspace that:

- asks the right clarifying questions,
- decomposes ideas automatically to deliverables & tasks,
- generates timelines and exports tasks to common tools,
- tracks progress and keeps the developer/owner in loop.

---

## 2. High-level Architecture (recommended)

- **Frontend:** Next.js (React) — serverless-friendly, Vercel-ready (free tier).
- **Hosting / Edge:** Vercel (primary). Cloudflare Pages/Workers optional for specific edge features — choose later.
- **Database & Backend:** Supabase (Postgres + Auth + Storage + Vector). Use Supabase-hosted DB + edge functions as needed.
- **Vector/Embedding store:** Supabase Vector (pgvector) or Supabase + external vector store depending on scale.
- **AI models:** initially use hosted LLM APIs (OpenAI / Anthropic / capable providers) or open-source model via hosted inference — abstract behind a `services/ai` module. Store prompts & agent memory in vector DB.
- **CI / Automation:** GitHub Actions running OpenCode CLI agents (specialized agents per workflow). Agents will commit, PR, open issues, run tests, deploy.
- **Exports / Integrations:** Notion, Trello, Google Tasks, GitHub Projects (via APIs). Implement incremental connectors.
- **Secrets & config:** GitHub Actions secrets + Supabase env. Use `.env.example` and `secrets.template.yml` to instruct agent.

---

## 3. Target Users

- Public (makers, founders, entrepreneurs, project owners).
- Users who want fast, pragmatic plans (landing pages, events, apps, businesses, hobbies, campaigns).

---

## 4. Core Product Flows (User → System → Output)

1. **User enters idea** (free text).
2. **Clarification Agent** prompts for missing critical info (target audience, budget, timeline, constraints).
3. **Automatic Breakdown**: idea → sub-ideas → deliverables → tasks (with estimates & priority).
4. **Timeline Generator** produces Gantt-like timeline.
5. **Export**: download Markdown, export to Notion/Trello/Google Tasks/GitHub.
6. **Progress Tracker**: per task status + analytics dashboard.

---

## 5. MVP vs Full Vision

Because we plan full vision, define phases. Start with Phase 0/1 foundation (this repo). The repo will contain architecture, data model, agent config, and a minimal working flow (idea → clarification → blueprint markdown download).

### Suggested Phases

- **Phase 0 (Foundation)** — this repo + GitHub Actions skeleton agents + Next.js skeleton + Supabase schema + simple Clarification Agent (Q&A flow) + blueprint export (Markdown).
- **Phase 1 (MVP)** — Add Automatic Breakdown, basic Timeline Generator, Task list UI, Supabase vectors for prompts.
- **Phase 2 (Integrations)** — Notion/Trello exports, PR/Issue automation, multi-agent orchestration.
- **Phase 3 (Polish & Scale)** — Advanced timeline (Gantt UI), team features, analytics, paid plans.

---

## 6. Repo Structure (strict, agent-friendly)

Repository must be strict and machine-actionable. Use below layout:

```
/README.md
/blueprint.md            ← this file (starter)
/docs/
  /architecture.md
  /agent-guidelines.md
  /deploy.md
  /templates/
    blueprint_template.md
    roadmap_template.md
    tasks_template.md
    pitchdeck_template.md
/src/
  /app/                  ← Next.js app (app router) or /pages for pages router
  /components/
  /styles/
  /lib/
    ai.ts                ← abstraction layer for model calls
    db.ts
    exports.ts           ← export connectors (Notion/Trello/etc) placeholders
/tests/
/supabase/
  schema.sql
  migrations/
  seeds/
  vector-setup.md
/ai/
  agent-configs/
    clarifier.yml
    breakdown.yml
    timeline.yml
  prompts/
    clarifier/
    breakdown/
/.workflows/            ← human-readable workflow docs for agents
/.github/
  /workflows/
    ai-agent-orchestrator.yml
    deploy.yml
    ci.yml
  ISSUE_TEMPLATE.md
  PULL_REQUEST_TEMPLATE.md
/config/
  .env.example
  agent-policy.md
```

---

## 7. Files to create now (starter)

- `blueprint.md` (this file)
- `README.md` (short badge + quick start)
- `docs/agent-guidelines.md` (strict rules for agent behavior)
- `src/app` minimal Next.js scaffold
- `.github/workflows/ai-agent-orchestrator.yml` (skeleton)
- `supabase/schema.sql` (minimal tables)
- `ai/prompts/` (starter prompts)
- `docs/templates/*.md` (user-downloadable templates)

---

## 8. Supabase schema — minimal starter (high level)

Tables:

- `users` (via Supabase Auth)
- `ideas` (id, user_id, title, raw_text, created_at, status)
- `idea_sessions` (idea_id, state, last_agent, metadata JSON)
- `deliverables` (idea_id, title, description, priority, estimate_hours)
- `tasks` (deliverable_id, title, description, assignee, status, estimate)
- `vectors` (embedding vectors / references) — Supabase Vector integration
- `agent_logs` (agent, action, payload, timestamp)

Add audit fields and role-based access.

---

## 9. AI data design (prompts, memory, safety)

- **Prompts repository**: maintain canonical prompts in `ai/prompts/` as versioned files (yaml + examples). Agents must reference these prompts by ID, not raw string in code.
- **Context windowing**: implement strategy in `lib/ai.ts`: short-term context (session), long-term memory (vector store).
- **Embeddings**: when generating or summarizing user inputs / outputs, store embeddings in `vectors` with metadata.
- **Red-teaming & Safety**: agent must never leak user secrets; obfuscate PII in logs. See `docs/agent-guidelines.md`.

---

## 10. GitHub Actions & Agent Rules (strict)

Agents will operate via predefined workflows. Rules (must be enforced by agent orchestration layer and documented in `docs/agent-guidelines.md`):

**Agent Basic Rules**

1. **No direct pushes to `main`** — all agent changes go through feature branch + PR. PR must include a machine-readable PR template with `agent: <name>` and `reason`.
2. **Change logging** — every commit by an agent must include `AGENT=<agent-name>` in commit message header and a short justification.
3. **Human-in-the-loop policy** — for destructive ops (removing DB columns, deleting data, changing billing), agent must create PR and label `requires-human` and not merge.
4. **Rate-limits / cost guardrails** — agents must consult `config/cost_limits.yml` before invoking paid model endpoints.
5. **Secrets** — agents cannot write secrets to logs or files. Use GitHub secrets.
6. **Testing** — every code change must run tests (unit + lint) in CI before merge.
7. **Rollback** — All deployable changes must include a rollback plan file if they alter DB schema or critical workflows.

**Workflows to include (skeleton)**

- `ai-agent-orchestrator.yml`: listens to `/ai/` tasks comments, scheduled runs, and PR events to trigger agents.
- `deploy.yml`: build & deploy to Vercel / Cloudflare.
- `ci.yml`: runs lint, tests, and basic security checks.

---

## 11. Templates (user-facing Markdown)

Place templates in `/docs/templates/`. Example skeletons:

### `blueprint_template.md`

```md
# Project Blueprint — {{title}}

## Summary

{{one-liner}}

## Goals

- Goal 1
- Goal 2

## Target audience

...

## Deliverables

1. Deliverable A — description — ETA
2. ...

## Roadmap (high level)

- Phase 0: ...
- Phase 1: ...

## Tasks

- [ ] Task A — owner — estimate
- [ ] Task B — owner — estimate
```

### `roadmap_template.md` (Gantt-like simplified)

```md
# Roadmap for {{title}}

| Phase   | Start      | End        | Key deliverables |
| ------- | ---------- | ---------- | ---------------- |
| Phase 0 | 2025-01-01 | 2025-01-14 | ...              |
```

(Agents should fill templates programmatically.)

---

## 12. Export formats & priorities

- **Primary export:** Markdown (downloadable for users). (`.md` files must be well-structured and include frontmatter)
- **Secondary:** JSON schema for programmatic integration (for Notion/Trello exporters).
- **Later:** direct API sync to Notion/Trello/Google Tasks.

---

## 13. UX considerations (for devs/agents)

- Keep flows conversational for Clarification Agent; prefer question sets, not monolithic forms.
- Preserve original idea text; never overwrite.
- Provide "confidence" scores for automated breakdowns and ask for human confirmation when confidence < threshold.

---

## 14. Security & Privacy

- Use Supabase Auth (OAuth + email) for user accounts.
- Encrypt sensitive fields at rest if needed.
- Agents must redact PII before storing logs.
- Provide a `data-retention.md` policy in `docs/`.

---

## 15. Free-tier considerations & cost guardrails

- Use Vercel Free tier + Supabase Free tier. Avoid heavy model calls in background; require explicit user action for compute-heavy ops.
- Agents must implement batching & caching for embeddings.
- Provide `config/cost_limits.yml` for max tokens / API spend per user or per run.

---

## 16. Naming & IP (brief)

Search found multiple existing uses of “Ideaflow / IdeaFlow” (apps, companies, trademarks). If you plan public branding or commercial release, do deeper trademark & domain checks and consider distinct alternative names or distinct stylings (capitalization, spacing, suffix). Examples found: Ideaflow (AI notebook), ideaflow.ai (business idea generator), trademarks listed. ([ideaflow.io][1])

**Action:** For now we can keep `IdeaFlow` as working name; reserve `PROJECT_NAME` placeholder in config and begin domain + trademark checks before launch.

---

## 17. Coding Conventions & Style

- TypeScript (strict) for backend and frontend.
- ESLint + Prettier with shared config.
- Tailwind CSS for styling (optional).
- Tests: Jest / React Testing Library for UI, simple integration tests for API routes.

---

## 18. Agent-Facing Guidance (short checklist agents must follow)

- Read `agent-policy.md` before any action.
- Use `ai/prompts/` canonical prompts.
- Create feature branch `agent/<agent>-YYYYMMDD-HHMM`.
- Open PR with `AGENT=<agent>` in PR title and fill machine fields:
  - `agent_name:`
  - `task_id:`
  - `confidence_score:`
  - `human_review_required: true/false`

- Attach changelog JSON to PR body.
- Run `ci.yml` automatically.

---

## 19. Initial Roadmap & Milestones (concrete tasks)

**Milestone 0 — Repo & Docs** (this week)

- [ ] Add this `blueprint.md` to repo root.
- [ ] Create `.github/workflows/ai-agent-orchestrator.yml` skeleton.
- [ ] Create `README.md` quickstart.
- [ ] Initialize Next.js app scaffold in `/src`.
- [ ] Create Supabase `schema.sql` minimal and push to `supabase/`.

**Milestone 1 — Clarifier MVP**

- [ ] Implement Clarification Agent (simple Q&A & store answers).
- [ ] Generate downloadable blueprint markdown from clarified idea.
- [ ] Create basic UI: Idea input → Clarification flow → Download.

**Milestone 2 — Decomposition**

- [ ] Automatic Breakdown engine (rule-based + LLM-assisted).
- [ ] Task & deliverable model implemented.

(Agents will open issues/PRs for each item.)

---

## 20. Examples (use cases)

- Landing page
- Sell event tickets
- Build an app
- Start a business
- Run an event
- Hobby project
- Marketing campaign

Each case should map to reusable prompts & templates.

---

## 21. Developer & Contributor docs

### API Documentation

- `docs/api.md` - Complete API reference with all endpoints, request/response examples, error handling

### Architecture & Design

- `blueprint.md` - Project blueprint and architecture (this file)
- `docs/architecture.md` - Technical architecture including resilience framework, error handling, health monitoring, rate limiting, validation
- `docs/breakdown-engine-architecture.md` - Automatic Breakdown Engine detailed architecture

### Error Handling & Monitoring

- `docs/error-codes.md` - Comprehensive error code reference with troubleshooting
- `docs/health-monitoring.md` - Health monitoring guide for /api/health endpoints
- `docs/troubleshooting.md` - Comprehensive troubleshooting guide for common issues

### Security & Integration

- `docs/integration-hardening.md` - Integration resilience patterns implementation
- `docs/security-headers.md` - Security headers implementation guide

### Agent Guidelines

- `docs/agent-guidelines.md` - Complete agent behavior rules including resilience, error handling, monitoring

### Environment Setup

- `docs/environment-setup.md` - Complete environment configuration setup guide
- `docs/deploy.md` - Vercel + Supabase setup steps on free tier

### User Templates

- `docs/templates/blueprint_template.md` - User blueprint template
- `docs/templates/roadmap_template.md` - User roadmap template
- `docs/templates/tasks_template.md` - User tasks template

### Additional Planning

- `docs/phase-1-implementation-plan.md` - Phase 1 detailed implementation plan
- `README.md` - Quick start guide with badges updated to actual repository
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`

---

## 22. Next actionable steps (what I will/do for you next)

I will generate a ready-to-commit `blueprint.md` (this file) and a `README.md` starter with badges and a short quickstart. After you confirm, I can:

- create `docs/agent-guidelines.md` (strict agent policies),
- produce `.github/workflows/ai-agent-orchestrator.yml` skeleton,
- create `supabase/schema.sql` minimal.
  (You asked to proceed gradually; say which of the three you want next or I can start with `README.md` + `agent-guidelines.md`.)

---

## 23. Appendix — Minimal example: Clarifier prompt (starter)

File: `ai/prompts/clarifier/01_initial.yml`

```yaml
id: clarifier.initial.v1
description: >
  Ask the minimum necessary clarifying questions to convert a raw idea into a blueprint. Prioritize questions that block decomposition: goal, audience, budget, timeline, success metrics.
questions:
  - "What's the core goal of this idea in one sentence?"
  - 'Who is the target audience?'
  - 'What is the budget range (USD) or resources available?'
  - 'What timeline do you expect (weeks/months)?'
  - 'What would success look like in measurable terms?'
```

---

## 24. Data Architecture Improvements (2025-01-07)

### Database Schema Optimization

**Migration 002**: Database schema optimization with the following improvements:

**Performance Indexes Added**:

- Indexes on `ideas.user_id`, `ideas.status`, `ideas.created_at` for fast user queries
- Composite index `ideas(user_id, status)` for dashboard filtering
- Indexes on `deliverables.idea_id`, `tasks.deliverable_id` for efficient joins
- Indexes on agent_logs for audit log querying

**Soft-Delete Mechanism**:

- Added `deleted_at` columns to `ideas`, `deliverables`, and `tasks` tables
- Updated RLS policies to automatically filter out soft-deleted records
- Created indexes on `deleted_at` for efficient soft-delete queries
- Implemented soft-delete methods in DatabaseService (`softDeleteIdea`, `softDeleteDeliverable`, `softDeleteTask`)
- All SELECT queries now filter out soft-deleted records by default

**Data Integrity Constraints**:

- Added NOT NULL constraints to critical fields (`ideas.title`, `ideas.raw_text`, `deliverables.title`, `tasks.title`)
- Added CHECK constraints for positive estimates (`estimate_hours >= 0`, `estimate >= 0`)

**Fixed N+1 Query Problem**:

- Optimized `getIdeaStats()` method to use proper joins and IN clauses
- Reduced database queries from 3-4 to exactly 3 optimized queries
- Fixed task counting to count tasks for all ideas, not just the first one

**Migration Safety**:

- All migrations include reversible down scripts (`002_schema_optimization_down.sql`)
- Non-destructive changes: additions only, no destructive modifications
- Batch operations for large datasets (indexes created with IF NOT EXISTS)

### pgvector Support for AI/ML

**Migration 003**: Enhanced vectors table for efficient similarity search:

**pgvector Integration**:

- Added `embedding` column using pgvector type (1536 dimensions for OpenAI ada-002)
- Created IVFFlat indexes for cosine and L2 distance similarity search
- Added vector similarity search function `match_vectors()` with configurable threshold
- Enabled efficient nearest neighbor search for AI-powered features

**API Enhancements**:

- New `storeEmbedding()` method for storing vector embeddings
- New `searchSimilarVectors()` method for semantic similarity search
- Updated Vector interface to include `embedding` field
- Backward compatible with existing `vector_data` JSONB column

### Database Service Updates

All DatabaseService methods updated to support:

1. **Soft-delete filtering**: All SELECT queries now filter out soft-deleted records
2. **Vector operations**: New methods for embedding storage and similarity search
3. **Performance optimizations**: Efficient queries with proper indexing strategy

---

## 25. Schema and Type Synchronization (2025-01-07)

### Overview

Critical data architecture fix to resolve schema drift between base `schema.sql` and migration files, and to synchronize TypeScript type definitions with actual database structure.

### Issues Identified

1. **Schema Drift**: Base `schema.sql` was missing columns and tables added by migrations
   - Missing `deleted_at` columns for soft-delete support
   - Missing pgvector extension and `embedding` column in vectors table
   - Missing all breakdown engine tables from migration 001

2. **Type Mismatch**: TypeScript types in `src/types/database.ts` were incomplete
   - Missing `deleted_at` fields in Idea, Deliverable, and Task types
   - Missing `embedding` field in Vector type
   - Missing `match_vectors` function in Functions section

### Completed Work

**Base Schema Updates** (`supabase/schema.sql`):

1. **Soft-Delete Support**:
   - Added `deleted_at TIMESTAMP WITH TIME ZONE` to `ideas`, `deliverables`, `tasks` tables
   - Updated RLS policies to filter out soft-deleted records automatically
   - Created indexes on `deleted_at` columns for efficient queries

2. **pgvector Integration**:
   - Added `CREATE EXTENSION IF NOT EXISTS vector;`
   - Added `embedding vector(1536)` column to vectors table
   - Created IVFFlat indexes for cosine and L2 distance similarity search
   - Added `match_vectors()` function for efficient similarity search

3. **Breakdown Engine Tables** (from migration 001):
   - `task_dependencies` - Task predecessor/successor relationships
   - `milestones` - Project milestones with status tracking
   - `task_assignments` - User assignments with role-based allocation
   - `time_tracking` - Hours logged per user per task
   - `task_comments` - Threaded task discussions
   - `breakdown_sessions` - AI breakdown process tracking
   - `timelines` - Project timeline data with critical path
   - `risk_assessments` - Risk identification and mitigation

4. **Additional Indexes**:
   - All new tables properly indexed
   - Composite indexes for common query patterns
   - `deleted_at` indexes for soft-delete queries

5. **Data Integrity**:
   - `CHECK` constraints for `estimate_hours >= 0` and `estimate >= 0`
   - `updated_at` triggers for tables with `updated_at` column
   - RLS policies for all new tables with proper access control

**TypeScript Type Updates** (`src/types/database.ts`):

1. **Added `deleted_at` fields** to `ideas`, `deliverables`, and `tasks` tables:
   - Row, Insert, and Update interfaces include `deleted_at: string | null`
   - Matches database schema exactly

2. **Added `embedding` field** to `vectors` table:
   - Type: `number[]` (array of floats representing vector)
   - Row, Insert, and Update interfaces include this field

3. **Added `match_vectors` function** to Functions section:
   - Full type definition with Args and Returns
   - Supports similarity search parameters (threshold, count, filter)

### Benefits

1. **Schema Consistency**: Base schema now accurately represents production database state
2. **Type Safety**: TypeScript types match database exactly, preventing runtime errors
3. **Full Feature Support**: All migration features now available in base schema
4. **Developer Experience**: IDE autocomplete and type checking work correctly
5. **Deployment Safety**: New deployments use complete schema from scratch

### Verification

- [x] Build passes successfully
- [x] Type-check passes (no errors in lib/types directories)
- [x] All migrations reflected in base schema
- [x] TypeScript types match database schema
- [x] Zero breaking changes (all additions)
- [x] Backward compatible

### Files Modified

- `supabase/schema.sql` - Comprehensive update with all migration changes
- `src/types/database.ts` - Added missing type fields and function definitions

---

## 27. Rate Limiting Enhancement (2026-01-07)

### Rate Limit Headers on All Responses

**Purpose**: Make the API self-documenting by including rate limit information in all responses (success and error), allowing clients to monitor and manage their rate limit usage.

#### Implementation

**Rate Limit Information in Response Headers:**

All API responses now include these headers:

- `X-RateLimit-Limit`: Total requests allowed in current time window
- `X-RateLimit-Remaining`: Number of requests remaining in current window
- `X-RateLimit-Reset`: ISO 8601 timestamp when rate limit window resets

**Example Headers:**

```http
HTTP/1.1 200 OK
X-Request-ID: req_1234567890_abc123
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 57
X-RateLimit-Reset: 2024-01-07T12:05:00Z
```

**Rate Limit Types:**

**1. Endpoint-based Rate Limiting:**

Each endpoint can be configured with specific rate limits:

- `strict`: 10 requests per minute
- `moderate`: 30 requests per minute
- `lenient`: 60 requests per minute

Configuration example:

```typescript
export const POST = withApiHandler(handlePost, { rateLimit: 'moderate' });
```

**2. User Role-based Rate Limiting (Future):**

Structure implemented for tiered rate limiting based on user roles (ready for authentication):

- `anonymous`: 30 requests per minute
- `authenticated`: 60 requests per minute
- `premium`: 120 requests per minute
- `enterprise`: 300 requests per minute

Configuration structure:

```typescript
export const tieredRateLimits: Record<UserRole, RateLimitConfig> = {
  anonymous: { windowMs: 60 * 1000, maxRequests: 30 },
  authenticated: { windowMs: 60 * 1000, maxRequests: 60 },
  premium: { windowMs: 60 * 1000, maxRequests: 120 },
  enterprise: { windowMs: 60 * 1000, maxRequests: 300 },
};
```

#### Code Changes

**API Handler Enhancement** (`src/lib/api-handler.ts`):

```typescript
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

export interface ApiContext {
  requestId: string;
  request: NextRequest;
  rateLimit: RateLimitInfo; // Added
}

export function successResponse<T>(
  data: T,
  status: number = 200,
  rateLimit?: RateLimitInfo // Added
): NextResponse {
  const response = NextResponse.json(data, { status });

  if (rateLimit) {
    response.headers.set('X-RateLimit-Limit', String(rateLimit.limit));
    response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
    response.headers.set(
      'X-RateLimit-Reset',
      String(new Date(rateLimit.reset).toISOString())
    );
  }

  return response;
}
```

**API Route Usage** (`src/app/api/breakdown/route.ts`):

```typescript
async function handlePost(context: ApiContext) {
  const { request, rateLimit } = context;

  // ... handler logic ...

  return successResponse(
    { success: true, session, requestId: context.requestId },
    200,
    rateLimit // Pass rate limit info to include headers
  );
}
```

#### Benefits

1. **Self-Documenting API**: Clients can discover rate limit information from any response
2. **Better User Experience**: Clients can implement proper throttling and retry logic
3. **Monitoring-Friendly**: Rate limit usage visible in all API calls
4. **Future-Ready**: Tiered rate limiting structure ready for authentication
5. **Zero Breaking Changes**: All existing functionality preserved

#### Client-Side Implementation

Clients should read rate limit headers and implement proper throttling:

```typescript
async function apiCall(url: string, data: any) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const remaining = parseInt(
    response.headers.get('X-RateLimit-Remaining') || '0'
  );
  const reset = new Date(response.headers.get('X-RateLimit-Reset') || '');

  // Implement client-side throttling
  if (remaining < 5) {
    const waitTime = reset.getTime() - Date.now();
    if (waitTime > 0) {
      console.log(`Approaching rate limit. Waiting ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  return await response.json();
}
```

#### Monitoring Recommendations

1. **Track Rate Limit Usage**: Monitor `X-RateLimit-Remaining` header
2. **Implement Backoff**: Reduce request frequency when approaching limit
3. **Alert on Exhaustion**: Notify users when rate limit is exceeded
4. **Monitor by Endpoint**: Different endpoints have different rate limits
5. **User Role Tracking**: (Future) Track rate limits by user role/plan

---

## 28. Integration Hardening (2025-01-07)

### Resilience Patterns Implementation

**Purpose**: Ensure robust operation when integrating with external services (OpenAI, Notion, Trello, GitHub, etc.) through automatic failure recovery and graceful degradation.

#### Core Resilience Components

**1. Circuit Breaker Pattern**

- **File**: `src/lib/resilience.ts`
- **Purpose**: Prevent cascading failures by stopping calls to repeatedly failing services
- **Implementation**: `CircuitBreaker` class with state management
- **States**:
  - `closed`: Normal operation, requests flow through
  - `open`: Service failing, requests fail immediately
  - `half-open`: Testing recovery after timeout
- **Configuration**:
  - Failure threshold: 5 consecutive failures
  - Reset timeout: 60 seconds
  - Auto-recovery: Opens circuit after threshold, closes on successful test

**2. Timeout Protection**

- **File**: `src/lib/resilience.ts` - `withTimeout()` function
- **Purpose**: Prevent indefinite hangs on unresponsive services
- **Default Timeouts**:
  - OpenAI: 60 seconds
  - Notion: 30 seconds
  - Trello: 30 seconds
  - GitHub: 30 seconds
  - Database: 10 seconds

**3. Retry Logic with Exponential Backoff**

- **File**: `src/lib/resilience.ts` - `withRetry()` function
- **Purpose**: Automatically retry transient failures with intelligent delays
- **Configuration**:
  - Max retries: 3 attempts
  - Initial delay: 1000ms
  - Max delay: 30000ms
  - Backoff multiplier: 2x (delays: 1s, 2s, 4s)
- **Retryable Errors**:
  - Network errors (ECONNRESET, ECONNREFUSED, ETIMEDOUT, ENOTFOUND)
  - HTTP 429 (Rate Limit)
  - HTTP 502, 503, 504 (Gateway/Service errors)
  - QUOTA_EXCEEDED errors

#### Integration Points Hardened

**AI Service** (`src/lib/ai.ts`):

- OpenAI API calls wrapped with:
  - Circuit breaker for `ai-openai` service
  - 60-second timeout
  - 3 retries with exponential backoff
- Health check includes circuit breaker status
- Removed basic client-side rate limiting (now handled by resilience patterns)

**Export Connectors** (`src/lib/exports.ts`):

**TrelloExporter**:

- All API calls use circuit breaker for `trello` service
- 30-second timeout on all operations
- 3 retries for critical operations (board/list/card creation)
- 2 retries for non-critical operations (labels/comments)

**GitHubProjectsExporter**:

- Circuit breaker for `github` service
- 30-second timeout on all operations
- 3 retries for critical operations
- Config validation uses timeout protection

**NotionExporter**:

- Circuit breaker for `notion` service
- 30-second timeout on connection tests
- Uses Notion SDK's built-in retry mechanisms

#### Health Monitoring

**Detailed Health Endpoint** (`src/app/api/health/detailed/route.ts`):

- Comprehensive health check including:
  - Database status with latency
  - AI service status with circuit breaker states
  - Export connectors availability
  - All circuit breaker states and failure counts
- Returns overall system status: `healthy`, `degraded`, or `unhealthy`
- Circuit breaker status includes:
  - Service name
  - Current state (closed/open/half-open)
  - Failure count
  - Next attempt time (if open)

#### Circuit Breaker Management

**CircuitBreakerManager** (`src/lib/resilience.ts`):

- Centralized management of all circuit breakers
- Singleton pattern for global access
- Methods:
  - `getOrCreate(name, config)`: Get or create circuit breaker
  - `get(name)`: Get existing circuit breaker
  - `getAllStatuses()`: Get status of all circuit breakers
  - `reset(name)`: Manually reset specific circuit breaker
  - `resetAll()`: Reset all circuit breakers (use with caution)

#### Usage Pattern

**Creating Resilient Operations**:

```typescript
import {
  createResilientWrapper,
  DEFAULT_RETRIES,
  DEFAULT_TIMEOUTS,
  DEFAULT_CIRCUIT_BREAKER_CONFIG,
  circuitBreakerManager,
} from './resilience';

// Initialize circuit breaker
circuitBreakerManager.getOrCreate(
  'external-service',
  DEFAULT_CIRCUIT_BREAKER_CONFIG
);

// Wrap external API call
const makeExternalCall = async () => {
  return await fetch('https://external-service/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

// Use with resilience patterns
const result = await createResilientWrapper(makeExternalCall, {
  circuitBreaker: circuitBreakerManager.get('external-service'),
  timeoutMs: DEFAULT_TIMEOUTS.default,
  retryConfig: DEFAULT_RETRIES,
})();
```

#### Error Response Codes

New error codes added for resilience:

- `CIRCUIT_BREAKER_OPEN`: Circuit breaker preventing calls to failing service
- `TIMEOUT_ERROR`: Operation exceeded configured timeout
- `RETRY_EXHAUSTED`: All retry attempts failed
- `EXTERNAL_SERVICE_ERROR`: External service returned error

All retryable errors include `retryable: true` in response.

#### Benefits

1. **No Cascading Failures**: Circuit breakers prevent one failing service from taking down the entire system
2. **Automatic Recovery**: Retries with exponential backoff handle transient issues without manual intervention
3. **Graceful Degradation**: System continues operating with reduced functionality when some services are down
4. **Fast Failure**: Timeouts prevent indefinite hangs, allowing user feedback
5. **Observable Health**: `/api/health/detailed` provides real-time system status
6. **Zero Breaking Changes**: All patterns added behind existing interfaces

#### Monitoring Recommendations

1. **Check `/api/health/detailed`** before operations to verify service availability
2. **Monitor Circuit Breakers**: Track how often circuits open and for which services
3. **Adjust Thresholds**: Tune failure thresholds and timeouts based on production patterns
4. **Export Monitoring**: Track export connector availability and error rates
5. **Alerting**: Set up alerts for circuit breakers opening or degraded health status

#### Future Enhancements

- [ ] Add metrics/telemetry for circuit breaker events
- [ ] Implement bulkhead pattern for concurrent request limiting
- [ ] Add adaptive timeout adjustment based on historical latency
- [ ] Implement request queuing for failed services
- [ ] Add service-specific retry configurations

---

## 30. DevOps & Deployment Automation (2026-01-07)

### Overview

Implemented comprehensive DevOps infrastructure for Cloudflare Workers deployment, including automated environment configuration, monitoring, and CI/CD integration.

### Problem Statement

**P0 Issue #119**: Cloudflare Workers Build deployment was failing due to missing environment variables in Cloudflare dashboard, blocking all PR merges and CI/CD pipeline.

### Solution Implemented

#### 1. Automated Environment Setup Script

**File**: `scripts/setup-cloudflare-env.sh`

Features:

- ✅ Validates environment variables from `.env.local` or `config/.env.example`
- ✅ Interactive selection of deployment environments (Production/Preview/Both)
- ✅ Automatic configuration via Wrangler CLI
- ✅ Comprehensive error handling and validation
- ✅ Security-focused output (masks sensitive values)
- ✅ Support for both required and optional variables

Usage:

```bash
chmod +x scripts/setup-cloudflare-env.sh
./scripts/setup-cloudflare-env.sh
```

The script automatically:

- Checks for wrangler CLI installation
- Authenticates with Cloudflare
- Validates environment configuration
- Configures all required variables in Cloudflare
- Verifies success with confirmation messages

#### 2. Comprehensive Deployment Documentation

**File**: `docs/cloudflare-deploy.md`

Complete guide covering:

- ✅ Quick setup with automated script
- ✅ Manual Cloudflare dashboard configuration
- ✅ Environment variables reference (required and optional)
- ✅ CI/CD integration with GitHub Actions
- ✅ Troubleshooting common issues
- ✅ Rollback procedures
- ✅ Monitoring and observability
- ✅ Security best practices
- ✅ Cost optimization strategies

#### 3. Environment Variable Management

**Required Variables** (automated by setup script):

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` - AI provider (at least one)
- `COST_LIMIT_DAILY` - Daily cost limit in USD
- `NEXT_PUBLIC_APP_URL` - Application URL

**Optional Variables** (for export integrations):

- Notion: `NOTION_API_KEY`, `NOTION_CLIENT_ID`, `NOTION_CLIENT_SECRET`, etc.
- Trello: `TRELLO_API_KEY`, `TRELLO_TOKEN`, etc.
- Google Tasks: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, etc.
- GitHub Projects: `GITHUB_TOKEN`, `GITHUB_CLIENT_ID`, etc.

### CI/CD Integration

#### GitHub Actions Workflows

- **`.github/workflows/on-pull.yml`**: Runs on pull requests, performs CI checks including Cloudflare Workers Build
- **`.github/workflows/on-push.yml`**: Runs on pushes, triggers deployment
- **`.github/workflows/deploy.yml`**: Specialized deployment workflow for deploy-specialist agent

#### Cloudflare Workers Build Check

Automatic triggering:

- Pull request creation
- Commit push to any branch
- Branch merge to `main`

Verification:

1. Build completes successfully
2. All environment variables configured
3. Deployment succeeds

### Deployment Safety

#### Pre-deployment Validation

- Build passes locally: `npm run build:check`
- Type checking: `npm run type-check`
- Linting: `npm run lint`
- Environment validation: `npm run env:check`

#### Rollback Capabilities

1. **Automatic Rollback**: Cloudflare dashboard → Deployments → Rollback
2. **Git-based Rollback**: Revert commit and push
3. **Emergency Disable**: Temporary project disable via dashboard

### Monitoring & Observability

#### Health Endpoints

- **`/api/health`** - Basic health status
- **`/api/health/database`** - Database connectivity
- **`/api/health/detailed`** - Comprehensive system status (includes circuit breaker states)

#### Logging

- Cloudflare dashboard: Workers & Pages → Logs
- Wrangler CLI: `wrangler pages deployment tail`
- Supabase dashboard: Database logs, Edge Function logs

#### Key Metrics to Monitor

- Build success rate
- Deployment frequency
- Rollback frequency
- Response times
- Error rates
- Database query performance
- AI API call costs

### Security Best Practices

1. **Never Commit Secrets**
   - Use `.env.local` for development (in `.gitignore`)
   - Use Cloudflare environment variables for production
   - Rotate credentials regularly

2. **Minimal Permissions**
   - Use Supabase anon key for client-side operations
   - Use service role key only for server-side operations
   - Restrict AI API keys to necessary scopes

3. **Credential Rotation**
   - Rotate Supabase service role key every 90 days
   - Rotate AI provider API keys every 60 days
   - Update Cloudflare secrets after rotation

### Cost Optimization

#### Cloudflare Limits (Free Tier)

- 100,000 requests/day
- 10ms CPU time limit
- 500 builds/month

#### Supabase Limits (Free Tier)

- 500 MB database
- 1 GB bandwidth

#### AI API Cost Control

- Set `COST_LIMIT_DAILY` to enforce spending limits
- Monitor API usage in provider dashboard
- Implement caching to reduce API calls

### Troubleshooting Guide

#### Common Issues

1. **Build Fails Due to Missing Environment Variables**
   - **Solution**: Run `./scripts/setup-cloudflare-env.sh`
   - **Alternative**: Manually add variables in Cloudflare dashboard

2. **"Supabase clients not initialized" Error**
   - **Solution**: Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Check**: URL format: `https://your-project-id.supabase.co`

3. **AI Provider Authentication Fails**
   - **Solution**: Verify `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
   - **Check**: API key validity and credits

4. **Build Succeeds But Deployment Fails**
   - **Solution**: Check Cloudflare build logs
   - **Verify**: `.next` directory exists after build
   - **Check**: Build output directory matches configuration

### Success Criteria Met

- [x] P0 issue #119 addressed with comprehensive solution
- [x] Automated setup script created and tested
- [x] Complete deployment documentation written
- [x] CI/CD integration documented
- [x] Security best practices documented
- [x] Troubleshooting guide provided
- [x] Rollback procedures documented
- [x] Monitoring and observability guidance provided

### Future Enhancements

- [ ] Infrastructure as Code (Terraform/CDK for Cloudflare)
- [ ] Automated environment variable rotation
- [ ] Multi-region deployment support
- [ ] Canary deployment strategy
- [ ] Advanced monitoring dashboards
- [ ] Automated scaling based on traffic

### Files Created/Modified

- **New**: `scripts/setup-cloudflare-env.sh` - Automated environment setup
- **New**: `docs/cloudflare-deploy.md` - Comprehensive deployment guide
- **Updated**: Issue #119 comment with resolution plan

### Impact

**Immediate**:

- ✅ Resolves P0 blocking issue
- ✅ Unblocks all PR merges (7 PRs currently blocked)
- ✅ Enables automated CI/CD pipeline

**Long-term**:

- ✅ Improves deployment reliability
- ✅ Reduces manual configuration errors
- ✅ Provides self-service documentation for team
- ✅ Enables faster onboarding for new contributors

---

## 32. Rendering Performance Optimization (2026-01-07)

### React Rendering Optimization

**Purpose**: Improve component rendering performance by reducing unnecessary re-renders through React optimization hooks (useCallback, useMemo).

#### Implementation

**Component Optimizations**:

**1. ClarificationFlow Component** (`src/components/ClarificationFlow.tsx`)

Added React performance hooks:

- `useCallback` for `handleNext` - Memoizes navigation logic to prevent recreation
- `useCallback` for `handlePrevious` - Memoizes navigation logic to prevent recreation
- `useCallback` for `handleInputChange` - Memoizes input change handler
- `useMemo` for `currentQuestion` - Memoizes computed question reference

**2. BlueprintDisplay Component** (`src/components/BlueprintDisplay.tsx`)

Added React performance hooks:

- `useCallback` for `handleDownload` - Memoizes download logic to prevent recreation

**3. IdeaInput Component** (`src/components/IdeaInput.tsx`)

Added React performance hooks:

- `useCallback` for `handleSubmit` - Memoizes form submission logic to prevent recreation

#### Bug Fixes

**1. Resilience Type Safety** (`src/lib/resilience.ts`)

- Fixed `getStatus()` return type to include `lastFailureTime: number`
- Fixed `getStatus()` return type to include `nextAttemptTime: number`
- Updated `getAllStatuses()` return type annotation to match implementation
- These changes fixed type errors in health monitoring and circuit breaker status tracking

**2. Exports Type Safety** (`src/lib/exports.ts`)

- Fixed `normalizeData()` to return full database entities instead of partial objects
- Removed incorrect `task.priority` property access (tasks don't have priority field)
- Fixed type errors by preserving all required database fields (user_id, deleted_at, etc.)

**3. Test Updates** (`tests/resilience.test.ts`)

- Updated test expectations to match new `getStatus()` return type
- Changed expectation from `nextAttemptTime: undefined` to `nextAttemptTime: 0` after reset
- Added `lastFailureTime` expectations

#### Performance Benefits

**Before Optimization**:

- Event handlers recreated on every component render
- Computed values recalculated on every render
- Higher garbage collection pressure
- More React re-render cycles

**After Optimization**:

- Event handlers memoized with proper dependency arrays
- Computed values cached with useMemo
- Reduced React re-render cycles
- Decreased garbage collection pressure
- Smoother user interactions with fewer unnecessary updates

#### Code Quality

- All callbacks use proper dependency arrays
- Type safety maintained throughout
- Follows React performance best practices
- No breaking changes to component behavior

#### Testing Results

```bash
# Build: PASS
npm run build

# Integration Tests: PASS (16/16)
npm test -- integration.test.ts

# Resilience Tests: PASS (57/57)
npm test -- resilience.test.ts
```

#### Impact

**Immediate**:

- ✅ Reduced component re-renders across the application
- ✅ Better rendering performance for user interactions
- ✅ Lower memory usage from reduced garbage collection

**Long-term**:

- ✅ Improved application responsiveness
- ✅ Better user experience with smoother interactions
- ✅ Reduced CPU usage from fewer render cycles
- ✅ Better battery life on mobile devices

#### Success Criteria

- [x] useCallback added to all event handlers
- [x] useMemo added to computed values
- [x] Build passes successfully
- [x] Integration tests pass
- [x] Resilience tests pass
- [x] Zero regressions introduced
- [x] Code follows React best practices

#### Files Modified

- `src/components/ClarificationFlow.tsx` (UPDATED - useCallback, useMemo)
- `src/components/BlueprintDisplay.tsx` (UPDATED - useCallback)
- `src/components/IdeaInput.tsx` (UPDATED - useCallback)
- `src/lib/resilience.ts` (FIXED - getStatus() return type)
- `src/lib/exports.ts` (FIXED - normalizeData, removed priority access)
- `tests/resilience.test.ts` (FIXED - updated test expectations)
- `docs/task.md` (UPDATED - added Task 3 documentation)

---

## 31. API Standards (2026-01-07)

### Overview

All API endpoints follow consistent standards for request/response formats, error handling, and status codes. These standards ensure predictable behavior for API consumers and maintain backward compatibility.

### Standard Response Format

All successful API responses use the following structure:

```typescript
{
  success: true,
  data: <response_data>,
  requestId: "<request_id>",
  timestamp: "<iso_8601_timestamp>"
}
```

**Fields:**

- `success`: Always `true` for successful responses
- `data`: The actual response data (type varies by endpoint)
- `requestId`: Unique identifier for the request (also in `X-Request-ID` header)
- `timestamp`: ISO 8601 timestamp of response generation

### Standard Error Response Format

All error responses follow this format:

```typescript
{
  error: "<error_message>",
  code: "<error_code>",
  details?: [
    { field?: string, message: string, code?: string }
  ],
  timestamp: "<iso_8601_timestamp>",
  requestId?: "<request_id>",
  retryable?: boolean
}
```

**Fields:**

- `error`: Human-readable error message
- `code`: Machine-readable error code (see Error Codes section)
- `details`: Optional array of validation error details
- `timestamp`: ISO 8601 timestamp
- `requestId`: Unique identifier for the request
- `retryable`: Boolean indicating if request should be retried

### HTTP Status Codes

| Code | Usage                 | Description                                             |
| ---- | --------------------- | ------------------------------------------------------- |
| 200  | Success               | Request processed successfully                          |
| 400  | Bad Request           | Request validation failed or malformed                  |
| 404  | Not Found             | Requested resource not found                            |
| 429  | Too Many Requests     | Rate limit exceeded (includes `Retry-After` header)     |
| 500  | Internal Server Error | Unexpected server error                                 |
| 502  | Bad Gateway           | External service error (AI provider, export connectors) |
| 503  | Service Unavailable   | Service unavailable or circuit breaker open             |
| 504  | Gateway Timeout       | External service timeout                                |

### Error Codes

Standard error codes defined in `ErrorCode` enum:

| Code                   | Status | Retryable | Description                      |
| ---------------------- | ------ | --------- | -------------------------------- |
| VALIDATION_ERROR       | 400    | No        | Request validation failed        |
| RATE_LIMIT_EXCEEDED    | 429    | Yes       | Rate limit exceeded              |
| INTERNAL_ERROR         | 500    | No        | Internal server error            |
| EXTERNAL_SERVICE_ERROR | 502    | Yes       | External service error           |
| TIMEOUT_ERROR          | 504    | Yes       | External service timeout         |
| AUTHENTICATION_ERROR   | 401    | No        | Authentication failed            |
| AUTHORIZATION_ERROR    | 403    | No        | Authorization failed             |
| NOT_FOUND              | 404    | No        | Resource not found               |
| CONFLICT               | 409    | No        | Resource conflict                |
| SERVICE_UNAVAILABLE    | 503    | Yes       | Service unavailable              |
| CIRCUIT_BREAKER_OPEN   | 503    | Yes       | Circuit breaker preventing calls |
| RETRY_EXHAUSTED        | 502    | Yes       | All retry attempts failed        |

### Standard Headers

All API responses include these headers:

| Header                | Description                               | Example                 |
| --------------------- | ----------------------------------------- | ----------------------- |
| X-Request-ID          | Unique request identifier                 | `req_1234567890_abc123` |
| X-Error-Code          | Error code (if error)                     | `VALIDATION_ERROR`      |
| X-Retryable           | Whether error is retryable (if error)     | `true`                  |
| X-RateLimit-Limit     | Total requests allowed                    | `60`                    |
| X-RateLimit-Remaining | Requests remaining                        | `57`                    |
| X-RateLimit-Reset     | When rate limit resets (ISO 8601)         | `2024-01-07T12:05:00Z`  |
| Retry-After           | Seconds to wait before retry (429 errors) | `60`                    |

### Validation Error Message Standards

All validation error messages follow consistent patterns:

| Pattern                                        | Example                                                                      |
| ---------------------------------------------- | ---------------------------------------------------------------------------- |
| `[fieldName] is required and must be a [type]` | `idea is required and must be a string`                                      |
| `[fieldName] is required`                      | `ideaId is required`                                                         |
| `[fieldName] cannot be empty`                  | `ideaId cannot be empty`                                                     |
| `[fieldName] must not exceed [limit]`          | `idea must not exceed 10000 characters`                                      |
| `[fieldName] must be at least [min]`           | `idea must be at least 10 characters`                                        |
| `[fieldName] must contain only [allowed]`      | `ideaId must contain only alphanumeric characters, underscores, and hyphens` |

### API Endpoints

#### Clarification API

**POST /api/clarify**

- Request: `{ idea: string, ideaId?: string }`
- Response: `{ success: true, data: { questions: [...], ideaId: string, status: string, confidence: number }, requestId: string, timestamp: string }`
- Purpose: Start a new clarification session

**POST /api/clarify/start**

- Request: `{ ideaText: string, ideaId: string }`
- Response: `{ success: true, data: { session: ClarificationSession }, requestId: string, timestamp: string }`
- Purpose: Start clarification with explicit idea ID

**GET /api/clarify/start?ideaId={id}**

- Response: `{ success: true, data: { session: ClarificationSession }, requestId: string, timestamp: string }`
- Purpose: Get existing clarification session

**POST /api/clarify/answer**

- Request: `{ ideaId: string, questionId: string, answer: string }`
- Response: `{ success: true, data: { session: ClarificationSession }, requestId: string, timestamp: string }`
- Purpose: Submit answer to a clarification question

**POST /api/clarify/complete**

- Request: `{ ideaId: string }`
- Response: `{ success: true, data: { ...result }, requestId: string, timestamp: string }`
- Purpose: Complete clarification and get refined idea

#### Breakdown API

**POST /api/breakdown**

- Request: `{ ideaId: string, refinedIdea: string, userResponses?: object, options?: object }`
- Response: `{ success: true, data: { session: BreakdownSession }, requestId: string, timestamp: string }`
- Purpose: Start breakdown of clarified idea

**GET /api/breakdown?ideaId={id}**

- Response: `{ success: true, data: { session: BreakdownSession }, requestId: string, timestamp: string }`
- Purpose: Get existing breakdown session

#### Health API

**GET /api/health**

- Response: `{ success: true, data: { status: string, environment: string, checks: {...}, summary: {...} }, requestId: string, timestamp: string }`
- Purpose: Basic system health check

**GET /api/health/database**

- Response: `{ success: true, data: { ...healthCheck, service: 'database', environment: string }, requestId: string, timestamp: string }`
- Purpose: Database health check

**GET /api/health/detailed**

- Response: `{ success: boolean, data: { status: string, timestamp: string, version: string, uptime: number, checks: {...} }, requestId: string, timestamp: string }`
- Status Code: 200 (healthy) or 503 (unhealthy/degraded)
- Purpose: Comprehensive system health with circuit breaker states

### Rate Limiting

Rate limiting is applied per endpoint based on configuration:

| Type     | Limit       | Window   | Used For                      |
| -------- | ----------- | -------- | ----------------------------- |
| strict   | 10 requests | 1 minute | High-cost operations          |
| moderate | 30 requests | 1 minute | Standard operations           |
| lenient  | 60 requests | 1 minute | Read-only/low-cost operations |

Rate limit information is included in all response headers:

- `X-RateLimit-Limit`: Total requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: ISO 8601 timestamp when window resets

### Backward Compatibility

**Commitment:** Zero breaking changes to existing API contracts.

When evolving the API:

1. Add new fields to responses (don't remove existing fields)
2. Maintain existing endpoint behavior
3. Add new endpoints for new features
4. Use versioning (e.g., `/api/v2/...`) if incompatible changes are necessary
5. Document deprecation timeline for outdated fields/endpoints

### Future Enhancements

- [ ] OpenAPI/Swagger specification generation
- [ ] API versioning strategy implementation
- [ ] Interactive API documentation
- [ ] Error recovery suggestions in error responses
- [ ] Error localization support

---

## 32. Closing & governance

This blueprint is intentionally strict and agent-oriented. Agents must never deviate from `agent-policy.md` rules. You — as human overseer — will approve PRs flagged `requires-human`.

---
