# Active Tasks

## Overview

This file contains only **active tasks** that are currently in progress or pending. All completed tasks have been archived to maintain efficiency.

**Last Archive**: 2026-02-07  
**Archive Location**: `docs/archive/task-archive-2026-02.md`  
**Archived Tasks**: 197 completed tasks  
**Current Active Tasks**: 2

---

## Quick Stats

- 🟡 **In Progress**: 1 task
- ⏸️ **Pending**: 1 task
- ✅ **Completed**: 197 tasks (archived)
- 🔴 **New**: 2 tasks

---

## Code Architect Tasks

### ✅ COMPLETED: Test Regression Fixes - Code-Test Synchronization

**Priority**: HIGH  
**Status**: ✅ COMPLETED  
**Date**: 2026-02-07

#### Summary

All test regressions have been resolved:

- **Current Status**: 924 passed, 0 failed, 65 skipped (100% pass rate)
- **Test Suites**: 38 passed, 6 skipped
- **Execution Time**: ~29 seconds
- **No flaky or slow tests detected**

#### Actions Taken

- [STRENGTHEN] Fixed AIService health check null pointer bug
- [CONSOLIDATE] All API routes use standardized response format
- [REMOVE] No redundant tests found

---

### [STRENGTHEN] API Standardization Verification

**Priority**: MEDIUM  
**Status**: ✅ COMPLETE

All API endpoints verified to use:

- ✅ `standardSuccessResponse()` for success responses
- ✅ `withApiHandler()` wrapper for consistent handling
- ✅ Proper error response formatting
- ✅ Rate limiting integration

---

## New Tasks (PHASE 1)

### [ ] BUG: Remove `queueMicrotask` from `AutoSaveIndicator.tsx`

**Priority**: MEDIUM
**Status**: TODO

#### Overview

`queueMicrotask` is causing state updates outside of React's awareness in tests, leading to `act()` warnings. It should be replaced with direct state updates or `useEffect` hooks as appropriate.

### [ ] TASK: Move hardcoded validation messages from `IdeaInput.tsx` to config

**Priority**: LOW
**Status**: TODO

#### Overview

`src/components/IdeaInput.tsx` contains hardcoded strings like "Idea must be at least...". These should be centralized in `src/lib/config/error-messages.ts`.

---

## [CONSOLIDATE]

### [ ] CONSOLIDATE: Legacy `src/lib/api-handler.ts`

**Priority**: LOW
**Status**: TODO

#### Overview

`src/lib/api-handler.ts` is a deprecated backward compatibility wrapper. All internal imports should be updated to point to `@/lib/api-handler` directly, and this file should eventually be removed.

---

## [TEST-PERFORMANCE]

### [ ] SLOW TEST: `tests/pii-performance.test.ts`

**Priority**: LOW
**Status**: TODO
**Execution Time**: ~3-4s

#### Overview

This test performs 10,000 redactions to measure performance. While useful for benchmarking, it's relatively slow for a unit test suite. Consider moving it to a performance-specific suite or reducing iterations in CI.

---

## Browser/QA Tasks

### Task: Browser Console Health Check

**Priority**: MEDIUM  
**Status**: ⏸️ PENDING BROWSER ENVIRONMENT  
**Date**: 2026-02-07

#### Overview

Browser console checks require a real browser environment with the application running.

#### Checklist

- [ ] Run `npm run dev`
- [ ] Open browser DevTools (F12)
- [ ] Check Console tab for errors/warnings
- [ ] Navigate through all pages and features
- [ ] Check for:
  - React hydration errors
  - API request failures
  - Missing key prop warnings
  - Deprecated API usage
  - CORS errors
  - Resource loading failures
- [ ] Run Lighthouse audit (target: 90+ all categories)

#### Pre-Check Preparation (Completed 2026-02-07)

✅ All TypeScript compilation errors resolved  
✅ All lint errors resolved  
✅ All unit tests passing (924 tests)  
✅ No console errors in test output

#### Notes

This task requires browser automation tools (Playwright) or manual testing. Environment prepared - ready for browser validation in next session with proper browser environment.

---

## How to Use This File

### Adding New Tasks

1. Add task under appropriate section heading
2. Use status: `TODO`, `IN PROGRESS`, `PENDING`, or `COMPLETE`
3. Include priority: `LOW`, `MEDIUM`, `HIGH`, or `CRITICAL`
4. Add date created
5. Include clear objectives and acceptance criteria

### Completing Tasks

1. When a task is complete, move it to the archive:

   ```bash
   # Append completed task to archive
   cat >> docs/archive/task-archive-$(date +%Y-%m).md << 'EOF'

   # [Task content here]

   EOF
   ```

2. Remove from this active tasks file
3. Update stats at top of file

### Monthly Maintenance

- Archive completed tasks monthly
- Review pending tasks for stale items
- Update priorities based on current roadmap

---

## Archive History

| Date       | File                    | Tasks Archived | Size  |
| ---------- | ----------------------- | -------------- | ----- |
| 2026-02-07 | task-archive-2026-02.md | 197            | 550KB |

---

**Note**: For complete task history, see [docs/archive/](./archive/)
