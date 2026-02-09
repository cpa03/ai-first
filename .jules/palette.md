# Palette's Journal

## 2025-05-14 - [Accessible Navigation & Smooth UX]

**Learning:** For Next.js applications, always use the `Link` component for internal navigation to ensure a smooth SPA experience. When implementing custom navigation elements (like logos or icons), consistent focus-visible rings are crucial for keyboard accessibility. On mobile, preventing body scroll when a menu is open is a key micro-UX touch that prevents disorientation.

**Action:** Use `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-md` for interactive elements and implement body scroll lock for all modal-like overlays.

## 2026-02-04 - [Global Toast Feedback]

**Learning:** The `ToastContainer` component exposes a global `window.showToast` function. This is extremely useful for providing immediate feedback (like "Copied to clipboard") from utility functions or deep components without passing down state. However, it requires careful TypeScript casting to avoid `any` or linting errors.

**Action:** When using `window.showToast`, cast window as `Window & { showToast?: (options: ToastOptions) => void }` and always check for existence before calling.

## 2025-05-15 - [Mobile Menu Stacking & Semantics]

**Learning:** Mobile navigation menus should use semantic `<ul>` and `<li>` structures to ensure proper screen reader announcement of the item count. To avoid visual overlap with sticky headers or page content, use `fixed` positioning with a high z-index (e.g., `z-[100]`) and an opaque background. When using animations like `fade-in`, ensure a solid background is maintained throughout the transition to prevent unreadable text overlap.

**Action:** Always wrap navigation links in a list, use `fixed` for full-width mobile overlays, and verify opacity with a short delay in automated screenshots to account for animations.

## 2026-02-05 - [Semantic Stepper Accessibility]

**Learning:** Progress indicators should use semantic `<ol>` and `<li>` structures even when they are just visual dots. This allows screen readers to announce the current position and total steps correctly. Providing explicit `aria-label` descriptions like "Current", "Completed", or "Upcoming" for each step significantly improves the experience for non-visual users.

**Action:** Always use ordered lists for multi-step progress indicators and ensure each step has a clear, state-aware ARIA label.

## 2026-02-08 - [Aggregate Effort Visibility]

**Learning:** When tracking progress for complex projects with multiple deliverables and tasks, providing aggregate effort (hours/points) alongside simple counts (X of Y tasks) gives users a much more accurate sense of remaining work. This is especially true when tasks vary significantly in complexity.

**Action:** Always include aggregate estimates (total vs. completed) in project summaries and deliverable headers. Pre-calculate these values during data mapping to keep the UI performant.
