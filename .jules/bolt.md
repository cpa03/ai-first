## 2026-05-08 - Optimized Hook Referential Stability for Complex States

**Learning:** In hooks managing large or complex datasets (like `useTaskManagement`), callbacks that depend on the data state (e.g., `handleToggleTaskStatus`) will change reference on every update. This causes O(N) re-renders in consumer components that render lists of items, even if those items are memoized. Using a `useRef` to track the latest state, updated inside a `useEffect` (to satisfy `react-hooks/refs`), allows callbacks to be referentially stable (O(1)) while still having access to the latest data.

**Action:** For hooks returning stable callbacks that need access to volatile state:
1. Use `useRef` to store the volatile state.
2. Update the ref inside `useEffect(() => { ref.current = state; }, [state])`.
3. Use `ref.current` inside `useCallback` and omit the state from dependencies.
4. Memoize the hook's return object with `useMemo`.
