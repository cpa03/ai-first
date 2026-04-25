# Bolt's Performance Journal ⚡

## 2025-05-15 - Hook Return Object Stability
**Learning:** Custom hooks returning object literals (e.g., `return { ... }`) without `useMemo` cause downstream components to re-render on every parent update, even if the hook's internal state hasn't changed. This is particularly problematic for tracking hooks used in layout or high-level providers.
**Action:** Always wrap hook return objects in `useMemo` when they are consumed by multiple components or passed to memoized children.
