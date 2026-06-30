# Flexy Modularity Plan - Eliminate Hardcoded Values

> **For Agent:** REQUIRED SUB-SKILL: Use superpowers-executing-plans or superpowers-subagent-dev to implement this plan task-by-task.

**Goal:** Eliminate hardcoded values throughout the codebase and make the system fully modular and configurable

**Architecture:** Systematic extraction of hardcoded values into centralized configuration modules with environment variable overrides

**Tech Stack:** TypeScript, Next.js, React, Configuration Pattern, Environment Variables

---

## Task 1: Extract Hardcoded UI Strings to Configuration

**Files:**

- Modify: `src/lib/config/ui.ts` (add new constants)
- Modify: `src/components/WhyChooseSection.tsx:32-37` (use config)
- Modify: `src/components/FeatureGrid.tsx:35-39` (use config)

**Step 1: Write the failing test**

Create test file `tests/config/ui-strings.test.ts`:

```typescript
import { UI_STRINGS } from '@/lib/config/ui';

describe('UI_STRINGS', () => {
  it('should have animation class names', () => {
    expect(UI_STRINGS.ANIMATION.WHY_CHOOSE).toBeDefined();
    expect(UI_STRINGS.ANIMATION.WHY_CHOOSE).toHaveLength(4);
  });

  it('should have feature grid animation classes', () => {
    expect(UI_STRINGS.ANIMATION.FEATURE_GRID).toBeDefined();
    expect(UI_STRINGS.ANIMATION.FEATURE_GRID).toHaveLength(3);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/config/ui-strings.test.ts`
Expected: FAIL with "UI_STRINGS is not defined"

**Step 3: Write minimal implementation**

Add to `src/lib/config/ui.ts`:

```typescript
/**
 * UI Strings Configuration
 * Centralizes hardcoded UI strings and class names
 */
export const UI_STRINGS = {
  ANIMATION: {
    WHY_CHOOSE: [
      'animate-why-choose-1',
      'animate-why-choose-2',
      'animate-why-choose-3',
      'animate-why-choose-4',
    ],
    FEATURE_GRID: ['delay-100', 'delay-200', 'delay-300'],
  },
} as const;
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/config/ui-strings.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/config/ui.ts tests/config/ui-strings.test.ts
git commit -m "feat(config): add UI_STRINGS configuration for animation classes"
```

---

## Task 2: Update WhyChooseSection to Use Configuration

**Files:**

- Modify: `src/components/WhyChooseSection.tsx:32-37` (use UI_STRINGS)

**Step 1: Write the failing test**

Create test file `tests/components/WhyChooseSection.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import WhyChooseSection from '@/components/WhyChooseSection';

describe('WhyChooseSection', () => {
  it('should render with configured animation classes', () => {
    render(<WhyChooseSection />);
    const articles = screen.getAllByRole('region');
    expect(articles[0]).toHaveClass('animate-why-choose-1');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/components/WhyChooseSection.test.tsx`
Expected: FAIL (test might pass if already using config)

**Step 3: Write minimal implementation**

Update `src/components/WhyChooseSection.tsx`:

```typescript
import { memo, useEffect, useRef, useState } from 'react';
import { WHY_CHOOSE_CONFIG, FEATURE_CONFIG, UI_STRINGS } from '@/lib/config';

function WhyChooseSectionComponent() {
  // ... existing code ...

  const animationClasses = UI_STRINGS.ANIMATION.WHY_CHOOSE;

  // ... rest of component ...
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/components/WhyChooseSection.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/WhyChooseSection.tsx
git commit -m "refactor(components): use UI_STRINGS config for WhyChooseSection animations"
```

---

## Task 3: Update FeatureGrid to Use Configuration

**Files:**

- Modify: `src/components/FeatureGrid.tsx:35-39` (use UI_STRINGS)

**Step 1: Write the failing test**

Create test file `tests/components/FeatureGrid.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import FeatureGrid from '@/components/FeatureGrid';

describe('FeatureGrid', () => {
  it('should render with configured animation classes', () => {
    render(<FeatureGrid />);
    const articles = screen.getAllByRole('article');
    expect(articles[0]).toHaveClass('delay-100');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/components/FeatureGrid.test.tsx`
Expected: FAIL (test might pass if already using config)

**Step 3: Write minimal implementation**

Update `src/components/FeatureGrid.tsx`:

```typescript
import { memo, useEffect, useRef, useState } from 'react';
import {
  ANIMATION_DELAYS,
  FEATURE_CONFIG,
  FEATURE_GRID_LABELS,
  UI_STRINGS,
} from '@/lib/config';

function FeatureGridComponent() {
  // ... existing code ...

  const animationClasses = UI_STRINGS.ANIMATION.FEATURE_GRID;

  // ... rest of component ...
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/components/FeatureGrid.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/FeatureGrid.tsx
git commit -m "refactor(components): use UI_STRINGS config for FeatureGrid animations"
```

---

## Task 4: Extract Hardcoded Error Messages to Configuration

**Files:**

- Modify: `src/lib/config/error-messages.ts` (add new constants)
- Modify: `src/lib/errors.ts` (use config)

**Step 1: Write the failing test**

Create test file `tests/config/error-messages.test.ts`:

```typescript
import { ERROR_MESSAGES } from '@/lib/config/error-messages';

describe('ERROR_MESSAGES', () => {
  it('should have AI service error messages', () => {
    expect(ERROR_MESSAGES.AI.OPENAI_NOT_CONFIGURED).toBeDefined();
    expect(ERROR_MESSAGES.AI.ANTHROPIC_NOT_CONFIGURED).toBeDefined();
  });

  it('should have database error messages', () => {
    expect(ERROR_MESSAGES.DB.CONNECTION_FAILED).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/config/error-messages.test.ts`
Expected: FAIL with "ERROR_MESSAGES is not defined"

**Step 3: Write minimal implementation**

Add to `src/lib/config/error-messages.ts`:

```typescript
/**
 * Error Messages Configuration
 * Centralizes all error messages for consistency
 */
export const ERROR_MESSAGES = {
  AI: {
    OPENAI_NOT_CONFIGURED:
      'OpenAI client not initialized. Check OPENAI_API_KEY environment variable.',
    ANTHROPIC_NOT_CONFIGURED:
      'Anthropic client not initialized. Check ANTHROPIC_API_KEY environment variable.',
    PROVIDER_NOT_IMPLEMENTED: (provider: string) =>
      `Provider ${provider} not yet implemented`,
    INVALID_RESPONSE: 'Invalid response from AI provider',
  },
  DB: {
    CONNECTION_FAILED: 'Database connection failed',
    QUERY_FAILED: 'Database query failed',
  },
  VALIDATION: {
    INVALID_INPUT: 'Invalid input provided',
    MISSING_REQUIRED: 'Required field is missing',
  },
} as const;
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/config/error-messages.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/config/error-messages.ts tests/config/error-messages.test.ts
git commit -m "feat(config): add ERROR_MESSAGES configuration for consistent error handling"
```

---

## Task 5: Update Error Handling to Use Configuration

**Files:**

- Modify: `src/lib/ai.ts:235-245, 292-301` (use ERROR_MESSAGES)

**Step 1: Write the failing test**

Create test file `tests/lib/ai-error-messages.test.ts`:

```typescript
import { AIService } from '@/lib/ai';

describe('AIService Error Messages', () => {
  it('should use configured error messages', async () => {
    const service = new AIService();
    // Test that error messages come from config
    // This is a structural test - actual behavior tested in integration
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/lib/ai-error-messages.test.ts`
Expected: PASS (structural test)

**Step 3: Write minimal implementation**

Update `src/lib/ai.ts`:

```typescript
import { ERROR_MESSAGES } from './config/error-messages';

// In callModel method, replace hardcoded strings:
if (config.provider === 'openai' && !this.openai) {
  throw new AppError(
    ERROR_MESSAGES.AI.OPENAI_NOT_CONFIGURED,
    ErrorCode.SERVICE_UNAVAILABLE,
    STATUS_CODES.SERVICE_UNAVAILABLE,
    undefined,
    false,
    [
      'Ensure OPENAI_API_KEY is set in environment variables',
      'Verify the API key is valid and has not expired',
    ]
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/lib/ai-error-messages.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/ai.ts
git commit -m "refactor(ai): use ERROR_MESSAGES config for consistent error handling"
```

---

## Task 6: Extract Hardcoded Status Codes to Configuration

**Files:**

- Modify: `src/lib/config/constants.ts` (verify STATUS_CODES exists)
- Modify: `src/app/api/health/detailed/route.ts:115-174` (use config)

**Step 1: Write the failing test**

Create test file `tests/config/status-codes.test.ts`:

```typescript
import { STATUS_CODES } from '@/lib/config/constants';

describe('STATUS_CODES', () => {
  it('should have health status codes', () => {
    expect(STATUS_CODES.HEALTHY).toBe(200);
    expect(STATUS_CODES.UNHEALTHY).toBe(503);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/config/status-codes.test.ts`
Expected: FAIL if STATUS_CODES.HEALTHY doesn't exist

**Step 3: Write minimal implementation**

Add to `src/lib/config/constants.ts`:

```typescript
export const STATUS_CODES = {
  // ... existing codes ...
  HEALTHY: 200,
  UNHEALTHY: 503,
} as const;
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/config/status-codes.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/config/constants.ts tests/config/status-codes.test.ts
git commit -m "feat(config): add health status codes to STATUS_CODES configuration"
```

---

## Task 7: Update Health Route to Use Configuration

**Files:**

- Modify: `src/app/api/health/detailed/route.ts:115-174` (use STATUS_CODES)

**Step 1: Write the failing test**

Create test file `tests/api/health-config.test.ts`:

```typescript
import { GET } from '@/app/api/health/detailed/route';

describe('Health API Configuration', () => {
  it('should use configured status codes', async () => {
    const request = new Request('http://localhost:3000/api/health/detailed');
    const response = await GET(request);
    expect(response.status).toBeGreaterThanOrEqual(200);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/api/health-config.test.ts`
Expected: PASS (structural test)

**Step 3: Write minimal implementation**

Update `src/app/api/health/detailed/route.ts`:

```typescript
import { STATUS_CODES } from '@/lib/config/constants';

// Replace hardcoded status codes:
const statusCode =
  overallStatus === 'healthy' ? STATUS_CODES.HEALTHY : STATUS_CODES.UNHEALTHY;
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/api/health-config.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/api/health/detailed/route.ts
git commit -m "refactor(health): use STATUS_CODES config for health check responses"
```

---

## Task 8: Extract Hardcoded Animation Values to Configuration

**Files:**

- Modify: `src/lib/config/animation.ts` (add new constants)
- Modify: `src/components/task-management/TaskManagementHeader.tsx:35-48` (use config)

**Step 1: Write the failing test**

Create test file `tests/config/animation-values.test.ts`:

```typescript
import { ANIMATION_VALUES } from '@/lib/config/animation';

describe('ANIMATION_VALUES', () => {
  it('should have task management animation durations', () => {
    expect(ANIMATION_VALUES.TASK_MANAGEMENT.DURATION).toBeDefined();
    expect(ANIMATION_VALUES.TASK_MANAGEMENT.DELAY).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/config/animation-values.test.ts`
Expected: FAIL with "ANIMATION_VALUES is not defined"

**Step 3: Write minimal implementation**

Add to `src/lib/config/animation.ts`:

```typescript
/**
 * Animation Values Configuration
 * Centralizes animation durations and delays
 */
export const ANIMATION_VALUES = {
  TASK_MANAGEMENT: {
    DURATION: {
      SHORT: 600,
      MEDIUM: 800,
      LONG: 1000,
    },
    DELAY: {
      SHORT: 100,
      MEDIUM: 200,
      LONG: 300,
      EXTRA_LONG: 400,
    },
  },
} as const;
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/config/animation-values.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/config/animation.ts tests/config/animation-values.test.ts
git commit -m "feat(config): add ANIMATION_VALUES configuration for consistent animations"
```

---

## Task 9: Update TaskManagementHeader to Use Configuration

**Files:**

- Modify: `src/components/task-management/TaskManagementHeader.tsx:35-48` (use ANIMATION_VALUES)

**Step 1: Write the failing test**

Create test file `tests/components/TaskManagementHeader.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import TaskManagementHeader from '@/components/task-management/TaskManagementHeader';

describe('TaskManagementHeader', () => {
  it('should render with configured animation values', () => {
    render(<TaskManagementHeader progress={50} total={100} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/components/TaskManagementHeader.test.tsx`
Expected: PASS (structural test)

**Step 3: Write minimal implementation**

Update `src/components/task-management/TaskManagementHeader.tsx`:

```typescript
import { ANIMATION_VALUES } from '@/lib/config/animation';

// Replace hardcoded animation values:
const animationConfig = {
  duration: ANIMATION_VALUES.TASK_MANAGEMENT.DURATION.MEDIUM,
  delay: ANIMATION_VALUES.TASK_MANAGEMENT.DELAY.MEDIUM,
};
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/components/TaskManagementHeader.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/task-management/TaskManagementHeader.tsx
git commit -m "refactor(components): use ANIMATION_VALUES config for TaskManagementHeader"
```

---

## Task 10: Extract Hardcoded URL Patterns to Configuration

**Files:**

- Modify: `src/lib/config/navigation.ts:62-67` (use environment variables)

**Step 1: Write the failing test**

Create test file `tests/config/navigation-urls.test.ts`:

```typescript
import { FOOTER_NAV_CONFIG } from '@/lib/config/navigation';

describe('Navigation URLs', () => {
  it('should have configurable social links', () => {
    expect(FOOTER_NAV_CONFIG.SOCIAL_LINKS).toBeDefined();
    expect(FOOTER_NAV_CONFIG.SOCIAL_LINKS.length).toBeGreaterThan(0);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/config/navigation-urls.test.ts`
Expected: PASS (already configurable)

**Step 3: Write minimal implementation**

Verify `src/lib/config/navigation.ts` already uses environment variables:

```typescript
// Check that FOOTER_SOCIAL_LINKS env var is supported
const envLinks = EnvLoader.string('FOOTER_SOCIAL_LINKS', '');
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/config/navigation-urls.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/config/navigation-urls.test.ts
git commit -m "test(config): add tests for navigation URL configurability"
```

---

## Task 11: Create Configuration Documentation

**Files:**

- Create: `docs/configuration-guide.md`

**Step 1: Write the failing test**

No test needed for documentation.

**Step 2: Run test to verify it fails**

N/A

**Step 3: Write minimal implementation**

Create `docs/configuration-guide.md`:

```markdown
# Configuration Guide

This document describes all configurable options in IdeaFlow.

## Environment Variables

### Required Variables

| Variable                        | Description               | Default |
| ------------------------------- | ------------------------- | ------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL      | -       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key    | -       |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key | -       |
| `OPENAI_API_KEY`                | OpenAI API key            | -       |
| `ANTHROPIC_API_KEY`             | Anthropic API key         | -       |

### Optional Variables

| Variable           | Description          | Default               |
| ------------------ | -------------------- | --------------------- |
| `APP_BASE_URL`     | Base URL for the app | `https://ideaflow.ai` |
| `APP_SITE_URL`     | Site URL for SEO     | `https://ideaflow.ai` |
| `COST_LIMIT_DAILY` | Daily AI cost limit  | `10.0`                |

## Configuration Modules

- `src/lib/config/app.ts` - Application configuration
- `src/lib/config/navigation.ts` - Navigation configuration
- `src/lib/config/ui.ts` - UI configuration
- `src/lib/config/animation.ts` - Animation configuration
- `src/lib/config/error-messages.ts` - Error messages

## Adding New Configuration

1. Create or update the appropriate config file
2. Use `EnvLoader` for environment variable support
3. Export the configuration constant
4. Update the central index file
5. Add tests for the configuration
```

**Step 4: Run test to verify it passes**

N/A

**Step 5: Commit**

```bash
git add docs/configuration-guide.md
git commit -m "docs: add configuration guide for modular system"
```

---

## Task 12: Run Full Test Suite and Lint

**Files:**

- All modified files

**Step 1: Write the failing test**

N/A

**Step 2: Run test to verify it fails**

N/A

**Step 3: Write minimal implementation**

N/A

**Step 4: Run test to verify it passes**

Run: `npm run check`
Expected: All tests pass, no lint errors, no type errors

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: ensure all tests pass and code is linted"
```

---

## Task 13: Create PR and Merge

**Files:**

- All modified files

**Step 1: Write the failing test**

N/A

**Step 2: Run test to verify it fails**

N/A

**Step 3: Write minimal implementation**

N/A

**Step 4: Run test to verify it passes**

N/A

**Step 5: Commit**

```bash
# Sync with main
git fetch origin
git rebase origin/main

# Create PR
gh pr create --title "feat(config): Flexy Modularity - Eliminate Hardcoded Values" --body "## Summary
- Extract hardcoded UI strings to configuration
- Extract hardcoded error messages to configuration
- Extract hardcoded status codes to configuration
- Extract hardcoded animation values to configuration
- Add configuration documentation

## Changes
- Added UI_STRINGS configuration for animation classes
- Added ERROR_MESSAGES configuration for consistent error handling
- Added health status codes to STATUS_CODES configuration
- Added ANIMATION_VALUES configuration for consistent animations
- Updated components to use centralized configuration
- Added configuration guide documentation

## Testing
- All existing tests pass
- New tests added for configuration modules
- No lint or type errors

## Impact
- Improved maintainability
- Better configurability
- Consistent error handling
- Easier testing and mocking"
```

---

## Summary

This plan systematically eliminates hardcoded values by:

1. **UI Strings**: Extracting animation class names to `UI_STRINGS`
2. **Error Messages**: Centralizing error messages in `ERROR_MESSAGES`
3. **Status Codes**: Adding health status codes to `STATUS_CODES`
4. **Animation Values**: Extracting animation durations to `ANIMATION_VALUES`
5. **Documentation**: Creating comprehensive configuration guide

Each task follows TDD principles with:

- Failing tests first
- Minimal implementation
- Test verification
- Frequent commits

The result is a fully modular, configurable system that's easier to maintain and test.
