# Phase 2: Feature Hardening & Integration Findings

**Evaluation Date:** 2026-07-28T03:45:00Z
**Agent:** CMZ (Cognitive Meta-Z) - Autonomous Repository Maintenance

---

## Summary

Phase 2 found **3 actionable findings** for strengthening existing features. All findings relate to reducing coupling, improving consistency, and strengthening contracts.

---

## Finding 1: API Route Wrapper Inconsistency

**Severity:** Medium
**Category:** refactor
**Priority:** P2

### Observation

22 of 22 API routes use `withApiHandler`, but 5 non-health routes lack `requireAuth`:

- `src/app/api/csp-report/route.ts` - CSP violation reports (intentionally public)
- `src/app/api/admin/rate-limit/route.ts` - Admin endpoint (needs separate auth)
- `src/app/api/metrics/route.ts` - Metrics endpoint (needs separate auth)

**Health routes** (`/api/health/*`) correctly skip auth as they're liveness/readiness probes.

### Evidence

```
Routes with withApiHandler: 22/22
Routes with requireAuth: 13/22
Routes without auth (non-health): 3
```

### Impact

- **Risk**: Admin and metrics endpoints may be publicly accessible
- **Contract**: No documented auth policy for these endpoints

### Recommendation

1. Add admin role verification to `/api/admin/rate-limit`
2. Add auth or explicit public marker to `/api/metrics`
3. Document auth policy in `docs/api.md`

---

## Finding 2: Ownership Verification Not Applied to Deliverables

**Severity:** Low
**Category:** refactor
**Priority:** P3

### Observation

`verifyResourceOwnership` is used in 11 API routes for ideas, tasks, and clarify endpoints. However, `src/app/api/deliverables/[id]/tasks/route.ts` uses ownership verification but the `DeliverableService` itself doesn't expose a `getDeliverableWithOwnership` method.

### Evidence

```typescript
// tasks/[id]/route.ts - uses getTaskWithOwnership ✅
const taskWithOwnership = await dbService.getTaskWithOwnership(taskId);

// deliverables/[id]/tasks/route.ts - uses different pattern
const tasks = await dbService.getDeliverableTasks(deliverableId);
```

### Impact

- **Risk**: Low - current code still verifies ownership via idea.user_id
- **Consistency**: Pattern inconsistency across resource types

### Recommendation

1. Add `getDeliverableWithOwnership` to DeliverableService for consistency
2. Use consistent ownership verification pattern across all resource types

---

## Finding 3: Error Response Functions Unused

**Severity:** Low
**Category:** refactor
**Priority:** P3

### Observation

`standardErrorResponse`, `badRequestResponse`, and `notFoundResponse` are exported from `src/lib/api-handler/response.ts` but never used in API routes. All routes throw errors that are caught by the `withApiHandler` wrapper.

### Evidence

```
standardSuccessResponse usage: 48 occurrences
standardErrorResponse usage: 0 occurrences
badRequestResponse usage: 0 occurrences
notFoundResponse usage: 0 occurrences
```

### Impact

- **Code Quality**: Dead code in response.ts
- **Maintainability**: Unused exports create confusion about intended pattern

### Recommendation

1. Either remove unused response functions or
2. Document that errors should be thrown (not returned) as the standard pattern
3. Update `docs/api.md` to clarify error handling convention

---

## Positive Patterns Found

### 1. Consistent API Wrapper Usage ✅

All 22 API routes use `withApiHandler` for consistent error handling, rate limiting, and request ID generation.

### 2. Comprehensive Ownership Verification ✅

11 routes verify resource ownership before allowing modifications:

- Ideas, Tasks, Deliverables, Clarify endpoints

### 3. Soft Delete Pattern ✅

Consistent soft delete implementation across:

- Ideas (`softDeleteIdea`)
- Deliverables (`softDeleteDeliverable`)
- Tasks (`softDeleteTask`)

### 4. Input Sanitization ✅

6 routes use `sanitizeHtml` or `sanitizeObject` for user-controllable text fields.

### 5. Validation Pattern ✅

Consistent use of `validateIdea`, `validateIdeaId` across routes with proper error throwing.

---

## Skills Used

| Skill                 | Purpose                       | Result                   |
| --------------------- | ----------------------------- | ------------------------ |
| codebase-explore      | API route pattern analysis    | 22 routes analyzed       |
| claude-code-debugging | Error handling pattern review | Consistent pattern found |

---

## Final State

**Status:** Phase 2 complete, 3 findings documented
**Next:** Proceed to Phase 3 (Strategic Expansion)
