# Flexy Modularity Implementation Plan

> **Status:** ✅ **COMPLETED** (see Implementation Status below)
>
> **For Agent:** REQUIRED SUB-SKILL: Use superpowers-subagent-dev for task-by-task implementation.

**Goal:** Eliminate hardcoded values from components and centralize them in configuration files.

**Architecture:** Extend existing config system in `src/lib/config/` with new constants for animation delays, timing values, and pagination settings. Update components to import from centralized config.

**Tech Stack:** TypeScript, React, Next.js

---

## Implementation Status

| Task                                    | Status         | Notes                                                                                        |
| --------------------------------------- | -------------- | -------------------------------------------------------------------------------------------- |
| Task 1: ANIMATION_DELAYS in theme.ts    | ✅ Complete    | Full ANIMATION_DELAYS constant with IMMEDIATE, MICRO, PARTICLE_STAGGER, SHORT, CLEANUP, etc. |
| Task 2: PAGINATION config in app.ts     | ✅ Complete    | APP_CONFIG.PAGINATION with DEFAULT_LIMIT, MAX_LIMIT, MIN_LIMIT                               |
| Task 3: cleanup.ts EnvLoader            | ✅ Complete    | Uses EnvLoader for TASK_TIMEOUT_MS and GRACEFUL_SHUTDOWN_TIMEOUT_MS                          |
| Task 4: StepCelebration particle delays | ✅ Complete    | Uses ANIMATION_DELAYS.PARTICLE_STAGGER                                                       |
| Task 5: InputWithValidation timeouts    | ✅ Complete    | Uses ANIMATION_DELAYS.IMMEDIATE and ANIMATION_DELAYS.SHAKE                                   |
| Task 6: AutoSaveIndicator delay class   | ✅ Complete    | Uses ANIMATION_DELAYS.TAILWIND[100]                                                          |
| Task 7: dashboard/page pagination       | ✅ Complete    | Uses APP_CONFIG.PAGINATION.DEFAULT_LIMIT                                                     |
| Task 8: CopyButton haptic duration      | ✅ Complete    | Uses ANIMATION_DELAYS.MICRO                                                                  |
| Task 9: BlueprintDisplay cleanup delay  | ✅ Complete    | Uses ANIMATION_DELAYS.CLEANUP                                                                |
| Task 10: config index.ts exports        | ✅ Complete    | ANIMATION_DELAYS and AnimationDelays type exported                                           |
| Shadow colors (StepCelebration)         | 🔄 In PR #1305 | CELEBRATION_COLORS.SHADOWS for drop-shadow and box-shadow                                    |

**Remaining Work (PR #1305):**

- StepCelebration.tsx shadow colors: `rgba(37, 99, 235, 0.4)` and `rgba(37, 99, 235, 0.5)`
- Adding CELEBRATION_COLORS.SHADOWS to theme.ts

---

## Summary of Hardcoded Values to Modularize

1. **StepCelebration.tsx** - Line 57: `delay: i * 50` (particle delay) → ✅ Uses ANIMATION_DELAYS.PARTICLE_STAGGER
2. **InputWithValidation.tsx** - Lines 146, 148: `setTimeout(..., 0)` (immediate execution) → ✅ Uses ANIMATION_DELAYS.IMMEDIATE
3. **AutoSaveIndicator.tsx** - Line 230: `delay-100` (Tailwind delay class) → ✅ Uses ANIMATION_DELAYS.TAILWIND[100]
4. **dashboard/page.tsx** - Line 67: `'50'` (pagination limit) → ✅ Uses APP_CONFIG.PAGINATION.DEFAULT_LIMIT
5. **cleanup.ts** - Lines 15, 29: Hardcoded timeouts (should use EnvLoader) → ✅ Uses EnvLoader
6. **CopyButton.tsx** - Line 22: `HAPTIC_FEEDBACK_DURATION = 50` → ✅ Uses ANIMATION_DELAYS.MICRO
7. **BlueprintDisplay.tsx** - Line 66: `100` (timeout value) → ✅ Uses ANIMATION_DELAYS.CLEANUP
8. **StepCelebration.tsx** - Lines 162, 257: Shadow colors → 🔄 PR #1305

---

## Task 1: Add ANIMATION_DELAYS to theme.ts

**Files:**

- Modify: `src/lib/config/theme.ts`

**Implementation:**
Add new constant object for animation delays after ANIMATION_PHYSICS:

```typescript
/**
 * Animation delay constants
 * Used for staggered animations and particle effects
 * Eliminates hardcoded delay values in components
 */
export const ANIMATION_DELAYS = {
  /** Immediate execution delay (for setTimeout(..., 0) patterns) */
  IMMEDIATE: 0,
  /** Micro delay for UI feedback (50ms) */
  MICRO: 50,
  /** Small delay for particle stagger effects */
  PARTICLE_STAGGER: 50,
  /** Short delay for quick animations (100ms) */
  SHORT: 100,
  /** Standard delay for most animations (150ms) */
  STANDARD: 150,
  /** Medium delay for coordinated animations (200ms) */
  MEDIUM: 200,
  /** Long delay for emphasis (300ms) */
  LONG: 300,
  /** Tailwind-compatible delay classes */
  TAILWIND: {
    100: 'delay-100',
    150: 'delay-150',
    200: 'delay-200',
    300: 'delay-300',
    500: 'delay-500',
    700: 'delay-700',
    1000: 'delay-1000',
  },
} as const;
```

Also add to exports at bottom:

```typescript
export type AnimationDelays = typeof ANIMATION_DELAYS;
```

**Verification:**

- Check that ANIMATION_DELAYS is properly exported from theme.ts
- Check that it's re-exported from index.ts

---

## Task 2: Add PAGINATION config to app.ts

**Files:**

- Modify: `src/lib/config/app.ts`

**Implementation:**
Add PAGINATION constant to APP_CONFIG object:

```typescript
/**
 * Pagination configuration
 * Centralizes pagination limits and offsets
 */
PAGINATION: {
  /** Default number of items per page */
  DEFAULT_LIMIT: 50,
  /** Maximum allowed items per page */
  MAX_LIMIT: 100,
  /** Minimum allowed items per page */
  MIN_LIMIT: 10,
  /** Default offset for pagination */
  DEFAULT_OFFSET: 0,
} as const,
```

**Verification:**

- APP_CONFIG.PAGINATION is accessible

---

## Task 3: Update cleanup.ts to use EnvLoader pattern

**Files:**

- Modify: `src/lib/config/cleanup.ts`

**Implementation:**
Import EnvLoader from environment.ts and convert hardcoded values:

```typescript
import { EnvLoader } from './environment';

export const CLEANUP_CONFIG = {
  RESOURCE_MANAGER: {
    TASK_TIMEOUT_MS: EnvLoader.number(
      'CLEANUP_TASK_TIMEOUT_MS',
      5000,
      1000,
      30000
    ),
    DEFAULT_PRIORITY: 0,
    GRACEFUL_SHUTDOWN_TIMEOUT_MS: EnvLoader.number(
      'GRACEFUL_SHUTDOWN_TIMEOUT_MS',
      10000,
      5000,
      60000
    ),
  } as const,
  // ... rest of config
} as const;
```

**Verification:**

- Values are loaded from environment variables with sensible defaults

---

## Task 4: Update StepCelebration.tsx

**Files:**

- Modify: `src/components/StepCelebration.tsx`

**Implementation:**
Add import for ANIMATION_DELAYS and use it:

```typescript
import {
  CELEBRATION_COLORS,
  ANIMATION_PHYSICS,
  SVG_ANIMATION,
  ANIMATION_DELAYS,
} from '@/lib/config';
```

Update line 57:

```typescript
delay: i * ANIMATION_DELAYS.PARTICLE_STAGGER,
```

**Verification:**

- Component still works with same animation timing

---

## Task 5: Update InputWithValidation.tsx

**Files:**

- Modify: `src/components/InputWithValidation.tsx`

**Implementation:**
Add import and use constant:

```typescript
import {
  INPUT_STYLES,
  TEXT_COLORS,
  BG_COLORS,
  SIZES,
  SVG_ANIMATION,
  ANIMATION_DELAYS,
} from '@/lib/config';
```

Update lines 146 and 148:

```typescript
timeoutId = setTimeout(
  () => setErrorAnnounced(true),
  ANIMATION_DELAYS.IMMEDIATE
);
// ...
timeoutId = setTimeout(
  () => setErrorAnnounced(false),
  ANIMATION_DELAYS.IMMEDIATE
);
```

**Verification:**

- Input validation announcements still work

---

## Task 6: Update AutoSaveIndicator.tsx

**Files:**

- Modify: `src/components/AutoSaveIndicator.tsx`

**Implementation:**
The Tailwind class `delay-100` is already configurable. Let's add a constant for it:

```typescript
import { COMPONENT_CONFIG, ANIMATION_DELAYS } from '@/lib/config';
```

Update line 230:

```typescript
<span className={`text-gray-400 animate-in fade-in slide-in-from-left-1 duration-300 ${ANIMATION_DELAYS.TAILWIND[100]}`}>
```

**Verification:**

- Auto-save indicator animation still works

---

## Task 7: Update dashboard/page.tsx

**Files:**

- Modify: `src/app/dashboard/page.tsx`

**Implementation:**
Add import and use pagination constant:

```typescript
import { APP_CONFIG } from '@/lib/config';
```

Update line 67:

```typescript
params.set('limit', String(APP_CONFIG.PAGINATION.DEFAULT_LIMIT));
```

**Verification:**

- Dashboard pagination still works with correct limit

---

## Task 8: Update CopyButton.tsx

**Files:**

- Modify: `src/components/CopyButton.tsx`

**Implementation:**
Add import and use constant:

```typescript
import { ANIMATION_DELAYS } from '@/lib/config';
```

Update line 22:

```typescript
const HAPTIC_FEEDBACK_DURATION = ANIMATION_DELAYS.MICRO;
```

**Verification:**

- Copy button haptic feedback still works

---

## Task 9: Update BlueprintDisplay.tsx

**Files:**

- Modify: `src/components/BlueprintDisplay.tsx`

**Implementation:**
Add import and use constant:

```typescript
import { ANIMATION_DELAYS } from '@/lib/config';
```

Update line 66:

```typescript
}, ANIMATION_DELAYS.SHORT);
```

**Verification:**

- Blueprint display timing still works

---

## Task 10: Update config index.ts exports

**Files:**

- Modify: `src/lib/config/index.ts`

**Implementation:**
Add ANIMATION_DELAYS to exports from theme:

```typescript
export {
  // ... existing exports
  ANIMATION_DELAYS,
  // ... existing exports
} from './theme';
```

Add to type exports:

```typescript
export type {
  // ... existing exports
  AnimationDelays,
} from './theme';
```

**Verification:**

- ANIMATION_DELAYS is accessible from `@/lib/config`

---

## Task 11: Run lint and type check

**Commands:**

```bash
npm run lint
npm run type-check
```

**Expected:**

- No lint errors
- No TypeScript errors

---

## Task 12: Run tests

**Commands:**

```bash
npm test -- --testPathPattern="(StepCelebration|InputWithValidation|AutoSaveIndicator|CopyButton|BlueprintDisplay)" --passWithNoTests
```

**Expected:**

- All related tests pass

---

## Task 13: Create feature branch and commit

**Commands:**

```bash
git checkout -b feature/flexy-modularity-$(date +%Y%m%d-%H%M%S)
git add -A
git commit -m "feat: modularize hardcoded values

- Add ANIMATION_DELAYS constants for animation timing
- Add PAGINATION config for dashboard limits
- Update cleanup.ts to use EnvLoader pattern
- Refactor components to use centralized config:
  - StepCelebration: particle delays
  - InputWithValidation: immediate execution timeouts
  - AutoSaveIndicator: Tailwind delay classes
  - dashboard/page: pagination limit
  - CopyButton: haptic feedback duration
  - BlueprintDisplay: timeout values

Eliminates hardcoded magic numbers and makes system more configurable."
```

---

## Task 14: Push and create PR

**Commands:**

```bash
git push -u origin HEAD
```

Then create PR using GitHub CLI or API.

**PR Description:**

```markdown
## Summary

Flexy agent mission: Eliminate hardcoded values and make the system modular.

## Changes

- Centralized animation delays in ANIMATION_DELAYS constant
- Added PAGINATION config for API limits
- Converted cleanup timeouts to environment-based configuration
- Updated 6 components to use config instead of magic numbers

## Testing

- [ ] All lint checks pass
- [ ] All type checks pass
- [ ] Component tests pass
- [ ] Manual verification of affected components

## Files Modified

- src/lib/config/theme.ts
- src/lib/config/app.ts
- src/lib/config/cleanup.ts
- src/lib/config/index.ts
- src/components/StepCelebration.tsx
- src/components/InputWithValidation.tsx
- src/components/AutoSaveIndicator.tsx
- src/components/CopyButton.tsx
- src/components/BlueprintDisplay.tsx
- src/app/dashboard/page.tsx
```

---

## Success Criteria

- [x] No hardcoded magic numbers remain in modified files (except shadow colors in PR #1305)
- [x] All values are configurable via config files
- [x] Cleanup timeouts support environment variables
- [x] All lint checks pass
- [x] All type checks pass
- [x] No test regressions
- [x] PR created and ready for review

## Conclusion

The Flexy modularity mission is essentially complete. All hardcoded animation delays, pagination limits, and cleanup timeouts have been centralized in the configuration system. The only remaining items (shadow colors in StepCelebration.tsx) are being addressed in PR #1305.

The configuration system now provides:

- **ANIMATION_DELAYS**: Comprehensive timing constants with Tailwind class mapping
- **APP_CONFIG.PAGINATION**: Centralized pagination limits
- **CLEANUP_CONFIG**: Environment-variable-based cleanup timeouts
- **CELEBRATION_COLORS.SHADOWS**: (PR #1305) Glow effect colors for celebrations

This modularity improvement makes the codebase more maintainable, configurable, and easier to update when design tokens change.
