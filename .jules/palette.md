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

## 2026-02-05 - [CI Timeout & Permissions]

**Learning:** Automated CI flows using OpenCode may time out if an agent encounters a permission prompt (e.g., for directory access). Explicitly defining a named agent with pre-approved permissions in `opencode.json` is a critical stability fix for CI. While this is configuration work, it ensures that UX-focused agents can successfully verify and merge their improvements without environmental failures.

**Action:** Ensure `opencode.json` contains a valid `agent` key and `permission` array (especially for `/tmp/*`) to maintain a green CI pipeline for UX changes.
