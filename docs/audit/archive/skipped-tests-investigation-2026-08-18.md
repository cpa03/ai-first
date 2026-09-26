# Skipped Tests Investigation

**Date:** 2026-08-18
**Issue:** #1903 - Investigate and Enable Skipped Tests

## Summary

During investigation of the test suite, it was found that **3 test suites are skipped** out of 136 total test suites.

## Investigation Findings

### Test Execution Results

- **Total test suites:** 136
- **Passed:** 133
- **Skipped:** 3
- **Failed:** 0

### Potential Causes

1. **Jest Configuration:** The `testPathIgnorePatterns` in `jest.config.js` includes:
   - `<rootDir>/tests/api/` (20 files)
   - `<rootDir>/tests/utils/` (2 files)
   - `<rootDir>/tests/config/` (1 file)

   These directories contain utility/configuration files used by other tests, not standalone test suites.

2. **Compilation Issues:** Some test files may have TypeScript/JSX syntax that requires proper Jest compilation.

3. **Import Errors:** Test files may have missing dependencies or circular imports.

### Test Files Analysis

#### tests/api/ Directory

Contains 20 test files for API routes:

- `ideas.test.ts`, `ideas-id.test.ts`, `ideas-id-session.test.ts`, etc.
- These are proper test files, not utilities

#### tests/utils/ Directory

Contains 2 utility files:

- `_testHelpers.ts` - Helper functions for tests
- `test-secrets.ts` - Mock credentials

#### tests/config/ Directory

Contains 1 configuration file:

- `test-config.ts` - Centralized test configuration

## Recommendations

1. **Review Jest Configuration:** The `testPathIgnorePatterns` may need adjustment to properly handle test files in `tests/api/`.

2. **Identify Skipped Tests:** Run Jest with more verbose output or JSON reporting to identify exactly which tests are skipped.

3. **Fix Compilation Issues:** Check for TypeScript errors or missing imports in skipped test files.

4. **Enable Skipped Tests:** Once identified, fix any issues and remove skip annotations.

## Next Steps

1. Run Jest with `--json` flag to get structured output
2. Analyze skipped test file paths
3. Check for compilation errors in those files
4. Fix issues and enable tests
