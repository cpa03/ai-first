# Bolt's Performance Journal - Critical Learnings Only

## 2026-04-11 - Stabilizing interactive list callbacks with Refs
**Learning:** In large interactive lists, updating a single item's status can trigger O(N) re-renders of all items if the update callback depends on the entire list state. Even if child items are memoized with `React.memo`, they will re-render if the callback passed to them changes. Using `useCallback` with a state dependency (e.g., `[data]`) causes the callback identity to change on every update, effectively disabling memoization for all items in the list.
**Action:** Use the "Ref-stabilized callback" pattern: maintain a ref that tracks the latest state (`dataRef.current = data`) and reference this ref inside the `useCallback`. Omit the state from the dependency array. This ensures the callback identity remains stable, allowing `React.memo` to skip re-renders for all unaffected items.
