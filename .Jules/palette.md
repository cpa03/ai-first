## 2025-05-15 - Clipboard verification in Playwright
**Learning:** Playwright E2E tests involving clipboard actions (e.g., `navigator.clipboard.writeText`) require explicitly granting `clipboard-read` and `clipboard-write` permissions in the browser context to succeed in headless environments.
**Action:** Use `browser.new_context(permissions=["clipboard-read", "clipboard-write"])` in verification scripts involving copy-to-clipboard features.

## 2025-05-15 - Multi-modal Copy Feedback
**Learning:** Providing immediate local visual feedback (e.g., changing button text to "Copied!") in addition to a global toast notification significantly improves the perceived responsiveness of clipboard actions, as it confirms exactly which element was acted upon.
**Action:** Always implement local state changes for copy buttons to provide clear, localized confirmation.
