## 2026-05-15 - Memoizing heavy component props in ResultsPage
**Learning:** Object literals and inline transformations passed as props to memoized components (like `BlueprintDisplay`) trigger redundant re-renders because their reference changes every time the parent renders. This is especially impactful for components that manage complex async states or heavy DOM structures.
**Action:** Always wrap derived objects or array transformations in `useMemo` when they are passed as props to components wrapped in `React.memo()`.

## 2026-05-15 - Rules of Hooks and Early Returns
**Learning:** Placing React hooks after early returns (e.g., `if (loading) return ...`) violates the Rules of Hooks and causes lint errors. This is particularly critical in environments with strict build checks like Cloudflare Workers.
**Action:** Ensure all `useMemo`, `useEffect`, and other hooks are called at the top level of the component, before any conditional return statements.
