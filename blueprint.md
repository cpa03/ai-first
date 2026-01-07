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

## 26. Integration Hardening (2025-01-07)

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

## 27. Closing & governance

This blueprint is intentionally strict and agent-oriented. Agents must never deviate from the `agent-policy.md` rules. You — as human overseer — will approve PRs flagged `requires-human`.

---
