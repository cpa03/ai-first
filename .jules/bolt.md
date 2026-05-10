## 2026-05-10 - Preventing Redundant Async Generations

**Learning:** Objects and arrays passed as props often change their reference on every parent re-render (e.g., when created via inline literals or unmemoized transformations), causing downstream `useEffect` hooks with those objects in their dependency array to re-trigger unnecessarily. For expensive or time-delayed operations like AI-simulated blueprint generation, this leads to redundant work and a poor UX (repeated loading states and animations).

**Action:** Use `JSON.stringify(dependency)` in the `useEffect` dependency array for complex objects where deep equality is more important than referential equality. Additionally, always wrap custom hook return values in `useMemo` to prevent unneeded re-renders in consumer components.
