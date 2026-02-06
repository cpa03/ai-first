# Sentinel's Journal 🛡️

## 2025-05-15 - Incomplete PII Redaction and Unsanitized Logging
**Vulnerability:** The PII redaction utility was failing to redact sensitive fields like `apiKey` because it only checked for exact matches of a small, hardcoded list of field names. Additionally, the `apiKey` regex required a specific label prefix, failing to redact keys passed as standalone values. Finally, the database service was logging agent actions directly to Supabase without any sanitization.

**Learning:** Relying on exact string matches for sensitive field names is brittle in TypeScript/JavaScript where camelCase (`apiKey`) and snake_case (`api_key`) are both common. Security utilities must be defensive and handle common naming variations. Furthermore, sanitization must be applied at the lowest possible layer (e.g., the database service) to ensure all logs are protected regardless of the caller.

**Prevention:** Use case-insensitive fuzzy matching for sensitive field names and ensure all logging pipelines pass through a sanitization layer. Regularly update regex patterns to match common credential formats (e.g., OpenAI, Stripe).

## 2026-02-06 - PII Leak in API Error Responses
**Vulnerability:** Application error responses (AppError) were leaking PII (e.g., email addresses) in both the error message and the details array. Subclasses like RateLimitError were overriding the base toJSON method without implementing redaction, and the base class itself lacked redaction logic during serialization.

**Learning:** Centralizing serialization logic in a base class and applying redaction there is more robust than relying on every subclass to implement it correctly. Overriding toJSON in subclasses can easily bypass security measures implemented in the base class if not carefully managed.

**Prevention:** Apply PII redaction at the lowest possible level of the serialization pipeline (e.g., in the toJSON method of the base error class). Avoid redundant toJSON overrides in subclasses; instead, pass subclass-specific metadata to the base class's standard details structure.
