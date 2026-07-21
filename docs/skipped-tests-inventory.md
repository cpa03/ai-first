# Skipped Tests Inventory

**Date**: July 21, 2026 (Updated)
**Status**: Investigation Complete - All skips validated

## Summary

This document inventories all skipped tests in the codebase, explains why they are skipped, and provides recommendations for future resolution.

## Current Test Status

```
Test Suites: 4 skipped, 103 passed, 103 of 107 total
Tests:       4 skipped, 1769 passed, 1773 total
```

## Skipped Test Suites

### 1. E2E Comprehensive Tests

**File**: `tests/e2e-comprehensive.test.tsx`
**Status**: `describe.skip`
**Reason**: Needs rework due to complex mocking issues
**Impact**: End-to-end user workflow testing

**Details**:

- Complex mocking issues and timing problems
- Individual component tests pass - core functionality is working
- Requires refactoring to use simpler mocking patterns

**Recommendation**:

- Convert to integration tests with simpler mocking
- Use actual API calls instead of mocked responses
- Consider using Playwright for true E2E testing

### 2. Integration Comprehensive Tests

**File**: `tests/integration-comprehensive.test.tsx`
**Status**: `describe.skip`
**Reason**: Needs rework due to complex mocking issues
**Impact**: Integration workflow testing

**Details**:

- Complex mocking issues and timing problems
- Individual component tests pass - core functionality is working
- Requires refactoring to use simpler mocking patterns

**Recommendation**:

- Simplify mocking approach
- Use test utilities for common mock patterns
- Consider using MSW (Mock Service Worker) for API mocking

### 3. Frontend Comprehensive Tests

**File**: `tests/frontend-comprehensive.test.tsx`
**Status**: `describe.skip`
**Reason**: Needs rework due to complex mocking issues
**Impact**: Frontend component testing

**Details**:

- Complex mocking issues and timing problems
- Individual component tests pass - core functionality is working
- Requires refactoring to use simpler mocking patterns

**Recommendation**:

- Use React Testing Library best practices
- Simplify component mocking
- Focus on user behavior rather than implementation details

### 4. E2E Tests

**File**: `tests/e2e.test.tsx`
**Status**: `describe.skip`
**Reason**: Needs rework due to complex mocking issues
**Impact**: End-to-end testing

**Details**:

- Complex mocking issues and timing problems
- Individual component tests pass - core functionality is working
- Requires refactoring to use simpler mocking patterns

**Recommendation**:

- Use actual browser testing with Playwright
- Reduce reliance on mocked APIs
- Focus on critical user journeys

## Individual Skipped Tests

> **Note**: As of July 21, 2026, all previously individually skipped tests (13 tests across resilience, security, and export connector suites) have been un-skipped and are now passing. The only remaining skipped tests are from the4 skipped test suites below.

## Recommendations

### Short-term (1-2 weeks)

1. **Document all skipped tests** with clear reasons
2. **Add comments** to skipped tests explaining why they are skipped
3. **Create tracking issues** for each skipped test suite
4. **Prioritize rework** based on test coverage gaps

### Medium-term (1 month)

1. **Rework comprehensive test suites** to use simpler mocking patterns
2. **Implement MSW** for API mocking in integration tests
3. **Add Playwright** for true E2E testing
4. **Fix timing-dependent tests** using fake timers

### Long-term (3 months)

1. **Achieve 100% test coverage** for critical paths
2. **Implement visual regression testing**
3. **Add performance testing** to CI pipeline
4. **Create test documentation** for developers

## Impact Analysis

### Test Coverage Gap

- **Skipped Suites**: 4 test suites covering E2E, integration, and frontend testing
- **Skipped Tests**: 4 individual tests (from skipped suites)
- **Coverage Impact**: ~0.2% of test suite is skipped (4 of 1773 tests)

### Risk Assessment

- **High Risk**: E2E and integration test gaps could miss critical user workflow issues
- **Medium Risk**: Frontend comprehensive test gap could miss component behavior issues
- **Low Risk**: Individual test gaps are minimal and well-documented

### Priority Matrix

| Priority | Test Suite        | Impact                        | Effort |
| -------- | ----------------- | ----------------------------- | ------ |
| High     | E2E Tests         | Critical user workflows       | High   |
| High     | Integration Tests | API and service integration   | Medium |
| Medium   | Frontend Tests    | Component behavior            | Medium |
| Low      | Individual Tests  | Edge cases and error handling | Low    |

## Conclusion

The skipped tests represent a known technical debt that should be addressed systematically. The current test suite provides excellent coverage for core functionality, with only 4 test suites skipped (0.2% of total tests).

**Investigation Status (July 21, 2026)**:

- ✅ All skipped tests have been investigated
- ✅ All skips are validly documented with clear reasons
- ✅ Individual skipped tests (13) have been un-skipped and are passing
- ✅ Only 4 test suites remain skipped (E2E and integration comprehensive tests)
- ✅ Acceptance criteria for issue #1903 are met

**Next Steps**:

1. ~~Create GitHub issues for each skipped test suite~~ (Done)
2. ~~Prioritize rework based on risk and impact~~ (Done)
3. Implement MSW for better API mocking
4. Consider Playwright for true E2E testing
5. ~~Document all skipped tests with clear reasons~~ (Done)

---

_Document generated by CMZ (Cognitive Meta-Z) Agent_
_Last updated: July 21, 2026_
