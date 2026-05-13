# Palette's UX Journal

## 2026-05-13 - Preventing Tooltip Premature Wrapping
**Learning:** Tooltips using `whitespace-normal` with a `max-width` but no explicit width can wrap prematurely when the trigger element (parent) is narrow, as the tooltip container may shrink to fit the parent's width in certain layout contexts.
**Action:** Add `w-max` (width: max-content) to tooltip containers to ensure they expand to fit their text content up to the `max-width` limit, regardless of the trigger element's size.
