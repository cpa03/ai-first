## 2026-02-03 - Optimize AI Context Management and Fix Infinite Loop
**Learning:** The previous context windowing logic used an $O(n^2)$ approach by recalculating token estimates inside a `while` loop that removed messages one by one. Furthermore, it had an edge case where a context with only system messages and exceeding the token limit would result in an infinite loop, as `nonSystemMessages.shift()` would return `undefined` and not change the context length.
**Action:** Pre-calculate the total characters and use a single-pass subtraction logic to achieve $O(n)$ complexity. Also, add explicit checks on `nonSystemMessages.length` to prevent infinite loops when only system messages remain.

## 2026-02-04 - Optimize Cache TTL Eviction to O(k)
**Learning:** The `Cache` implementation was performing an $O(n)$ scan on every `set()` operation to evict expired entries. By leveraging the fact that JavaScript `Map` preserves insertion order, and ensuring updates move keys to the end (via delete/set), we can stop the expiration scan at the first non-expired entry, achieving $O(k)$ complexity (where $k$ is the number of expired items).
**Action:** Always delete and re-set keys in `Map`-based caches to maintain chronological order, allowing for early-exit optimizations during eviction.

## 2026-02-05 - Optimize PII Redaction with Single-Pass Regex and Named Capture Groups
**Learning:** Sequential `.replace()` calls on a string result in multiple full scans (one per pattern). By combining multiple patterns into a single regex with named capture groups, we can achieve single-pass redaction, which significantly improves performance (approx. 50% speedup in this codebase). Additionally, combining an array of regex tests into a single alternation regex and using `Set` for lookups provides further algorithmic wins in recursive object processing.
**Action:** Prefer single-pass regex with named capture groups for multiple string replacements, and use `Set` for constant-time lookups instead of array searches.
