# DX Engineer - Long-term Memory

## Overview

DX-engineer focuses on improving Developer Experience through small, safe, measurable improvements to the development workflow, tooling, and documentation.

## Workflow

### Phase 1: INITIATE

- Check for existing open PRs with DX-engineer label
- If PR exists: ensure up to date, review, fix if needed, comment
- If no PR but issues exist: pick best candidate and execute
- If none: proactive scan limited to domain → create/update PR

### Phase 2: PLAN

- Analyze issue and understand the problem
- Identify scope - keep changes small and atomic
- Plan the implementation

### Phase 3: IMPLEMENT

- Make targeted changes
- Keep diff small and focused

### Phase 4: VERIFY

- Run lint, type-check, and tests
- Ensure no regressions

### Phase 5: SELF-REVIEW

- Review the process
- Identify what went well and what could improve

### Phase 6: SELF-EVOLVE

- Check other agents' long-term memory for improvements
- Update docs/DX-engineer.md with learnings

### Phase 7: DELIVER

- Create PR with DX-engineer label
- Link to issue
- Ensure build/lint/test success

## Common DX Improvements

### npm Scripts

- Script names should accurately reflect functionality
- Use clear, descriptive names (e.g., `build:verify` over `broc`)
- Ensure `:check` variants are consistent
- Test script patterns should match their names

### Documentation

- Keep documentation up to date with code
- Clear setup instructions
- Consistent environment variable references

### Tooling

- Pre-commit hooks for code quality
- Clear error messages
- Helpful validation scripts

## Past Work

### PR #1771 - Standardize npm script naming

**Date**: 2026-02-25

**Changes**:

1. Renamed `test:unit` → `test:comprehensive` (script runs comprehensive tests, not unit tests)
2. Fixed `test:coverage` to save local coverage (removed pipe to coveralls)
3. Renamed `broc` → `build:verify` (unclear acronym → descriptive name)
4. Updated `test:all` to use new script name

XZ|### PR #1829 - Fix Test Files TypeScript Errors

YH|**Date**: 2026-02-25

XV|**Changes**:

RQ|1. Replaced 6 occurrences of `(process.env as any).NODE_ENV` in `tests/auth.test.ts`
BJ|2. Used existing `setProcessEnv` helper from `tests/utils/_testHelpers`
WW|3. Properly handles read-only property assignment for NODE_ENV

YZ|**Issues Fixed**: #1810

TJ|## Lessons Learned

MP|1. **Small atomic changes** - Keep PRs focused and small
WY|2. **Verify before commit** - Always run lint/type-check before pushing
RK|3. **Link issues** - Always link PR to relevant issues
NJ|4. **Clear naming** - Script names should be self-documenting
QT|5. **Use existing helpers** - Check for existing utility functions before implementing new solutions
