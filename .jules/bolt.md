## 2025-05-14 - Optimized useUserPreferences for Referential Stability
**Learning:** Returning unmemoized object literals from custom hooks causes all consumer components to re-render whenever the hook's parent re-renders, even if the actual state hasn't changed. Additionally, calling side-effects (like `localStorage.setItem`) inside `useState` updater functions violates render-phase purity and can lead to inconsistent state or performance bottlenecks.
**Action:** Always wrap hook return objects in `useMemo` and ensure all returned functions are stable with `useCallback`. Move side-effects that persist state to a `useEffect` hook triggered by state changes.

## 2026-05-05 - Hook Referential Stability with Latest Value Ref
**Learning:** In hooks managing large datasets (like `useTaskManagement`), including the data state in callback dependencies (like `handleToggleTaskStatus`) causes O(N) re-renders of child components whenever any item is updated. Using a `useRef` to track the latest data value (updated in `useEffect` to satisfy `react-hooks/refs`) allows callbacks to maintain a stable identity while still accessing fresh state.
**Action:** Use the `useRef` + `useEffect` + `useMemo` pattern for callbacks and return objects in performance-critical hooks.

## 2025-05-15 - Referential Stability in Configuration Hooks
**Learning:** Even simple hooks providing configuration or A/B test flags (like `useABTest`) can cause cascading re-renders if they return new object instances on every render. This is particularly problematic when these objects are used in `useEffect` dependency arrays or passed to `React.memo` components.
**Action:** Proactively wrap return objects in `useMemo` and functions in `useCallback` for all custom hooks to ensure consistent identity across renders.
