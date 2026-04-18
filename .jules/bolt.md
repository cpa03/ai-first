# Bolt Journal - Performance Learnings

## 2025-05-15 - Callback Stabilization in useTaskManagement
**Learning:** In React components with large lists, passing unstable callbacks to memoized children (like TaskItem) causes O(N) re-renders even for O(1) state changes.
**Action:** Use refs to stabilize callbacks that depend on frequently changing state, ensuring children only re-render when their specific props change.
