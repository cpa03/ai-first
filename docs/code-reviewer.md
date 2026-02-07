# Code Reviewer Documentation

**Agent**: Code Reviewer Specialist  
**Date**: 2026-02-07  
**Branch**: code-reviewer  
**Status**: Complete

---

## Overview

This document serves as a guide for code review activities in the IdeaFlow project. It documents common issues, standards, and best practices identified during code reviews.

---

## Code Review Checklist

### 1. Logging Standards

#### ❌ Incorrect: Direct console usage

```typescript
console.log('Debug message');
console.error('Error:', err);
console.warn('Warning message');
```

#### ✅ Correct: Use structured logger

```typescript
import { createLogger } from '@/lib/logger';

const logger = createLogger('ComponentName');

logger.info('Information message');
logger.error('Error message', err);
logger.warn('Warning message');
```

#### Files Fixed

- `src/app/results/page.tsx` - Replaced 2 console.error calls
- `src/app/dashboard/page.tsx` - Replaced 2 console.error calls
- `src/components/BlueprintDisplay.tsx` - Replaced 1 console.error call
- `src/lib/auth.ts` - Replaced 1 console.warn call
- `src/lib/db.ts` - Replaced 1 console.warn call

### 2. TypeScript Standards

- Strict mode enabled (`strict: true` in tsconfig.json)
- All types must be explicitly defined
- No `any` types without explicit suppression comment
- Path aliases using `@/*` for imports
- Unused variables must be prefixed with `_`

### 3. Code Style

- ESLint with Next.js configuration (`.eslintrc.json`)
- Prettier for code formatting (`.prettierrc`)
- Import organization with specific patterns
- Maximum line length: 80-100 characters

### 4. Naming Conventions

- Components: PascalCase (`ExportConnector`, `ClarifierAgent`)
- Functions: camelCase (`validateIdea`, `generateRequestId`)
- Constants: UPPER_SNAKE_CASE for true constants
- Files: camelCase or PascalCase matching exports
- Types/Interfaces: PascalCase with descriptive names

---

## Common Issues Found

### Issue 1: Direct Console Usage

**Severity**: Medium  
**Impact**: Inconsistent logging, no PII redaction, harder to control log levels

**Resolution**: Replace all direct console calls with structured logger from `@/lib/logger`

### Issue 2: Unused Variables

**Severity**: Low  
**Status**: Fixed in `src/app/clarify/page.tsx`

Unused variables should be prefixed with underscore to indicate intentional non-use.

### Issue 3: Unused Imports

**Severity**: Low  
**Status**: Monitor

Run `npm run lint` regularly to catch unused imports and variables.

---

## Quality Metrics

### Current Status (2026-02-07)

- **Total Test Suites**: 44
- **Passing**: 38 (86.4%)
- **Skipped**: 6 (13.6%)
- **Failing**: 0 (0%)
- **Total Tests**: 989
- **Passing**: 924 (93.4%)
- **Skipped**: 65 (6.6%)
- **Failing**: 0 (0%)
- **TypeScript Errors**: 0
- **Lint Errors**: 0
- **Lint Warnings**: 3 (all in test files, `any` type usage)

### Build Status

- ✅ TypeScript compilation: PASS
- ✅ Linting: PASS (3 warnings in tests)
- ✅ Tests: PASS

---

## Review Process

### Before Creating PR

1. **Run all checks**:

   ```bash
   npm run type-check
   npm run lint
   npm test
   ```

2. **Review changes**:
   - Check for console.log/error/warn usage
   - Verify proper error handling
   - Ensure PII redaction is applied
   - Check for proper TypeScript types

3. **Update documentation**:
   - Update this file if new issues found
   - Update CHANGELOG.md if applicable

### PR Review Criteria

- [ ] All CI checks passing
- [ ] No direct console usage (except in logger.ts)
- [ ] Proper error handling with structured errors
- [ ] PII redaction applied where needed
- [ ] Tests updated/added for new functionality
- [ ] Documentation updated

---

## Tools and Commands

```bash
# Run all checks
npm run type-check && npm run lint && npm test

# Run specific test file
npm test -- tests/validation.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should validate"

# Check for console usage (manual review)
grep -r "console\." src/ --include="*.ts" --include="*.tsx" | grep -v "logger.ts"
```

---

## Recent Changes

### 2026-02-07 - Console Usage Fix

**Files Modified**:

- `src/app/results/page.tsx` - Added logger import, replaced 2 console.error
- `src/app/dashboard/page.tsx` - Added logger import, replaced 2 console.error
- `src/app/clarify/page.tsx` - Fixed unused variable warning
- `src/components/BlueprintDisplay.tsx` - Added logger import, replaced 1 console.error
- `src/lib/auth.ts` - Added logger import, replaced 1 console.warn
- `src/lib/db.ts` - Added logger import, replaced 1 console.warn

**Impact**: Improved logging consistency and PII protection across the codebase.

---

## Resources

- [Quality Assurance Documentation](./quality-assurance.md)
- [Error Codes Reference](./error-codes.md)
- [Architecture Documentation](./architecture.md)

---

**Document Version**: 1.0  
**Last Reviewed**: 2026-02-07  
**Next Review Date**: 2026-03-07
