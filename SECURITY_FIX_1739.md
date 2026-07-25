# Security Vulnerability Fix: minimatch (Issue #1739)

## Current State

**Vulnerability:** HIGH severity in `brace-expansion` (≤5.0.7) affecting `minimatch` (2.0.0 - 10.0.2)

**Status:** ⚠️ CANNOT FIX without breaking changes

## Root Cause Analysis

The vulnerability exists in transitive dependencies:

```
brace-expansion ≤5.0.7 (vulnerable)
  └── minimatch 2.0.0 - 10.0.2
       └── @eslint/config-array
            └── eslint 9.x
```

ESLint 9.x uses `@eslint/config-array` which depends on `minimatch` versions that use vulnerable `brace-expansion`.

## Why Direct Fix Failed

### Attempt 1: npm override to brace-expansion ^5.0.8

**Result:** BROKEN - ESLint crashes with `TypeError: expand is not a function`

**Reason:** `brace-expansion` v5.x has a breaking API change:

- v1.x: `module.exports = function expand() {...}` (function export)
- v5.x: `export function expand() {...}` (named export)

The `minimatch` package expects `brace-expansion` to export a function, but v5.x changed to named exports.

### Attempt 2: npm audit fix --force

**Result:** BROKEN - Peer dependency conflicts

**Reason:** Forced updates caused incompatible versions:

- `eslint-config-next@12.0.4` requires `eslint@^7.23.0`
- `eslint-plugin-react@7.22.0` requires `eslint@^3 || ^4 || ^5 || ^6 || ^7`

## Recommended Solution

### Option A: Upgrade to ESLint 10.x (Recommended)

1. **Update package.json:**

   ```json
   {
     "eslint": "^10.7.0",
     "eslint-config-next": "^14.0.0",
     "eslint-plugin-react": "^7.38.0"
   }
   ```

2. **Migrate ESLint config:**
   - Convert `.eslintrc.js` to `eslint.config.js` (flat config)
   - Update rule names and configurations

3. **Test thoroughly:**
   - Run `npm run lint`
   - Run `npm test`
   - Verify CI/CD pipeline

### Option B: Accept Risk (Current State)

The vulnerability affects development/CI environments only:

- **Exploitability:** Low - requires local access to development machine
- **Impact:** Medium - could cause DoS in development tools
- **Production Risk:** None - vulnerability is in dev dependencies only

### Option C: Wait for Upstream Fix

Monitor these packages for updates:

- `@eslint/config-array` - needs to update minimatch dependency
- `@eslint/eslintrc` - needs to update minimatch dependency
- `minimatch` - needs to release version >10.0.2 with fixed brace-expansion

## Affected Versions

| Package              | Current Version | Vulnerable Range | Fixed Version          |
| -------------------- | --------------- | ---------------- | ---------------------- |
| brace-expansion      | 1.1.11          | ≤5.0.7           | >5.0.7 (breaking)      |
| minimatch            | 3.1.2           | 2.0.0 - 10.0.2   | >10.0.2 (not released) |
| @eslint/config-array | 0.20.0          | ≤0.22.0          | Not available          |
| @eslint/eslintrc     | 3.3.3           | ≥0.1.1           | Not available          |

## Acceptance Criteria

- [ ] `npm audit --audit-level=high` returns 0 high-severity vulnerabilities
- [ ] All existing tests pass
- [ ] Linting still works correctly
- [ ] CI/CD pipeline runs successfully

**Current Status:** Cannot meet acceptance criteria without breaking changes.

## Next Steps

1. **Immediate:** Document the vulnerability and accept risk (this PR)
2. **Short-term:** Plan ESLint 10.x migration (create separate issue)
3. **Long-term:** Establish dependency update schedule

## References

- [GitHub Advisory: brace-expansion DoS](https://github.com/advisories/GHSA-mh99-v99m-4gvg)
- [npm audit documentation](https://docs.npmjs.com/cli/audit)
- [ESLint 10.x migration guide](https://eslint.org/docs/latest/use/migrate-to-10.0.0)
- [brace-expansion v5 changelog](https://github.com/isaacs/brace-expansion/blob/main/changelog.md)
