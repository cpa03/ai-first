# Bolt ⚡ - Performance Learning Journal

This journal documents critical performance learnings and insights discovered while optimizing the codebase.

---

## 2026-05-03 - Optimizing List Re-renders via Callback Stability
**Learning:** In list-heavy components like TaskManagement, callbacks that depend on the list state (e.g., `handleToggleTaskStatus`) will be recreated on every item update. Even if items are wrapped in `React.memo`, they will all re-render because the callback reference changed.
**Action:** Use the "latest ref" pattern—store the state in a `useRef` updated via `useEffect` and access this ref inside the callback. This allows removing the state from the `useCallback` dependency array, achieving referential stability and preventing $O(N)$ re-renders of list items.
