# Bolt Performance Journal

## 2026-02-24 - Referential Stability in Core Hooks
**Learning:** Found that core utility hooks (useABTest, useUserPreferences, etc.) lacked memoized return objects and stable callbacks. This caused unnecessary re-renders in all components consuming these hooks, even when the underlying data hadn't changed.
**Action:** Always wrap hook return objects in useMemo and ensure all returned functions are stabilized with useCallback to prevent cascading re-renders across the component tree.
