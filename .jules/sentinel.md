## 2026-05-26 - [NoSQL Injection Key Filtering]
**Vulnerability:** NoSQL injection via bracket notation in query parameter keys (e.g., `?id[$ne]=null`) was not detected because the security filter only scanned request *values*.
**Learning:** Web frameworks often parse query strings with brackets into nested objects, allowing attackers to inject operators directly into the logic of database queries if only the resulting values are sanitized.
**Prevention:** Always scan both the keys and values of incoming request parameters (query and headers) for suspicious patterns, and ensure regex patterns for NoSQL operators account for both JSON (`:`) and bracket (`]`) delimiters.
