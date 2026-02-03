## 2026-02-03 - Optimize AI Context Management and Fix Infinite Loop
**Learning:** The previous context windowing logic used an $O(n^2)$ approach by recalculating token estimates inside a `while` loop that removed messages one by one. Furthermore, it had an edge case where a context with only system messages and exceeding the token limit would result in an infinite loop, as `nonSystemMessages.shift()` would return `undefined` and not change the context length.
**Action:** Pre-calculate the total characters and use a single-pass subtraction logic to achieve $O(n)$ complexity. Also, add explicit checks on `nonSystemMessages.length` to prevent infinite loops when only system messages remain.

## 2026-02-03 - Leveraging Map Insertion Order for O(1) Cache Eviction
**Learning:** JavaScript's `Map` preserves insertion order. By re-inserting keys on `set()`, we can maintain a strict chronological order. This allows `evictExpiredEntries` to break at the first non-expired entry ($O(k)$ instead of $O(n)$) and enables $O(1)$ LRU candidate identification.
**Action:** Always `delete` then `set` on cache updates to maintain order, and use `break` in eviction loops as soon as a valid entry is encountered.
