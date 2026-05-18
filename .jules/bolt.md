## 2025-05-21 - [Caching Key Classification in PII Redaction]
**Learning:** Caching key classification (Safe, Sensitive, Redactable) in a recursive object traversal avoids redundant regex executions and string allocations (like `toLowerCase()`). This is particularly effective for large arrays of objects with identical schemas, such as API logs.
**Action:** Always consider caching property-name classification when performing recursive operations on unknown object structures in hot paths.
