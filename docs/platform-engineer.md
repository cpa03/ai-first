# Platform Engineer Documentation

## Overview

This document serves as the long-term memory for the platform-engineer agent.

## Domain

Platform engineering - focuses on developer tools, CI/CD, infrastructure, and developer experience improvements.

## Agent Responsibilities

- Deliver small, safe, measurable improvements
- Create PRs with platform-engineer label
- Link PRs to issues
- Ensure PRs are up to date with default branch
- Ensure build/lint/test success with ZERO warnings

## Known Issues & Limitations

### GitHub App Permission Restriction

The GitHub Actions runner uses a GH_TOKEN from a GitHub App that does NOT have "workflows" permission. This means:

- Cannot push workflow files (`.github/workflows/*.yml`) directly
- Cannot modify existing workflow files
- Cannot use GitHub API to create/update workflow files

**Workaround:**

- Create PR with placeholder commit
- Include workflow file content in PR description
- Note the limitation in PR body
- Or use a different authentication method with workflows permission

## Common Platform Engineering Tasks

1. CI/CD pipeline improvements
2. Pre-commit hooks setup
3. Build optimization
4. Developer tooling
5. Infrastructure as code

## Useful Scripts

- `npm run check:circular` - Check for circular dependencies
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run test:ci` - Run tests in CI mode

## Issue Labels

- `platform-engineer` - Platform engineering tasks
- `ci` - CI/CD related issues
- `DX-engineer` - Developer experience issues

## PR Requirements

- Label: platform-engineer
- Linked to issue
- Up to date with default branch
- No conflict
- Build/lint/test success
- ZERO warnings
- Small atomic diff

XS|- **2026-02-26**: Discovered corrupted content in `.github/workflows/test-unified-workflow.yml`
#QB| - File had 3 invalid lines at end (lines 308-310) containing metadata markers
#QM| - These lines caused YAML parsing errors in validate-ci-config.js
#HB| - FIX: Remove lines 308-310 from the file
#YM| - NOTE: Cannot push workflow changes due to GitHub App permission restriction
#QP| - Workaround: Manual fix required or use different authentication
#BQ|
#ZB|- PR #1873: feat(platform): update Node.js engine requirement to >=20.0.0

- PR #1873: feat(platform): update Node.js engine requirement to >=20.0.0
  - Aligns package.json engines field with CI pipeline (Node 20)
  - Matches .nvmrc file for local development consistency
  - Prevents developers from using Node 18 which may have compatibility issues

- PR #1789: feat(ci): integrate circular dependency check into CI pipeline
  - Addresses issue #1779
  - Note: workflow file needs manual addition due to GitHub App permission restriction

- PR #1797: feat(ci): implement pre-commit hooks for code quality enforcement
  - Addresses issue #1778
  - Added husky and lint-staged for pre-commit hooks
  - ESLint and Prettier run on staged files before commit

- CI Optimization (issue #1828):
  - Added npm caching using actions/setup-node built-in cache
  - Added Next.js build cache (.next/cache) for all 5 jobs
  - Removed duplicate Install Node.js steps
  - Expected savings: 40-60% reduction in CI time

- PR #XXXX: fix(platform): improve circular dependency detection accuracy
  - Addresses issue #1846
  - Added --ts-config tsconfig.json to madge for proper path alias resolution
  - Fixed false negative: script now correctly detects 5 circular dependencies
  - Changed arrow check from Unicode → to ASCII > for proper detection
  - Eliminated 63 parse warnings by properly resolving TypeScript config
  - WARNING: CI will now fail until existing circular deps are fixed
