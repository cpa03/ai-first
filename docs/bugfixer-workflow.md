# BugFixer Workflow

## Overview

The BugFixer workflow ensures the repository remains free of bugs and errors through systematic detection, diagnosis, and resolution. All build/lint errors and warnings are treated as fatal failures.

## Core Principles

1. **Zero Tolerance for Build/Lint Errors**: Any error or warning during build/lint is a fatal failure
2. **Proactive Detection**: Regular scanning for potential issues
3. **Systematic Resolution**: Structured approach to bug fixing
4. **Prevention**: Learning from fixes to prevent recurrence

## Bug Detection Process

### 1. Automated Checks (Run on Every Commit)

```bash
# Run all checks
npm run check

# Individual checks
npm run lint          # ESLint (0 warnings/errors)
npm run type-check    # TypeScript strict mode
npm run test:ci       # All tests must pass
npm run build         # Production build must succeed
```

### 2. Security Scanning

```bash
npm run bug:scan      # Comprehensive bug and security scan
npm run security:check # Security vulnerability scan
npm run check:circular # Circular dependency check
```

### 3. Manual Code Review

- Check for TypeScript strict mode compliance
- Verify error handling patterns
- Review async/await usage
- Validate resource cleanup

## Bugfix Branch Naming Convention

```
bugfix/<issue-number>-<short-description>-<YYYYMMDD>
```

Examples:

- `bugfix/123-fix-login-error-20260821`
- `bugfix/456-memory-leak-fetch-20260821`
- `bugfix/789-typescript-strict-violations-20260821`

## Bugfix PR Template

```markdown
## Bug Summary

**Issue**: [Issue number or description]
**Root Cause**: [Brief description of root cause]
**Impact**: [What was affected]

## Changes

- [File]: [What was changed and why]
- [File]: [What was changed and why]

## Verification

- [ ] Lint: 0 warnings/errors
- [ ] Type Check: No TypeScript errors
- [ ] Tests: All tests pass
- [ ] Build: Production build succeeds
- [ ] Manual Testing: [Describe manual testing performed]

## Type

bugfix
```

## Bugfix Checklist

### Before Starting

- [ ] Identify the root cause
- [ ] Check if fix already exists in another branch
- [ ] Create bugfix branch from main

### During Implementation

- [ ] Follow TypeScript strict mode
- [ ] Maintain existing test coverage
- [ ] Add tests for new functionality
- [ ] Update documentation if needed

### Before Submitting PR

- [ ] Run `npm run check` (lint + type-check + tests)
- [ ] Run `npm run build` (production build)
- [ ] Run `npm run bug:scan` (security and bug scan)
- [ ] Update PR template with verification results
- [ ] Ensure branch is up to date with main

### After PR Approval

- [ ] Squash merge to main
- [ ] Delete feature branch
- [ ] Update issue status
- [ ] Document lessons learned

## Common Bug Patterns and Fixes

### 1. TypeScript Strict Mode Violations

```typescript
// ❌ Bad: Unused parameter
const handler = (event: Event) => {
  console.log('handled');
};

// ✅ Good: Prefix with underscore
const handler = (_event: Event) => {
  console.log('handled');
};
```

### 2. Memory Leaks in Async Operations

```typescript
// ❌ Bad: No cleanup
useEffect(() => {
  const controller = new AbortController();
  fetchData(controller.signal);
}, []);

// ✅ Good: Proper cleanup
useEffect(() => {
  const controller = new AbortController();
  fetchData(controller.signal);
  return () => controller.abort();
}, []);
```

### 3. Missing Error Handling

```typescript
// ❌ Bad: No error handling
const data = await fetchData();

// ✅ Good: Proper error handling
try {
  const data = await fetchData();
} catch (error) {
  console.error('Failed to fetch data:', error);
  throw error;
}
```

### 4. Hardcoded Values

```typescript
// ❌ Bad: Hardcoded timeout
setTimeout(() => {}, 5000);

// ✅ Good: Configurable constant
const CAPSLOCK_TIMEOUT = 5000;
setTimeout(() => {}, CAPSLOCK_TIMEOUT);
```

## Monitoring and Alerts

### Daily Checks

1. Run `npm run bug:scan` daily
2. Monitor GitHub Actions for failed builds
3. Review open bugfix PRs

### Weekly Reviews

1. Analyze bug trends
2. Update bugfix documentation
3. Review and merge pending bugfix PRs

## Escalation Process

### Critical Bugs (Production Down)

1. Immediately create bugfix branch
2. Fix and test locally
3. Create PR with critical label
4. Request emergency review
5. Merge and deploy

### High Priority Bugs

1. Create bugfix branch
2. Fix within 24 hours
3. Create PR with high priority label
4. Request review

### Low Priority Bugs

1. Create bugfix branch
2. Fix within 1 week
3. Create PR
4. Regular review cycle

## Tools and Scripts

### Bug Detection

- `npm run bug:scan` - Comprehensive bug scanner
- `npm run security:check` - Security vulnerability scanner
- `npm run check:circular` - Circular dependency checker
- `npm run scan:console` - Console log scanner

### Bug Prevention

- `npm run lint` - ESLint with strict rules
- `npm run type-check` - TypeScript strict mode
- `npm run test:ci` - Comprehensive test suite
- `npm run build` - Production build verification

## Success Metrics

- **Build Success Rate**: 100% (no warnings/errors)
- **Test Pass Rate**: 100% (all tests pass)
- **Security Scan Pass Rate**: 100% (no vulnerabilities)
- **Bugfix PR Merge Time**: < 24 hours for critical, < 1 week for others
- **Recurrence Rate**: 0% (no repeated bugs)

## Contact

For questions about the BugFixer workflow:

- Check this documentation
- Review `.opencode/skills/` for related skills
- Contact the maintainers
