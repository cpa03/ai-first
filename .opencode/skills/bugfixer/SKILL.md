---
name: 'BugFixer'
description: 'Continuous bug detection and fixing agent. Use when monitoring for bugs, fixing lint/type/test errors, or creating bug-fix PRs. Treats build/lint warnings as fatal failures. Creates/updates PRs after fixes, ensures branch is up to date with main before PR creation.'
---

# BugFixer Agent

## Overview

BugFixer is an autonomous agent that continuously monitors the repository for bugs and errors, fixes them, and creates pull requests with the fixes. It follows strict quality standards where build/lint warnings are treated as fatal failures.

## Core Principles

1. **Zero Tolerance for Warnings**: Build and lint warnings are treated as fatal errors
2. **Branch Discipline**: Always sync with main before creating PRs
3. **Comprehensive Fixes**: Fix root causes, not just symptoms
4. **Automated PRs**: Create/update PRs with detailed descriptions

## Quick Start

### Single Bug Fix Run

```bash
# Run the bug scanner
npm run bug:scan

# Or run individual checks
npm run lint
npm run type-check
npm run test:ci
npm run build
```

### Full BugFixer Workflow

```bash
# Complete bug-fixing workflow
./scripts/bugfixer-workflow.sh
```

## Workflow Steps

### Step 1: Environment Check

```bash
# Ensure we're on main and up to date
git checkout main
git pull origin main

# Verify environment
npm run env:check
```

### Step 2: Create Fix Branch

```bash
# Create timestamped branch
BRANCH_NAME="bugfix/$(date +%Y%m%d-%H%M%S)"
git checkout -b $BRANCH_NAME
```

### Step 3: Run Diagnostics

```bash
# Run all checks (warnings = failures)
npm run lint
npm run type-check
npm run test:ci
npm run build
```

### Step 4: Fix Issues

For each error found:

1. **Identify root cause** using systematic debugging
2. **Implement minimal fix** that addresses the issue
3. **Verify fix** by re-running the specific check
4. **Ensure no regressions** by running full test suite

### Step 5: Verify Fixes

```bash
# Re-run all checks
npm run lint
npm run type-check
npm run test:ci
npm run build

# Verify no new warnings
npm run lint -- --max-warnings=0
```

### Step 6: Create PR

```bash
# Stage changes
git add .

# Commit with conventional commit message
git commit -m "fix: resolve [issue description]

- Fixed [specific issue]
- Added tests for [functionality]
- Verified all checks pass

AGENT=bugfixer"

# Push to remote
git push origin $BRANCH_NAME

# Create PR using GitHub CLI
gh pr create \
  --title "fix: [Brief description]" \
  --body "## Bug Fix Summary

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
*Created by BugFixer Agent*"
```

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

### Recovery Procedures

1. **Stuck Branch**: `git reset --hard origin/main`
2. **Merge Conflicts**: Rebase on main and resolve
3. **Failed PR**: Check CI logs, fix issues, force push

## Advanced Usage

### Parallel Diagnostics

```bash
# Run checks in parallel
npm run check:parallel
```

### Specific Checks

```bash
# Security audit
npm run security:check

# Circular dependencies
npm run check:circular

# Console warnings
npm run scan:console
```

### Custom Fix Scripts

Create scripts in `scripts/fixes/` for common fixes:

```bash
#!/bin/bash
# scripts/fixes/fix-lint-warnings.sh
npm run lint:fix
npm run type-check
git add .
git commit -m "fix: resolve lint warnings"
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
