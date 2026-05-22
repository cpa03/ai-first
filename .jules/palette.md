## 2026-05-22 - [CopyButton Accessibility Enhancement]
**Learning:** Updating `aria-label` on a button during a state change (e.g., 'Copy' to 'Copied') is often not announced by screen readers if the element already has focus. Using a dedicated `aria-live` region (via `StatusAnnouncer`) ensures the transient state change is immediately communicated to assistive technology users.
**Action:** Always include a `StatusAnnouncer` or similar `aria-live` component for transient UI feedback following user actions, especially for components like `CopyButton` or form submissions.
