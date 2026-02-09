# Sentinel's Journal 🛡️

## 2025-05-15 - Incomplete PII Redaction and Unsanitized Logging
**Vulnerability:** The PII redaction utility was failing to redact sensitive fields like `apiKey` because it only checked for exact matches of a small, hardcoded list of field names. Additionally, the `apiKey` regex required a specific label prefix, failing to redact keys passed as standalone values. Finally, the database service was logging agent actions directly to Supabase without any sanitization.

**Learning:** Relying on exact string matches for sensitive field names is brittle in TypeScript/JavaScript where camelCase (`apiKey`) and snake_case (`api_key`) are both common. Security utilities must be defensive and handle common naming variations. Furthermore, sanitization must be applied at the lowest possible layer (e.g., the database service) to ensure all logs are protected regardless of the caller.

**Prevention:** Use case-insensitive fuzzy matching for sensitive field names and ensure all logging pipelines pass through a sanitization layer. Regularly update regex patterns to match common credential formats (e.g., OpenAI, Stripe).

## 2025-05-16 - Missing Security Headers for API Routes
**Vulnerability:** Security headers such as `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and Content Security Policy (CSP) were explicitly excluded from all `/api` routes in the middleware configuration. This left the API vulnerable to MIME-sniffing and potentially other cross-origin attacks if accessed via a browser.

**Learning:** Security headers are just as important for APIs as they are for frontend pages. While some headers like CSP are primarily browser-focused, they still provide a layer of defense-in-depth for API responses, especially when those responses might be rendered or handled by a browser.

**Prevention:** Ensure security middleware covers all application routes, including API endpoints. Avoid using middleware matchers that exclude large portions of the application's attack surface.

## 2026-02-09 - Missing Redaction for Admin Keys
**Vulnerability:** The PII redaction utility was missing patterns for administrative keys (e.g., `admin_key`, `admin-key`, `adminkey`), allowing these secrets to be logged in plain text in both string logs and object payloads.
**Learning:** Security-sensitive prefixes must be consistently applied across both string-based (`redactPII`) and object-based (`redactPIIInObject`) redaction logic. When adding new patterns, care must be taken with regex character classes; for example, `[_- ]` can cause "Range out of order" errors in some environments if the hyphen is not at the start or end.
**Prevention:** Regularly audit the list of sensitive prefixes and ensure they cover common administrative credential names. Use shared constants where possible, but verify that regex literals are correctly updated to match.
