## 2025-05-15 - [Global Toast System Activation]
**Learning:** The project had a sophisticated toast system defined in `ToastContainer.tsx` that exposed a global `window.showToast` function, but it was not integrated into the root layout, rendering it unusable across the app.
**Action:** Always verify if global utility components like Toast or Modal containers are correctly mounted in the root layout when implementing interactive feedback.

## 2025-05-15 - [Accessibility for Dynamic Progress Bars]
**Learning:** Progress bars implemented as styled divs often lack necessary ARIA attributes (`role="progressbar"`, `aria-label`, `aria-valuenow`), making them invisible to screen readers.
**Action:** Use semantic roles and descriptive labels for all visual indicators of progress to ensure inclusive UX.
