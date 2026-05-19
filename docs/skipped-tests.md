# Skipped Tests Documentation

This document catalogs all skipped tests in the test suite and their reasons.

## Excluded Test Suites (4)

These are excluded in `jest.config.js` via `testPathIgnorePatterns`:

| Directory       | Files | Reason                                                 |
| --------------- | ----- | ------------------------------------------------------ |
| `tests/api/`    | 4     | API route tests requiring full API mocking environment |
| `tests/utils/`  | 2     | Helper files, not test files                           |
| `tests/config/` | 1     | Config files, not test files                           |

## Individual Skipped Tests (35)

### resilience-edge-cases.test.ts (3 skipped)

| Test                                              | Reason                                                             |
| ------------------------------------------------- | ------------------------------------------------------------------ |
| `should handle very short monitoring period`      | Timing-dependent, flaky in CI                                      |
| `should retry only when shouldRetry returns true` | Test expectation mismatch - code behavior differs from expectation |
| `should increase delay exponentially`             | Timing-dependent, flaky in CI                                      |

### security-request-signer.test.ts (1 skipped)

| Test                                 | Reason                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------- |
| `should verify valid signed request` | Requires real Fetch API Request with body - Jest mocks don't support this |

### export-connectors-resilience.test.ts (12 skipped)

All marked with "BUG: mocking issue" or "BUG: incorrect test expectation" - require test refactoring to fix.

### export-resilience-integration.test.ts (11 skipped)

All marked with "BUG: mocking issue" - require test refactoring to fix.

## Current Test Status

```
Test Suites: 4 skipped, 65 passed, 65 of 69 total
Tests:       35 skipped, 1519 passed, 1554 total
```

## Recommendations

1. **Timing-dependent tests**: Should remain skipped - valid reason is flakiness in CI
2. **Mocking issue tests**: Require significant test refactoring to fix
3. **Incorrect expectation tests**: Need investigation into actual code behavior vs test expectations
4. **Excluded API tests**: Architectural decision - may be re-enabled with proper test environment setup
