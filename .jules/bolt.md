## 2026-04-29 - Task Management Callback Stability
**Learning:** The `useTaskManagement` hook provides a stable `handleToggleTaskStatus` callback by using a `dataRef` to access current state inside the `useCallback`. This prevents the entire task list from re-rendering when a single task status is toggled, as the callback's identity remains stable and doesn't trigger re-renders in memoized child components.

**Action:** When implementing callbacks that depend on frequently changing state (like large lists or complex data structures), use the `useRef` pattern to maintain referential stability of the callback while still accessing the latest state.

## 2026-04-29 - Session Tracker Memoization
**Learning:** `SessionTracker` is a tracking-only component that renders `null` but executes `useSessionDuration`. Without memoization, it re-renders whenever its parent (`KeyboardShortcutsProvider`) does, leading to redundant hook executions.

**Action:** Always wrap tracking-only components in `React.memo` to ensure they only initialize once per lifecycle, regardless of parent re-renders.
