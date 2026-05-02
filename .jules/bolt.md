# Bolt's Performance Journal

## 2026-02-23 - Referential Instability in Core Hooks
**Learning:** Core hooks (`useABTest`, `useFunnelTracking`, `useUserPreferences`, `useSessionDuration`, `useTaskManagement`) were returning new object literals on every render. This caused all components consuming these hooks to re-render unnecessarily, even if the underlying data hadn't changed. In `useTaskManagement`, the `handleToggleTaskStatus` callback depended on the `data` state, causing it to be recreated and triggering re-renders of all memoized `TaskItem` components in a list when a single task was toggled (O(N) re-renders).
**Action:** Always memoize hook return objects with `useMemo`. Use `refs` to capture the latest state in callbacks to maintain referential stability without adding the state to the dependency array, especially for callbacks passed to large memoized lists.
