## 2026-05-13 - [Hardened Environment Variable Exposure Detection]
**Vulnerability:** Accidental exposure of arbitrary secrets via `NEXT_PUBLIC_` prefix.
**Learning:** Previous validation only checked a hardcoded list (`SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_API_KEY`), leaving other sensitive variables (e.g., `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`) unprotected if a developer incorrectly prefixed them with `NEXT_PUBLIC_`. This would cause Next.js to bundle them into client-side code.
**Prevention:** Implement a catch-all check (`checkNextPublicExposure`) that scans all environment variables starting with `NEXT_PUBLIC_` and flags those matching `isSensitiveVar` patterns, while maintaining a whitelist (`ALLOWED_PUBLIC_KEYS`) for legitimate public variables.

## 2026-05-22 - [Deep Redaction for Security Audit Logs]
**Vulnerability:** Information leakage via nested metadata in security audit logs.
**Learning:** The `SecurityAuditLog` implementation performed shallow redaction on metadata, only checking top-level string values. Nested objects or arrays containing PII (e.g., `{ user: { email: '...' } }`) were logged in plain text, bypassing security filters.
**Prevention:** Always use deep recursive redaction (like `redactPIIInObject`) for any structured metadata being sent to loggers or external monitoring systems to ensure PII is protected regardless of nesting level.
