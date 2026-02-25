# DX Engineer Guide

## Overview

This guide provides comprehensive information for Developer Experience (DX) Engineers working on the IdeaFlow project. It covers tooling, workflow optimization, documentation standards, and best practices for creating an exceptional developer experience.

## Table of Contents

- [Philosophy](#philosophy)
- [Developer Environment Setup](#developer-environment-setup)
- [Build & Test Workflow](#build--test-workflow)
- [Documentation Standards](#documentation-standards)
- [Common DX Improvements](#common-dx-improvements)
- [Troubleshooting](#troubleshooting)
- [Checklists](#checklists)

---

## Philosophy

### Core Principles

1. **Speed Matters**: Developers should spend time building, not waiting
2. **Clarity Over Brevity**: Clear error messages and documentation save hours of debugging
3. **Consistency is Key**: Follow established patterns and conventions
4. **Automation First**: If it can be automated, it should be
5. **Documentation as Code**: Docs live with the code and are always up-to-date

### DX Quality Metrics

| Metric                  | Target   | How to Measure                              |
| ----------------------- | -------- | ------------------------------------------- |
| Time to First Commit    | < 15 min | From `git clone` to first successful commit |
| Build Time              | < 60 sec | `npm run build` execution time              |
| Test Suite Time         | < 30 sec | Full test suite execution                   |
| Lint/Type Check Time    | < 10 sec | Combined lint and type-check                |
| Documentation Coverage  | 100%     | All public APIs documented                  |
| Onboarding Task Success | 100%     | New developers complete setup without help  |

---

## Developer Environment Setup

### Prerequisites

| Tool    | Version | Installation                               |
| ------- | ------- | ------------------------------------------ |
| Node.js | 18+     | `nvm install 18 && nvm use 18`             |
| npm     | 9+      | Comes with Node.js                         |
| Git     | 2.x     | System package manager                     |
| VS Code | Latest  | [Download](https://code.visualstudio.com/) |

### Quick Start Script

```bash
# Clone and setup in one command
git clone https://github.com/cpa03/ai-first.git && cd ai-first && npm install && cp config/.env.example .env.local
```

### Environment Validation

The project includes an environment validation script:

```bash
# Full validation
npm run env:check

# Quick check (required vars only)
npm run env:check -- --quick

# CI mode (strict, exits on error)
npm run env:check -- --ci
```

### VS Code Setup

**Recommended Extensions (auto-suggested):**

- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`)
- TypeScript Nightly (`ms-vscode.vscode-typescript-next`)

**Settings (`.vscode/settings.json`):**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```

---

## Build & Test Workflow

### Available Scripts

| Script                 | Purpose                         | Time    |
| ---------------------- | ------------------------------- | ------- |
| `npm run dev`          | Start development server        | ~5 sec  |
| `npm run dev:check`    | Dev server with env validation  | ~6 sec  |
| `npm run build`        | Production build                | ~45 sec |
| `npm run lint`         | ESLint (0 warnings allowed)     | ~3 sec  |
| `npm run lint:fix`     | ESLint with auto-fix            | ~3 sec  |
| `npm run type-check`   | TypeScript check                | ~5 sec  |
| `npm test`             | Run tests                       | ~25 sec |
| `npm run test:watch`   | Test watch mode                 | N/A     |
| `npm run test:changed` | Run only changed tests          | ~5 sec  |
| `npm run test:ci`      | CI mode tests with coverage     | ~30 sec |
| `npm run check`        | All checks (lint + type + test) | ~40 sec |
| `npm run env:check`      | Validate environment variables  | ~1 sec  |
| `npm run docs:check-links` | Validate documentation links  | ~2 sec  |
| `npm run security:check` | Run security audit script       | ~5 sec  |
| `npm run scan:console`   | Scan for console statements     | ~2 sec  |
| `npm run analyze`        | Bundle analysis with webpack    | ~60 sec |

### Pre-Commit Workflow

Before committing, always run:

```bash
npm run check
```

This ensures:

- Lint passes (0 errors, 0 warnings)
- TypeScript compiles without errors
- All tests pass

### Jest Configuration

**Location:** `jest.config.js`

**Key Settings:**

```javascript
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['<rootDir>/tests/**/*.{js,jsx,ts,tsx}'],
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
};
```

**Test Organization:**

```
tests/
├── backend-comprehensive.test.ts    # Backend service tests
├── frontend-comprehensive.test.ts   # Frontend component tests
├── integration-comprehensive.test.ts # Integration tests
├── e2e-comprehensive.test.ts        # E2E tests
├── resilience.test.ts               # Resilience framework tests
└── utils/                           # Test utilities and fixtures
```

### Force Exit Warning

If you see `Force exiting Jest`, there are async operations not being cleaned up:

```bash
# Detect open handles
npm run test:ci -- --detectOpenHandles

# Common causes:
# - Unclosed database connections
# - Pending timers
# - Unresolved promises
```

---

## Documentation Standards

### File Structure

```
docs/
├── README.md              # Documentation index (always up-to-date)
├── architecture.md        # Technical architecture
├── api.md                 # API reference
├── [role]-engineer.md     # Specialist guides
├── user-stories/          # User story documentation
└── templates/             # Document templates
```

### Documentation Checklist

Every feature should have:

- [ ] **README entry** - Listed in `docs/README.md`
- [ ] **Code comments** - Complex logic explained
- [ ] **JSDoc types** - TypeScript interfaces documented
- [ ] **API examples** - Request/response examples
- [ ] **Error documentation** - What errors can occur

### JSDoc Standards

````typescript
/**
 * Creates a new idea in the database.
 *
 * @param input - The idea creation input
 * @param input.title - The title of the idea (required, 10-100 chars)
 * @param input.description - Optional description
 * @returns The created idea with generated ID
 * @throws {ValidationError} If title is missing or invalid
 * @throws {DatabaseError} If database operation fails
 *
 * @example
 * ```typescript
 * const idea = await createIdea({
 *   title: 'My Great Idea',
 *   description: 'A detailed description'
 * });
 * console.log(idea.id); // 'uuid-here'
 * ```
 */
export async function createIdea(input: CreateIdeaInput): Promise<Idea> {
  // ...
}
````

### README Updates

When adding new features, update `docs/README.md`:

```markdown
## New Feature Category

- [Feature Name](./path/to/doc.md) - Brief description
```

---

## Common DX Improvements

### 1. Add Missing Scripts

**Problem:** Developers need to remember complex commands

**Solution:** Add npm scripts

```json
{
  "scripts": {
    "lint:fix": "eslint src tests --fix",
    "test:changed": "jest --onlyChanged",
    "db:reset": "supabase db reset",
    "db:seed": "tsx scripts/seed-database.ts"
  }
}
```

### 2. Improve Error Messages

**Bad:**

```typescript
throw new Error('Invalid input');
```

**Good:**

```typescript
throw new ValidationError('Invalid input', [
  { field: 'title', message: 'Title must be 10-100 characters' },
  {
    field: 'description',
    message: 'Description cannot exceed 10000 characters',
  },
]);
```

### 3. Add Environment Validation

**Problem:** Cryptic errors from missing env vars

**Solution:** Use `scripts/validate-env.sh` or add runtime checks:

```typescript
// src/lib/config/environment.ts
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
```

### 4. Add Type Exports

**Problem:** Types not accessible to consumers

**Solution:** Export types from barrel file:

```typescript
// src/types/index.ts
export type { Idea, CreateIdeaInput, UpdateIdeaInput } from './idea';
export type { User, UserPreferences } from './user';
```

### 5. Add Development Tools

**Useful additions:**

```bash
# Check for console.log statements
npm run scan:console

# Run lighthouse audit
npm run audit:lighthouse

# Combined check
npm run broc
```

### 6. Add GitHub PR Templates

**Problem:** Inconsistent PR descriptions make code review difficult

**Solution:** Add PR template in `.github/PULL_REQUEST_TEMPLATE.md`:

```yaml
---
name: Pull Request Template
about: Standard PR template for the IdeaFlow repository
title: ''
labels: ''
assignees: ''
---

## Summary
<!-- Brief description of changes -->

## Type of Change
- [ ] feat - New feature
- [ ] fix - Bug fix
- [ ] docs - Documentation changes
- [ ] refactor - Code refactoring
- [ ] test - Adding tests

## Testing Performed
- [ ] Unit tests pass
- [ ] Lint passes
- [ ] Type-check passes
```

---

## Troubleshooting

### Common Issues

#### Module Not Found

```bash
# Clear caches and reinstall
rm -rf node_modules package-lock.json .next
npm install
```

#### Type Errors After Pull

```bash
# Regenerate types
npm run type-check

# If persists, clear TypeScript cache
rm -rf node_modules/.cache
```

#### Test Failures

```bash
# Clear Jest cache
npm run test:ci -- --clearCache

# Run specific test
npm test -- --testPathPattern="test-name"
```

#### Environment Variables Not Loading

1. Check `.env.local` exists in project root
2. Restart development server after changes
3. Verify variable names match exactly (case-sensitive)

#### Lint Warnings

```bash
# Auto-fix what's possible
npm run lint -- --fix

# Check specific file
npx eslint src/path/to/file.ts
```

### Debug Mode

Enable verbose logging:

```bash
# Debug build
DEBUG=* npm run build

# Debug tests
DEBUG=* npm test

# Debug lint
DEBUG=eslint:* npm run lint
```

---

## Checklists

### Onboarding Checklist

For new developers:

- [ ] Node.js 18+ installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables configured (`.env.local`)
- [ ] Environment validation passes (`npm run env:check`)
- [ ] Development server starts (`npm run dev:check`)
- [ ] Tests pass (`npm run test:ci`)
- [ ] Build succeeds (`npm run build`)
- [ ] VS Code extensions installed
- [ ] Documentation read (README, CONTRIBUTING, AGENTS.md)

### Pre-PR Checklist

Before creating a pull request:

- [ ] All checks pass (`npm run check`)
- [ ] Lint: 0 errors, 0 warnings
- [ ] Type check: 0 errors
- [ ] Tests: All pass
- [ ] Build: Successful
- [ ] Documentation updated (if applicable)
- [ ] CHANGELOG.md updated (if applicable)
- [ ] PR description complete

### Weekly DX Audit

Weekly review for DX improvements:

- [ ] Check build times (should be < 60s)
- [ ] Check test times (should be < 30s)
- [ ] Review new lint warnings
- [ ] Update dependencies if needed
- [ ] Check for outdated documentation
- [ ] Review developer feedback/issues
- [ ] Test onboarding experience

---

## Resources

- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
- [Architecture](./architecture.md) - Technical architecture
- [API Reference](./api.md) - API documentation
- [Troubleshooting](./troubleshooting.md) - Common issues
- [Environment Setup](./environment-setup.md) - Detailed setup guide

---

## Contact

For DX improvements or questions:

- Create issue with `dx-engineer` label
- Check existing issues for DX improvements
- Propose improvements in team discussions

---

_Maintained with care for developer happiness_
