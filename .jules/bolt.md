# Bolt's Performance Journal

Critical learnings from performance optimizations in this codebase.

## 2026-08-04 - [Cached Intl formatters in AutoSaveIndicator]
**Learning:** Instantiating `Intl.DateTimeFormat` dynamically on every invocation inside helpers like `toLocaleTimeString` and `toLocaleString` is extremely expensive and causes heavy CPU/GC churn in frequently updating client components. Caching them using React `useRef` guarantees fast O(1) string formatting.
**Action:** Use cached `Intl` formatters in client components that frequently format dates.
