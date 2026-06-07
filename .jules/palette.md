# Palette's Journal - UX & Accessibility Learnings

## 2026-06-07 - Accessible Status Announcements
**Learning:** Screen readers often miss dynamic `aria-label` updates on interactive elements (like "Copy" changing to "Copied!"). The `StatusAnnouncer` component (src/components/StatusAnnouncer.tsx) provides a more reliable `aria-live` feedback mechanism for transient success states.
**Action:** Use `StatusAnnouncer` for all transient feedback states (copying, sharing, status toggles). Ensure announcements are guarded by an interaction flag (e.g., `isToggled`) to prevent "accessibility spam" on initial component mount.

## 2026-06-07 - Redundant ARIA Attributes
**Learning:** Adding `aria-live` directly to interactive elements that also use `StatusAnnouncer` can cause double announcements or conflicting feedback for screen reader users.
**Action:** Remove `aria-live` and `aria-atomic` from buttons if they are already paired with a `StatusAnnouncer` for the same action.
