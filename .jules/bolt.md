## 2026-05-04 - Optimize useTaskManagement referential stability
**Learning:** In complex hooks like `useTaskManagement` that return multiple state-derived callbacks, updating a `dataRef` inside `useEffect` (instead of during render) maintains Concurrent Mode safety while allowing callbacks to have stable references. This is critical for O(1) re-render performance when toggling items in large lists.
**Action:** Use `dataRef` + `useEffect` + `useMemo` pattern for hooks managing large data sets to ensure referential stability for consumers and child components.
