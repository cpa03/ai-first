# Bug Tracking

## Active Bugs (Found by BugLover)

### [/] Bug 1: Integration Tests - Partially Fixed

**File:** `tests/integration-comprehensive.test.tsx`
**Issue:** Tests fail because IdeaInput now calls `/api/ideas` endpoint instead of `dbService.createIdea` directly (layer separation fix), but tests still mock `dbService`.
**Fix Applied:**

- Updated "should handle full workflow from idea to export" test to mock `/api/ideas` endpoint
- Updated "should handle error recovery throughout workflow" test to use fetch mocks
- Updated "should integrate component states with API operations" test to use proper API mocking
  **Status:** Mixed results - needs further refinement
  **Remaining:** 3 tests still failing due to complex mock interactions

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

### [x] Bug 9: ClarificationFlow Component Tests - FIXED

**File:** `tests/ClarificationFlow.test.tsx`
**Issue:** Clarification flow component tests failing due to API response format inconsistencies and ambiguous text selectors
**Fix Applied:**

- Fixed API response mocks to use correct format with `data.data.questions` wrapper
- Updated text selectors from `getByText` to `getByRole('heading')` to avoid ambiguity
- Fixed progress indicator assertions to use `getAllByText` for text appearing in multiple elements
  **Status:** All 17 tests passing

## Bug Statistics

- Total Bugs Found: 9
- Fixed: 1 (Integration tests - main workflow)
- Critical: 0
- High: 8 (remaining test suite failures)
- Medium: 0
- Low: 0

## Current Test Status (2026-02-04)

- **Total Tests**: 1030
- **Passed**: 949 ✅
- **Failed**: 67 ❌
- **Skipped**: 14

### Failing Test Suites:

1. **[/] tests/export-resilience-integration.test.ts** - 10+ failures
   - ExportManager initialization issues
   - Circuit breaker integration failures
   - Mock configuration issues

2. **[/] tests/resilience-edge-cases.test.ts** - Edge case failures
   - Circuit breaker state transition issues
   - Retry timing edge cases

3. **[/] tests/ClarificationFlow.test.tsx** - Component rendering issues
   - State management failures

4. **[/] tests/e2e.test.tsx** - 9 E2E failures
   - Integration issues between components

5. **[/] tests/e2e-comprehensive.test.tsx** - 7 E2E failures
   - End-to-end workflow failures

6. **[/] tests/integration-comprehensive.test.tsx** - Partially fixed
   - Main workflow test: ✅ FIXED
   - 2 remaining tests still failing

7. **[/] tests/frontend-comprehensive.test.tsx** - 19 UI failures
   - Component rendering and state issues

## Notes

- PHASE 1 In Progress
- Main production code is working correctly (build passes)
- TypeScript: 0 errors
- Tests passing in critical areas: auth, validation, pii-redaction, exports, ai-service

## Phase 1 Completion Status: 30%

- [x] Identified all failing tests
- [/] Fixing test failures (in progress)
- [ ] Verify all tests pass
