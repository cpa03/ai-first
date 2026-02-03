# Bug Tracking

## Active Bugs (Found by BugLover)

### [x] Bug 1: Integration Tests - IdeaInput Component Mocking Issues (PARTIALLY FIXED)

**File:** `tests/integration-comprehensive.test.tsx`
**Issue:** Tests fail because IdeaInput now calls `/api/ideas` endpoint instead of `dbService.createIdea` directly (layer separation fix), but tests still mock `dbService`.
**Impact:** Fixed main workflow test. 2 remaining test failures:

- Error recovery test (uses old dbService mock)
- Frontend-Backend Integration test (mock conflict)
  **Fix Applied:** Updated "should handle full workflow from idea to export" test to mock `/api/ideas` endpoint
  **Remaining:** Fix 2 other tests in this file

### [ ] Bug 2: Backend Comprehensive Tests - Singleton Mocking Complexity

**File:** `tests/backend-comprehensive.test.ts`
**Issue:** Tests fail due to complex singleton mocking patterns
**Impact:** 9 test failures
**Root Cause:** Singleton pattern makes mocking difficult in comprehensive tests
**Fix Required:** Refactor tests to properly isolate singletons or use different testing approach

### [ ] Bug 3: Frontend Comprehensive Tests - UI Component Rendering Issues

**File:** `tests/frontend-comprehensive.test.tsx`
**Issue:** 19 test failures related to UI component rendering and state management
**Impact:** Frontend comprehensive test suite failing
**Fix Required:** Investigate component state initialization and rendering issues

### [ ] Bug 4: E2E Tests - End-to-End Workflow Failures

**File:** `tests/e2e.test.tsx`, `tests/e2e-comprehensive.test.tsx`
**Issue:** E2E tests failing due to integration issues between components
**Impact:** 16 test failures (9 + 7)
**Fix Required:** Update E2E tests to match current component behavior and API contracts

### [ ] Bug 5: Export Resilience Integration Tests

**File:** `tests/export-resilience-integration.test.ts`
**Issue:** Tests failing - likely resilience configuration or mock structure issues
**Fix Required:** Update test mocks to match current resilience framework structure

### [ ] Bug 6: Clarifier Tests

**File:** `tests/clarifier.test.ts`
**Issue:** Tests failing in clarification flow
**Fix Required:** Investigate and fix clarifier test failures

### [ ] Bug 7: Cache Tests

**File:** `tests/cache.test.ts`
**Issue:** Cache tests failing
**Fix Required:** Investigate cache implementation and test mocks

### [ ] Bug 8: Resilience Edge Cases Tests

**File:** `tests/resilience-edge-cases.test.ts`
**Issue:** Edge case tests for resilience framework failing
**Fix Required:** Review resilience edge case handling and update tests

### [ ] Bug 9: ClarificationFlow Component Tests

**File:** `tests/ClarificationFlow.test.tsx`
**Issue:** Clarification flow component tests failing
**Fix Required:** Update component tests to match current implementation

## Bug Statistics

- Total Bugs Found: 9
- Critical: 0
- High: 9 (all affecting test suites)
- Medium: 0
- Low: 0

## Notes

- All bugs are in test files, not production code
- Main issue: Tests not updated after architectural changes (layer separation, API abstraction)
- No production bugs found - all tests pass in categories: auth, validation, pii-redaction, exports, ai-service
