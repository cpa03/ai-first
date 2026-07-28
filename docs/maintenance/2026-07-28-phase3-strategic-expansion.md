# Phase 3: Strategic Expansion Finding

**Evaluation Date:** 2026-07-28T03:50:00Z
**Agent:** CMZ (Cognitive Meta-Z) - Autonomous Repository Maintenance

---

## Executive Summary

Phase 3 identifies **ONE high-leverage functional capability** that addresses a real gap in `docs/roadmap.md`:

**Feature: Webhook Support for Custom Integrations**

---

## User Story

**As a** developer or power user,
**I want to** configure webhooks that fire when ideas are created, updated, or exported,
**So that I** can build custom integrations with any tool (Slack, Discord, custom dashboards, CI/CD pipelines) without waiting for official connector support.

---

## Acceptance Criteria

### Core Webhook System

- [ ] Users can create, list, update, and delete webhooks via API
- [ ] Webhooks fire on configurable events: `idea.created`, `idea.updated`, `idea.exported`, `task.created`, `task.completed`
- [ ] Webhook payloads include event type, timestamp, resource data, and user context
- [ ] Webhooks have configurable secret keys for HMAC signature verification
- [ ] Failed webhook deliveries are retried with exponential backoff (3 attempts)
- [ ] Webhook delivery logs are stored for debugging (last 30 days)

### Security

- [ ] HMAC-SHA256 signatures on all webhook payloads
- [ ] Webhook URLs validated for HTTPS (except localhost for development)
- [ ] Rate limiting on webhook creation (10 per user)
- [ ] Webhook secrets are encrypted at rest

### API Endpoints

- [ ] `POST /api/webhooks` - Create webhook
- [ ] `GET /api/webhooks` - List user's webhooks
- [ ] `GET /api/webhooks/[id]` - Get webhook details
- [ ] `PUT /api/webhooks/[id]` - Update webhook
- [ ] `DELETE /api/webhooks/[id]` - Delete webhook
- [ ] `POST /api/webhooks/[id]/test` - Send test payload

### Database

- [ ] `webhooks` table with: id, user_id, url, events, secret, active, created_at, updated_at
- [ ] `webhook_deliveries` table with: id, webhook_id, event, payload, status, response_code, attempts, created_at

---

## Value Justification

### 1. Multiplies Integration Value

- Current: 6 export connectors (Notion, Trello, GitHub, Google Tasks, JSON, Markdown)
- With Webhooks: Users can connect to **any** tool (Slack, Discord, Linear, Asana, Monday, Jira, custom dashboards)
- **Impact**: Instead of building 10+ connectors, build 1 webhook system that enables infinite integrations

### 2. Addresses Roadmap Gap

- Roadmap Phase 2 lists: Asana, Monday.com, Jira, Slack, Zapier
- Webhooks enable ALL of these without per-tool development
- Reduces Phase 2 scope from 10+ integrations to 1 webhook system + community connectors

### 3. Developer-Friendly

- Aligns with "Developer-Friendly" strategic pillar
- Enables API users to build custom workflows
- Creates ecosystem opportunity for community-contributed webhook handlers

### 4. Low Implementation Complexity

- Existing infrastructure: rate limiting, auth, database patterns
- No external API dependencies (unlike Notion/Trello integrations)
- Can be implemented in 1-2 weeks

---

## Technical Design Sketch

```typescript
// Webhook event types
type WebhookEvent =
  | 'idea.created'
  | 'idea.updated'
  | 'idea.exported'
  | 'task.created'
  | 'task.completed'
  | 'deliverable.completed';

// Webhook payload
interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: {
    type: 'idea' | 'task' | 'deliverable';
    id: string;
    attributes: Record<string, unknown>;
  };
  user: {
    id: string;
    email: string;
  };
}

// HMAC signature header
// X-Webhook-Signature: sha256=<hex-digest>
```

---

## Files Affected (Estimated)

| File                                    | Change                              |
| --------------------------------------- | ----------------------------------- |
| src/lib/db/webhooks.ts                  | NEW - Webhook CRUD operations       |
| src/lib/webhook-service.ts              | NEW - Webhook delivery logic        |
| src/app/api/webhooks/route.ts           | NEW - Webhook API endpoints         |
| src/app/api/webhooks/[id]/route.ts      | NEW - Individual webhook operations |
| src/app/api/webhooks/[id]/test/route.ts | NEW - Test webhook endpoint         |
| supabase/migrations/XXXX_webhooks.sql   | NEW - Database schema               |
| src/lib/config/webhook-events.ts        | NEW - Event type definitions        |

---

## Labels

- **Category:** feature
- **Priority:** P2
- **Phase:** 3 (Scale)

---

## Dependencies

- Existing auth system ✅
- Existing rate limiting ✅
- Existing database patterns ✅
- Existing error handling ✅

---

## Risk Assessment

| Risk                 | Likelihood | Impact | Mitigation                                 |
| -------------------- | ---------- | ------ | ------------------------------------------ |
| Webhook abuse (SSRF) | Medium     | High   | URL validation, allowlist for internal IPs |
| Delivery failures    | High       | Low    | Retry logic, delivery logs                 |
| Performance impact   | Low        | Medium | Async delivery, queue system               |
| Secret management    | Low        | High   | Encryption at rest, HMAC verification      |

---

## Success Metrics

- 50+ webhooks created within 30 days of launch
- 95%+ delivery success rate
- < 500ms average delivery latency
- 10+ community-contributed webhook handlers

---

## Final State

**Status:** Phase 3 finding documented
**Recommendation:** Create GitHub issue for webhook feature
**Priority:** P2 (Medium - valuable but not blocking MVP)
