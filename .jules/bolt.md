# Bolt Performance Journal

## 2026-02-24 - Referential Stability in useABTest Hook
**Learning:** Found that useABTest hook lacked referential stability, causing components to re-render even when experiment assignments didn't change. This is a common performance bottleneck in Growth experimentation frameworks.
**Action:** Always wrap hook return objects in useMemo and utility functions in useCallback to ensure stable references across renders.
