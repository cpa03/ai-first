# Issue: test: Add API route test coverage for 22 routes

**Category:** test
**Priority:** P2
**Status:** OPEN
**Created:** 2026-07-16

---

## Phase 1 Finding: Testability - Insufficient API Route Tests

**Domain Score:** Code Quality: 62/100
**Criterion:** Testability (Weight: 15, Score: 9)

### Evidence

- **22 API routes** exist in src/app/api/
- **105 test files** total, but very few test API routes directly
- Only 4 API routes have dedicated tests
- 13 tests currently skipped

### Impact

- Regression risk for API changes
- No validation of request/response contracts
- Hard to verify API behavior under edge cases

### Acceptance Criteria

- [ ] Each API route has at least one integration test
- [ ] Tests cover happy path and error cases
- [ ] Tests validate response format and status codes
- [ ] All tests pass in CI
