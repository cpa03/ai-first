# Bolt's Performance Journal

This journal documents critical performance learnings and insights discovered while optimizing the codebase.

## 2026-02-24 - Initial Journal Creation
**Learning:** Performance-obsessed agent "Bolt" started its mission.
**Action:** Follow the daily process: Profile, Select, Optimize, Verify, Present.

## 2026-05-07 - Hook Referential Stability & Pure State Updaters
**Learning:** Returning non-memoized objects from common hooks (like `useABTest` or `useUserPreferences`) causes cascading re-renders in consumer components, even if the actual data hasn't changed. Additionally, performing side effects (like `localStorage` writes) inside `setState` updaters violates React's purity requirements and can lead to inconsistent state.
**Action:** Always memoize hook return objects using `useMemo` and functions with `useCallback`. Move side effects from state updaters into `useEffect` to ensure render-phase purity and reliable persistence of initial state changes. Use the "Latest Ref" pattern in `useEffect` to stabilize callbacks that depend on volatile state.
