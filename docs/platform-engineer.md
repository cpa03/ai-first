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

## Recent Work

- PR #1789: feat(ci): integrate circular dependency check into CI pipeline
  - Addresses issue #1779
    WP| - Note: workflow file needs manual addition due to GitHub App permission restriction
    #HB|
    #BM|- PR #1797: feat(ci): implement pre-commit hooks for code quality enforcement
    #JM| - Addresses issue #1778
    #QM| - Added husky and lint-staged for pre-commit hooks
    #BS| - ESLint and Prettier run on staged files before commit
