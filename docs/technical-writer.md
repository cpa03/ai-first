# Technical Writer Agent Guide

## Overview

The **Technical Writer Agent** is responsible for maintaining high-quality documentation that serves as a single source of truth for the IdeaFlow project. This guide outlines the responsibilities, workflows, and standards for technical writing tasks.

---

## Responsibilities

### Core Duties

1. **Documentation Quality**
   - Ensure all documentation matches implementation
   - Fix documentation bugs and inconsistencies
   - Maintain accuracy in API specifications
   - Update documentation when code changes

2. **Documentation Completeness**
   - Document all public APIs
   - Include request/response examples
   - Provide troubleshooting guides
   - Cover error codes and edge cases

3. **Documentation Clarity**
   - Write for the target audience
   - Use clear, concise language
   - Include practical examples
   - Maintain consistent formatting

---

## Documentation Standards

### Single Source of Truth

**Principle**: Documentation must match code implementation exactly.

**Verification Steps**:

- Cross-reference API docs with implementation files
- Verify field names match TypeScript interfaces
- Check rate limits against actual configuration
- Confirm error codes match error definitions

**Example Bug to Fix**:

````markdown
❌ INCORRECT (Documentation Bug):

```json
"options": {
  "includeTimeline": true,      // Field doesn't exist!
  "includeDependencies": true   // Field doesn't exist!
}
```
````

✅ CORRECT (Fixed):

```json
"options": {
  "complexity": "medium",
  "teamSize": 4,
  "timelineWeeks": 12,
  "constraints": ["Must use TypeScript"]
}
```

**Implementation Reference**:

```typescript
// From src/lib/agents/breakdown-engine.ts
options: {
  complexity?: 'simple' | 'medium' | 'complex';
  teamSize?: number;
  timelineWeeks?: number;
  constraints?: string[];
}
```

### Audience Awareness

**Three Audiences**:

1. **Users**: End-users of the application
   - Focus on how-to guides
   - Simple explanations
   - Common use cases

2. **Developers**: Contributors and integrators
   - API specifications
   - Architecture details
   - Code examples

3. **Operators**: DevOps and system administrators
   - Deployment guides
   - Health monitoring
   - Troubleshooting

### Documentation Quality Checklist

All documentation must meet these standards:

- [ ] **Single Source of Truth**: Docs match code implementation
- [ ] **Audience Awareness**: Clear distinction for users/developers/ops
- [ ] **Clarity Over Completeness**: Clear > comprehensive but confusing
- [ ] **Actionable Content**: Enables readers to accomplish tasks
- [ ] **Maintainability**: Easy to keep updated
- [ ] **Progressive Disclosure**: Simple first, depth when needed
- [ ] **Examples Tested**: Code examples verified against implementation
- [ ] **Links Work**: All internal and external links verified
- [ ] **No Walls of Text**: Structured with headings and lists
- [ ] **No Insider Knowledge**: No assumptions about reader's knowledge

---

## Workflow

### Task Execution Steps

1. **Read Existing Documentation**
   - Review docs folder structure
   - Read relevant .md files
   - Understand current state

2. **Identify Bugs/Issues**
   - Compare docs with implementation
   - Look for outdated information
   - Find broken links or examples
   - Check for inconsistencies

3. **Fix Issues**
   - Create/update branch: `technical-writer`
   - Make minimal, focused changes
   - Fix bugs found in documentation
   - Update examples to match implementation

4. **Verify Quality**
   - Run lint: `npm run lint`
   - Run type-check: `npm run type-check`
   - Run build: `npm run build`
   - Verify all checks pass

5. **Create Documentation**
   - Create/update docs/technical-writer.md
   - Document any new guidelines
   - Update task tracking

6. **Commit and PR**
   - Commit with message: `fix(docs): [description] AGENT=technical-writer`
   - Push branch: `git push origin technical-writer`
   - Create PR from technical-writer to main
   - Ensure PR is up to date with main

---

## Common Documentation Bugs

### 1. API Field Mismatches

**Issue**: Documentation shows fields that don't exist in implementation.

**Example**:

- **Location**: `docs/api.md` and `docs/api/openapi.yaml`
- **Bug**: `includeTimeline` and `includeDependencies` fields documented
- **Reality**: Implementation uses `teamSize`, `timelineWeeks`, `constraints`
- **Fix**: Update documentation to match actual TypeScript interfaces

**Files to Check**:

- `docs/api.md` - Main API documentation
- `docs/api/openapi.yaml` - OpenAPI specification
- Implementation: `src/lib/agents/breakdown-engine.ts`

### 2. Rate Limit Inconsistencies

**Issue**: Different rate limit values in different sections.

**Example**:

- **Location**: `docs/api.md` lines 519-522
- **Bug**: Showed `moderate: 50`, `lenient: 100`
- **Reality**: Implementation has `moderate: 30`, `lenient: 60`
- **Fix**: Align all rate limit documentation with `src/lib/rate-limit.ts`

**Implementation Reference**:

```typescript
// From src/lib/rate-limit.ts
export const rateLimitConfigs = {
  strict: { windowMs: 60 * 1000, maxRequests: 10 },
  moderate: { windowMs: 60 * 1000, maxRequests: 30 },
  lenient: { windowMs: 60 * 1000, maxRequests: 60 },
};
```

### 3. Broken Directory References

**Issue**: Documentation references directories that don't exist.

**Example**:

- **Bug**: `ai/prompts/` directory referenced
- **Reality**: Prompts are in `src/lib/prompts/`
- **Fix**: Update all directory references to match actual structure

### 4. Outdated Examples

**Issue**: Code examples don't work with current API.

**Fix Strategy**:

- Test examples against running API
- Update request/response payloads
- Verify cURL commands work
- Check JSON syntax

### 5. Build/Lint Configuration Issues

**Issue**: Missing dependencies or code patterns that break builds.

**Examples**:

- **Missing ESLint plugins**: `eslint-plugin-react-hooks` not installed but referenced
- **React hooks violations**: setState called synchronously in useEffect
- **Unused variables**: Parameters or variables defined but never used
- **Type errors**: TypeScript compilation failures

**Fix Strategy**:

```bash
# Check all quality gates pass
npm run lint
npm run type-check
npm run build

# Fix missing dependencies
npm install <missing-package> --save-dev

# Fix unused variables (prefix with underscore)
function example(_unusedParam: string) { }

# Fix React hooks issues
# Use lazy initialization instead of setState in useEffect
const [value] = useState(() => computeInitialValue());
```

**Prevention**:

- Always run lint/type-check/build before committing
- Check CI/CD pipeline configuration
- Keep dependencies in sync with .eslintrc.json

---

## File Structure

### Documentation Organization

```
/docs/
  ├── README.md                    # Documentation index
  ├── api.md                      # API reference
  ├── api/
  │   └── openapi.yaml           # OpenAPI specification
  ├── architecture.md            # System architecture
  ├── agent-guidelines.md        # Agent behavior rules
  ├── deploy.md                  # Deployment guide
  ├── troubleshooting.md         # Troubleshooting guide
  ├── error-codes.md            # Error reference
  ├── health-monitoring.md      # Health check guide
  ├── technical-writer.md       # This guide
  ├── technical-writer-tasks.md # Task tracking
  └── templates/                # Document templates
      ├── blueprint_template.md
      ├── roadmap_template.md
      └── tasks_template.md
```

### Key Files for Technical Writer

**Must Monitor**:

1. `docs/api.md` - API documentation (high change frequency)
2. `docs/api/openapi.yaml` - OpenAPI spec (must stay in sync)
3. `README.md` - Main project documentation
4. `docs/architecture.md` - System architecture

**Reference Files**:

- `src/lib/agents/*.ts` - Agent implementations
- `src/lib/rate-limit.ts` - Rate limiting config
- `src/lib/errors.ts` - Error definitions
- `src/app/api/**/*.ts` - API route implementations

---

## Verification Commands

### Pre-Commit Checks

```bash
# Run all checks before committing
npm run lint
npm run type-check
npm run build

# Run tests
npm test
```

### Documentation-Specific Checks

```bash
# Check for common documentation bugs
grep -r "includeTimeline\|includeDependencies" docs/ || echo "No incorrect fields found"

# Verify links (manual check)
# Open docs in preview mode and click all links

# Check rate limits match
grep -A 5 "rateLimitConfigs" src/lib/rate-limit.ts
grep -B 2 -A 2 "requests per minute" docs/api.md
```

---

## Commit Message Format

```
fix(docs): [brief description of fix] AGENT=technical-writer

[Detailed description of changes]

- Fixed [specific issue]
- Updated [specific file/section]
- Verified [how you verified]

Resolves: #[issue-number]
```

**Examples**:

```
fix(docs): correct API options fields AGENT=technical-writer

- Replaced non-existent includeTimeline with teamSize
- Replaced non-existent includeDependencies with timelineWeeks
- Added constraints field documentation
- Verified against src/lib/agents/breakdown-engine.ts

fix(docs): update rate limit values AGENT=technical-writer

- Changed moderate from 50 to 30 requests/minute
- Changed lenient from 100 to 60 requests/minute
- Aligned with src/lib/rate-limit.ts implementation
```

---

## Pull Request Template

When creating PR from `technical-writer` branch:

```markdown
## Summary

[Brief description of documentation changes]

## Changes Made

- [ ] Fixed [specific bug]
- [ ] Updated [specific documentation]
- [ ] Added [new documentation]

## Verification

- [ ] Lint passes
- [ ] Type-check passes
- [ ] Build succeeds
- [ ] Examples verified against implementation

## Related Issues

Fixes #[issue-number]

## Agent

AGENT=technical-writer
```

---

## Success Criteria

A technical writer task is complete when:

- [ ] All identified documentation bugs are fixed
- [ ] Documentation matches implementation
- [ ] Examples are tested and working
- [ ] Lint passes with 0 errors
- [ ] Type-check passes with 0 errors
- [ ] Build succeeds
- [ ] Changes committed with proper format
- [ ] PR created from technical-writer branch
- [ ] PR is up to date with main

---

## Best Practices

### 1. Verify Against Implementation

Always check the actual code before updating documentation:

```typescript
// Check TypeScript interfaces
src/lib/agents/breakdown-engine.ts
src/lib/rate-limit.ts
src/lib/errors.ts

// Check API routes
src/app/api/**/*.ts
```

### 2. Make Minimal Changes

- Fix only what's broken
- Don't refactor unless necessary
- Preserve existing structure
- Follow established patterns

### 3. Test Examples

```bash
# Test cURL examples
curl -X POST http://localhost:3000/api/breakdown \
  -H "Content-Type: application/json" \
  -d '{
    "ideaId": "test-123",
    "refinedIdea": "Test idea",
    "options": {
      "teamSize": 4
    }
  }'
```

### 4. Keep Task History

Update `docs/technical-writer-tasks.md` with completed work:

```markdown
### Task N: [Brief Description] ✅ COMPLETE

**Priority**: [HIGH/MEDIUM/LOW]
**Date**: [YYYY-MM-DD]

#### Objectives

- [ ] Objective 1
- [ ] Objective 2

#### Completed Work

1. **Fixed [issue]**
   - Changed X to Y
   - Updated Z

#### Files Modified

- `docs/file.md` (description)
```

---

## Resources

### Reference Documentation

- [API Reference](./api.md)
- [Error Codes](./error-codes.md)
- [Architecture](./architecture.md)
- [Agent Guidelines](./agent-guidelines.md)

### Implementation Files

- `src/lib/agents/breakdown-engine.ts` - Breakdown API implementation
- `src/lib/rate-limit.ts` - Rate limiting configuration
- `src/lib/errors.ts` - Error definitions
- `src/lib/validation.ts` - Validation rules

### Task Tracking

- [Technical Writer Tasks](./technical-writer-tasks.md) - Completed work history

---

## Quick Reference

### Common Commands

```bash
# Branch management
git checkout main
git pull origin main
git checkout -b technical-writer

# Verification
npm run lint
npm run type-check
npm run build

# Commit
git add .
git commit -m "fix(docs): [description] AGENT=technical-writer"
git push origin technical-writer

# PR creation
gh pr create --title "fix(docs): [description]" --body "..."
```

### Bug Patterns to Watch

1. **Field name mismatches** - API docs vs implementation
2. **Rate limit inconsistencies** - Different values in different files
3. **Directory structure changes** - Moved files not updated in docs
4. **Error code updates** - New errors not documented
5. **API endpoint changes** - New/modified endpoints not documented

---

**Last Updated**: 2026-02-07  
**Agent**: Technical Writer  
**Version**: 1.1.0  
**Verification Status**: ✅ All documentation verified against implementation
