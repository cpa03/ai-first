## 2025-05-13 - Referential Stability in Core Hooks
**Learning:** Returning unmemoized object literals from custom hooks causes unnecessary re-renders in consumer components, even if the underlying state hasn't changed. This breaks `React.memo` and triggers redundant effects in components that depend on the hook's return value.
**Action:** Always wrap hook return objects in `useMemo` and ensure all returned functions are wrapped in `useCallback`. Verify referential stability with dedicated Jest tests using `renderHook` and `rerender`.
