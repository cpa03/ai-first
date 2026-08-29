# BugFixer Agent

Continuous bug detection and fixing agent for the AI-First repository.

## Overview

BugFixer is an autonomous agent that continuously monitors the repository for bugs and errors, fixes them, and creates pull requests with the fixes. It follows strict quality standards where build/lint warnings are treated as fatal failures.

## Features

- **Zero Tolerance for Warnings**: Build and lint warnings are treated as fatal errors
- **Branch Discipline**: Always sync with main before creating PRs
- **Comprehensive Fixes**: Fix root causes, not just symptoms
- **Automated PRs**: Create/update PRs with detailed descriptions

## Quick Start

### Run the Bug Scanner

```bash
npm run bug:scan
```

### Run the Full BugFixer Workflow

```bash
npm run bugfixer:workflow
```

## Workflow Steps

1. **Environment Check**: Verify git repository and branch status
2. **Sync with Main**: Fetch and pull latest changes from main
3. **Create Fix Branch**: Create timestamped branch for fixes
4. **Run Diagnostics**: Execute lint, type-check, tests, and build
5. **Analyze Results**: Identify issues that need fixing
6. **Fix Issues**: Implement minimal fixes for each problem
7. **Verify Fixes**: Re-run diagnostics to confirm fixes work
8. **Create PR**: Push changes and create pull request

## Error Categories

### Fatal Errors (Must Fix)

- **TypeScript Errors**: `tsc --noEmit` failures
- **ESLint Errors**: linting rule violations
- **Test Failures**: Jest test failures
- **Build Failures**: `next build` errors

### Warning as Fatal

- **ESLint Warnings**: Treated as errors with `--max-warnings=0`
- **TypeScript Warnings**: All warnings must be resolved
- **Test Warnings**: Deprecation warnings, console errors in tests

## Available Scripts

| Script                      | Description                             |
| --------------------------- | --------------------------------------- |
| `npm run bug:scan`          | Run comprehensive bug scanner           |
| `npm run bugfixer:workflow` | Run full BugFixer workflow              |
| `npm run lint`              | Run ESLint with zero warnings tolerance |
| `npm run lint:fix`          | Auto-fix lint issues                    |
| `npm run type-check`        | Run TypeScript type checking            |
| `npm run test:ci`           | Run tests in CI mode                    |
| `npm run build`             | Build the application                   |

## Branch Naming Convention

```
bugfix/YYYYMMDD-HHMMSS
```

Examples:

- `bugfix/20260829-143052`
- `bugfix/20260829-143052-auth-fix`

## Commit Message Format

```
fix: [Brief description]

- Fixed [specific issue]
- Added tests for [functionality]
- Verified all checks pass

AGENT=bugfixer
```

## PR Template

```markdown
## Bug Fix Summary

### Issue Fixed

[Description of the bug]

### Changes Made

- [Change 1]
- [Change 2]

### Verification

- [x] Linting passes
- [x] Type checking passes
- [x] All tests pass
- [x] Build succeeds
- [x] No new warnings introduced

### Related Issues

Closes #[issue-number]

---

_Created by BugFixer Agent_
```

## Troubleshooting

### Common Issues

#### Lint Errors

```bash
# Auto-fix lint issues
npm run lint:fix

# Check specific files
npx eslint src/path/to/file.ts
```

#### Type Errors

```bash
# Check specific file
npx tsc --noEmit src/path/to/file.ts

# Check all
npm run type-check
```

#### Test Failures

```bash
# Run specific test
npm test -- --testPathPattern=path/to/test

# Run with coverage
npm run test:coverage
```

#### Build Failures

```bash
# Clean build
rm -rf .next
npm run build
```

## Integration with CMZ

BugFixer integrates with CMZ (Cognitive Meta-Z) for:

- **Self-Heal**: Automatic error detection and recovery
- **Self-Learn**: Learning from past fixes to prevent recurrence
- **Self-Evolve**: Improving fix strategies over time

## Version

BugFixer v1.0.0 - Initial release

---

_BugFixer Agent - Keeping the repository bug-free_
