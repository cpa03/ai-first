# Palette's Journal - Critical UX/Accessibility Learnings

## 2026-06-11 - Standardizing Accessibility Feedback for Interactive Elements
**Learning:** Using `aria-label` to provide success feedback (e.g., changing 'Copy' to 'Copied!') can be unreliable and cause double-announcements in some screen readers. A dedicated `StatusAnnouncer` component using `aria-live` provides more reliable transient feedback.
**Action:** Use `StatusAnnouncer` for transient success states (Copy, Share, Task Toggle) and keep `aria-label` static for the element's persistent purpose.

## 2026-06-11 - Preventing Accessibility Spam on Component Mount
**Learning:** Accessibility announcers that fire based on component state (like `isCompleted`) can trigger unwanted announcements when the component first mounts or when data is initially loaded.
**Action:** Guard accessibility announcements with an interaction flag (e.g., `isToggled`) and/or a mount guard to ensure they only fire in response to explicit user actions.

## 2026-06-11 - Importance of Explicit Button Types
**Learning:** Interactive elements like task checkboxes and accordion headers that are not intended to submit forms should explicitly have `type="button"` to avoid unintended behavior if they ever become nested within a `<form>`.
**Action:** Ensure all interactive `<button>` elements have an explicit `type` attribute.
