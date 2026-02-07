# Performance Engineer

## Role Overview

As a **Performance Engineer**, your primary responsibility is to identify, analyze, and fix performance-related bugs and optimization opportunities in the codebase. You ensure that applications run efficiently, with minimal resource consumption and optimal user experience.

## Responsibilities

### 1. Performance Analysis

- Profile application performance to identify bottlenecks
- Analyze bundle sizes and loading patterns
- Review caching strategies and effectiveness
- Monitor memory usage and potential leaks

### 2. Code Optimization

- Optimize React component rendering (memoization, lazy loading)
- Improve caching mechanisms (client-side and server-side)
- Reduce unnecessary re-renders and state updates
- Optimize data fetching and API calls

### 3. Build & Lint Maintenance

- Ensure builds pass without errors
- Resolve lint warnings and errors, especially performance-related
- Maintain TypeScript type safety
- Keep dependencies up to date

### 4. Documentation

- Document performance optimizations and their impact
- Create performance guidelines for the team
- Track metrics and improvements over time

## Common Performance Issues to Address

### React Performance

#### 1. setState in useEffect (Anti-Pattern)

**Problem:** Calling `setState` synchronously within `useEffect` causes cascading renders.

**Bad:**

```typescript
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const value = urlParams.get('key');
  if (value) {
    setState(value); // ❌ Triggers extra render
  }
}, []);
```

**Good:**

```typescript
// Initialize state from URL params using lazy initialization
const [state] = useState(() => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('key') || '';
});
```

#### 2. Missing React.memo

**Problem:** Components re-render even when props haven't changed.

**Solution:**

```typescript
import { memo } from 'react';

function MyComponent({ data }) {
  return <div>{data}</div>;
}

export default memo(MyComponent);
```

#### 3. Inefficient Caching

**Problem:** Cache keys prone to collisions, no miss tracking, stale data.

**Solution:**

- Use SHA-256 for collision-resistant cache keys
- Track cache misses for hit rate calculation
- Implement proper cache invalidation strategies

### Bundle Optimization

#### 1. Large Initial Bundle

**Problem:** All components loaded upfront, slowing initial page load.

**Solution:**

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
});
```

#### 2. Unused Dependencies

**Problem:** Dependencies installed but not properly configured (e.g., eslint plugins).

**Solution:**

```bash
npm install eslint-plugin-react-hooks@latest --save-dev
```

## Performance Metrics to Track

| Metric                   | Target   | Description                                |
| ------------------------ | -------- | ------------------------------------------ |
| First Contentful Paint   | < 1.8s   | Time until first content appears           |
| Largest Contentful Paint | < 2.5s   | Time until largest content element renders |
| Time to Interactive      | < 3.8s   | Time until page is fully interactive       |
| Cumulative Layout Shift  | < 0.1    | Visual stability metric                    |
| Bundle Size              | Minimize | Total JavaScript payload                   |
| Cache Hit Rate           | > 80%    | Effectiveness of caching strategy          |

## Tools & Techniques

### Profiling Tools

- React DevTools Profiler
- Chrome DevTools Performance tab
- Lighthouse audits
- Bundle analyzer (`webpack-bundle-analyzer`)

### Optimization Techniques

1. **Code Splitting**: Lazy load non-critical components
2. **Memoization**: Prevent unnecessary re-renders with `React.memo`, `useMemo`, `useCallback`
3. **Caching**: Implement stale-while-revalidate patterns
4. **Debouncing/Throttling**: Limit expensive operations
5. **Virtualization**: For large lists (react-window, react-virtualized)

## Workflow

1. **Identify Issues**
   - Run build and lint to find errors
   - Profile application performance
   - Review component render cycles

2. **Analyze Root Cause**
   - Use systematic debugging approach
   - Trace data flow and identify bottlenecks
   - Compare against best practices

3. **Implement Fixes**
   - Make minimal, targeted changes
   - One fix at a time
   - Test thoroughly after each change

4. **Verify Improvements**
   - Re-run build and lint
   - Execute test suite
   - Measure performance metrics
   - Document changes and impact

5. **Document & Share**
   - Update performance-engineer.md
   - Create PR with detailed description
   - Share learnings with the team

## Success Criteria

- [ ] Build passes successfully (0 errors)
- [ ] Lint passes (0 errors, minimal warnings)
- [ ] Type-check passes (0 errors)
- [ ] All relevant tests pass
- [ ] Performance metrics improved or maintained
- [ ] No breaking changes introduced
- [ ] Documentation updated

## Current Optimizations in This Project

### Completed

1. **Cache Performance** (`src/lib/cache.ts`)
   - Miss tracking for accurate hit rate calculation
   - Collision-resistant SHA-256 hashing
   - Proper cache invalidation

2. **Client-Side Caching** (`src/lib/use-cache.ts`)
   - Stale-while-revalidate pattern
   - localStorage-based caching
   - TTL-based expiration

3. **Bundle Optimization** (`src/app/clarify/page.tsx`)
   - Dynamic imports for components
   - Reduced initial bundle size

4. **Component Memoization** (`src/components/ClarificationFlow.tsx`)
   - `React.memo` to prevent unnecessary re-renders
   - Optimized dependency arrays

### Fixed Issues

1. **Fixed**: Removed synchronous `setState` calls within `useEffect` in clarify page
2. **Fixed**: Added missing `eslint-plugin-react-hooks` dependency
3. **Fixed**: Removed unused variables causing lint errors

## Resources

- [React Performance Documentation](https://react.dev/learn/render-and-commit)
- [Next.js Performance Best Practices](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web Vitals](https://web.dev/vitals/)
- [Performance Engineering Patterns](./performance-optimization.md)

---

Last Updated: 2026-02-07
Performance Engineer: CMZ Agent
