# RnD (Research and Development) Long-term Memory

This document tracks the RnD improvements made to the ai-first project.

## Completed Improvements

### 2026-02-25: Security Vulnerability Fixes

**PR**: #1766
**Title**: fix(security): resolve minimatch and ajv ReDoS vulnerabilities

**Changes**:

- Fixed high-severity ReDoS vulnerability in minimatch (GHSA-3ppc-4f35-3m26)
- Fixed moderate-severity ReDoS vulnerability in ajv (GHSA-2g4f-4pwh-qvx6)
- Updated minimatch to version 9.0.7
- Updated ajv to version 6.14.0+

**Verification**:

- npm audit: 0 vulnerabilities ✅
- TypeScript type-check: passed ✅
- ESLint: passed ✅
- Tests: 1327 passed

**Notes**:

- Small atomic diff (only package-lock.json changes)
- No breaking changes
- Zero warnings

## Approach for Future RnD Improvements

1. **Scan for vulnerabilities**: Run `npm audit` regularly
2. **Small, safe, measurable**: Focus on atomic improvements
3. **Verify before PR**: Always run type-check, lint, and tests
4. **Document**: Track all improvements in this file
