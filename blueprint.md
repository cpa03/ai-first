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

## 24. API Route Handler Abstraction

### Purpose

To eliminate code duplication across API routes and enforce consistent patterns for request handling, validation, error handling, and response formatting.

### Architecture

All API routes MUST use the handler abstraction in `src/lib/api-handler.ts`:

#### Core Components:

**`withApiHandler`**: Higher-order function that wraps route handlers with:

- **Request ID generation**: Unique ID for distributed tracing
- **Rate limiting**: Per-route configurable rate limits
- **Request size validation**: Prevents payload attacks
- **Error handling**: Automatic conversion to standardized error responses
- **Response formatting**: Consistent headers (X-Request-ID)

**`ApiContext`**: Provides access to:

- `requestId`: Unique request identifier
- `request`: NextRequest object

**`ApiHandler`**: Type-safe handler function signature:

```typescript
type ApiHandler<T> = (context: ApiContext) => Promise<NextResponse>;
```

#### Helper Functions:

- `successResponse<T>(data, status?)`: Creates successful JSON responses
- `notFoundResponse(message?)`: Creates 404 responses
- `badRequestResponse(message, details?)`: Creates 400 error responses

### Usage Pattern

**Before** (duplicated code):

```typescript
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const rateLimitResult = checkRateLimit(...);
    if (!rateLimitResult.allowed) {
      return rateLimitResponse(...);
    }
    const sizeValidation = validateRequestSize(request);
    if (!sizeValidation.valid) {
      return buildErrorResponse(...);
    }
    // Business logic here...
    return NextResponse.json({ success: true, ... }, {
      headers: { 'X-Request-ID': requestId }
    });
  } catch (error) {
    return toErrorResponse(error, requestId);
  }
}
```

**After** (clean, declarative):

```typescript
async function handlePost(context: ApiContext) {
  const { request } = context;
  const { ideaId, ideaText } = await request.json();
  // Validation and business logic here...
  return successResponse({
    success: true,
    session,
    requestId: context.requestId,
  });
}

export const POST = withApiHandler(handlePost, { rateLimit: 'moderate' });
```

### Configuration Options

**`rateLimit`**: Optional rate limit configuration

```typescript
{
  rateLimit: 'moderate';
} // Uses rateLimitConfigs.moderate
```

**`validateSize`**: Disable size validation (default: true)

```typescript
{
  validateSize: false;
} // For health endpoints, etc.
```

### Benefits

1. **DRY Principle**: Eliminates ~40 lines of duplicated code per route
2. **Consistency**: All routes follow same patterns
3. **Maintainability**: Changes to error handling or rate limiting propagate automatically
4. **Type Safety**: Strongly typed context and handler signatures
5. **Separation of Concerns**: Infrastructure concerns abstracted away from business logic
6. **Open/Closed Principle**: Easy to add new middleware features without modifying existing routes

### Refactored Routes

All API routes have been refactored to use the handler abstraction:

- `/api/breakdown` - POST and GET
- `/api/clarify/start` - POST and GET
- `/api/clarify/answer` - POST
- `/api/clarify/complete` - POST
- `/api/clarify` - POST
- `/api/health` - GET
- `/api/health/database` - GET
- `/api/health/detailed` - GET

### Future Enhancements

Potential middleware to add:

- Authentication/Authorization checks
- Request logging/metrics
- Request validation schema (Zod/Joi integration)
- CORS handling
- Request timeout enforcement
- Custom rate limit strategies (per-user, per-API-key)

---

## 25. Integration Resilience Patterns

### Resilience Framework

All external service integrations MUST use the resilience framework in `src/lib/resilience.ts`:

#### Features:

- **Retry with exponential backoff**: Automatic retries on transient failures
- **Timeouts**: All external calls have configurable timeouts
- **Circuit breakers**: Stop calling failing services temporarily
- **Configurable per-service**: Each service has optimized settings

#### Configuration (defaultResilienceConfigs):

```typescript
openai: 3 retries, 60s timeout, 5 failures opens circuit
notion: 3 retries, 30s timeout, 5 failures opens circuit
trello: 3 retries, 15s timeout, 3 failures opens circuit
github: 3 retries, 30s timeout, 5 failures opens circuit
supabase: 2 retries, 10s timeout, 10 failures opens circuit
```

### Error Handling

All API responses use standardized error format in `src/lib/errors.ts`:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": [...],
  "timestamp": "2024-01-07T00:00:00Z",
  "requestId": "req_1234567890_abc123",
  "retryable": true/false
}
```

### Health Monitoring

Use detailed health endpoint at `/api/health/detailed` to monitor:

- Database health and latency
- AI service status
- Export connectors availability
- Circuit breaker states

### Integration Guidelines

1. **Never call external APIs directly** - Always wrap in resilience framework
2. **Set appropriate timeouts** - Based on service SLAs
3. **Handle retryable errors** - Use standard error codes
4. **Monitor circuit breakers** - Check health endpoint regularly
5. **Log with request IDs** - Enable distributed tracing
6. **Graceful degradation** - Fallback when services unavailable

---

## 25. Closing & governance

This blueprint is intentionally strict and agent-oriented. Agents must never deviate from the `agent-policy.md` rules. You — as human overseer — will approve PRs flagged `requires-human`.

---
