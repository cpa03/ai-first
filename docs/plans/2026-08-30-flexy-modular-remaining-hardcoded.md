# Flexy Modular Remaining Hardcoded Values Implementation Plan

> **For Agent:** REQUIRED SUB-SKILL: Use superpowers-executing-plans or superpowers-subagent-dev to implement this plan task-by-task.

**Goal:** Eliminate remaining hardcoded values in the codebase and clean up stale flexy branches to maintain a modular, configurable system.

**Architecture:** Systematic extraction of hardcoded values into centralized configuration modules with environment variable overrides, following the established Flexy pattern.

**Tech Stack:** TypeScript, React, Next.js, Tailwind CSS, Configuration modules

---

## Task 1: Extract Remaining Hardcoded aria-label in KeyboardShortcutsHelp

**Files:**

- Modify: `src/components/KeyboardShortcutsHelp.tsx:833`
- Modify: `src/lib/config/component-labels.ts:201-203`

**Step 1: Write the failing test**

Create a test to verify the aria-label is modularized:

```typescript
// tests/components/KeyboardShortcutsHelp.test.tsx
import { render, screen } from '@testing-library/react';
import KeyboardShortcutsHelp from '@/components/KeyboardShortcutsHelp';

test('category filter uses modular aria-label', () => {
  render(<KeyboardShortcutsHelp isOpen={true} onClose={() => {}} />);
  const tablist = screen.getByRole('tablist');
  expect(tablist).toHaveAttribute('aria-label', 'Filter shortcuts by category');
});
```

**Step 2: Run test to verify it passes (existing behavior)**

Run: `npm test -- tests/components/KeyboardShortcutsHelp.test.tsx`
Expected: PASS (test should pass with current hardcoded value)

**Step 3: Extract hardcoded aria-label to config**

In `src/lib/config/component-labels.ts`, add to `KEYBOARD_SHORTCUTS_HELP_LABELS`:

```typescript
/** Category filter tablist aria-label */
CATEGORY_FILTER_ARIA_LABEL: 'Filter shortcuts by category',
```

In `src/components/KeyboardShortcutsHelp.tsx`, update import and usage:

```typescript
// Import the new constant
const {
  CONTEXT_LABELS,
  CONTEXT_ORDER,
  SHORTCUT_DESCRIPTIONS,
  CATEGORY_FILTER_ARIA_LABEL,
} = KEYBOARD_SHORTCUTS_HELP_LABELS;

// Replace hardcoded aria-label
aria-label={CATEGORY_FILTER_ARIA_LABEL}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/components/KeyboardShortcutsHelp.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/KeyboardShortcutsHelp.tsx src/lib/config/component-labels.ts
git commit -m "fix(a11y): modularize remaining hardcoded aria-label in KeyboardShortcutsHelp"
```

---

## Task 2: Verify No Other Hardcoded aria-labels in Source Code

**Files:**

- Scan: `src/**/*.tsx`
- Scan: `src/**/*.ts`

**Step 1: Search for hardcoded aria-labels**

Run: `grep -r 'aria-label="[^"]*"' src/ --include="*.tsx" --include="*.ts"`

Expected: Only test files should have hardcoded aria-labels

**Step 2: Document findings**

If any hardcoded aria-labels found in source code (not tests), create issues for future cleanup.

**Step 3: Commit documentation**

```bash
git add docs/plans/2026-08-30-flexy-modular-remaining-hardcoded.md
git commit -m "docs(plans): add Flexy modular remaining hardcoded values plan"
```

---

## Task 3: Clean Up Stale Flexy Branches

**Files:**

- None (git operations only)

**Step 1: Identify merged branches**

Run: `git branch -r | grep -E "flexy|hardcoded" | while read branch; do if git merge-base --is-ancestor $branch main 2>/dev/null; then echo "MERGED: $branch"; fi; done`

**Step 2: Delete merged remote branches**

For each merged branch, delete it:

```bash
git push origin --delete <branch-name>
```

**Step 3: Document cleanup**

Add findings to maintenance documentation.

**Step 4: Commit**

```bash
git add docs/maintenance/2026-08-30-flexy-branch-cleanup.md
git commit -m "docs(maintenance): document stale flexy branch cleanup"
```

---

## Task 4: Run Full Build Verification

**Files:**

- None (verification only)

**Step 1: Run lint**

Run: `npm run lint`
Expected: 0 warnings, 0 errors

**Step 2: Run type-check**

Run: `npm run type-check`
Expected: No TypeScript errors

**Step 3: Run tests**

Run: `npm test`
Expected: All tests pass

**Step 4: Run build**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit any fixes**

If any issues found, fix them and commit:

```bash
git add -A
git commit -m "fix: resolve lint/type/test issues from modularization"
```

---

## Task 5: Create Pull Request

**Files:**

- None (PR creation only)

**Step 1: Push branch**

```bash
git push origin feat/flexy-modular-remaining-hardcoded-20260830
```

**Step 2: Create PR with metadata**

Use the machine-readable PR template:

```markdown
## Summary

Extract remaining hardcoded aria-label in KeyboardShortcutsHelp to modular configuration.

## Changes

- [x] Extract hardcoded `aria-label="Filter shortcuts by category"` to `CATEGORY_FILTER_ARIA_LABEL` in `component-labels.ts`
- [x] Update `KeyboardShortcutsHelp.tsx` to use modular constant
- [x] Verified no other hardcoded aria-labels in source code
- [x] All lint, type-check, tests, and build pass

## Testing

- [x] Unit tests pass
- [x] Accessibility verified (aria-label preserved)
- [x] No regressions

## Agent Metadata

AGENT=flexy
TASK=modularize-remaining-hardcoded-aria-label
PRIORITY=low
SCOPE=component-labels, KeyboardShortcutsHelp
```

**Step 3: Assign reviewers**

Request review from maintainers.

---

## Success Criteria

1. ✅ Remaining hardcoded aria-label extracted to config module
2. ✅ No other hardcoded aria-labels in source code
3. ✅ Stale flexy branches documented/cleaned
4. ✅ All lint, type-check, tests, and build pass
5. ✅ PR created with proper documentation

## Notes

- This is a low-priority cleanup task
- The codebase already has extensive modularization (92+ config files)
- Focus on maintaining the established Flexy pattern
- Ensure no regressions in functionality or accessibility
