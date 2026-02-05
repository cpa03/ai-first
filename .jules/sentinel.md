# Sentinel's Journal 🛡️

## 2025-05-15 - Incomplete PII Redaction and Unsanitized Logging
**Vulnerability:** The PII redaction utility was failing to redact sensitive fields like `apiKey` because it only checked for exact matches of a small, hardcoded list of field names. Additionally, the `apiKey` regex required a specific label prefix, failing to redact keys passed as standalone values. Finally, the database service was logging agent actions directly to Supabase without any sanitization.

**Learning:** Relying on exact string matches for sensitive field names is brittle in TypeScript/JavaScript where camelCase (`apiKey`) and snake_case (`api_key`) are both common. Security utilities must be defensive and handle common naming variations. Furthermore, sanitization must be applied at the lowest possible layer (e.g., the database service) to ensure all logs are protected regardless of the caller.

**Prevention:** Use case-insensitive fuzzy matching for sensitive field names and ensure all logging pipelines pass through a sanitization layer. Regularly update regex patterns to match common credential formats (e.g., OpenAI, Stripe).

## 2026-02-05 - Infinite Recursion in Error Object Redaction
**Vulnerability:** The recursive PII redaction logic (`redactPIIInObject`) failed to prevent infinite recursion when processing `Error` objects that contained circular references or when incorrectly re-processing the same object during its conversion to a POJO.

**Learning:** `Error` objects are unique in JavaScript because many of their standard properties (like `message`, `stack`) are non-enumerable and are lost when using `Object.entries` or spread operators. Attempting to manually extract these and then recursively redacting the resulting object requires careful management of a `WeakSet` (or similar tracking mechanism) *before* deep-diving into the object's properties to avoid circularity issues.

**Prevention:** Always add the object to a "seen" set at the very beginning of the recursive function before any type-specific processing occurs, and ensure this set is passed through all recursive calls. Use `Object.getOwnPropertyNames` if you need to ensure all properties (including non-enumerable ones) are captured and sanitized.
