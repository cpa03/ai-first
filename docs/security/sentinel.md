# Security Sentinel Log

This document tracks security vulnerabilities discovered and lessons learned to prevent future occurrences. Maintained by RepoKeeper as part of repository maintenance.

**Location:** Moved from `.jules/sentinel.md` to `docs/security/sentinel.md` for better visibility and documentation standards.

---

## 2025-05-15 - Stack Trace Leakage in PII Redaction

**Vulnerability:** The `redactPIIInObject` function in `src/lib/pii-redaction.ts` explicitly included the `stack` property when redacting `Error` objects. This information was then serialized and potentially sent to clients in API error responses (via `AppError.toJSON`).
**Learning:** While the tool was designed to redact PII (emails, keys, etc.) from objects, it inadvertently introduced a different security risk by including internal application structure (file paths, function names) which are contained in stack traces. The implementation prioritized debugging convenience over security by default.
**Prevention:** Always exclude sensitive internal metadata like stack traces from data structures that are intended for client-side consumption or general logging. If stack traces are needed for internal debugging, they should be handled via a separate, secure channel or restricted to non-production environments.

## 2025-05-18 - Gaps in PII Redaction for Modern API Keys and Payment Data

**Vulnerability:** The PII redaction utility and health check endpoint were missing common patterns for modern secrets (like AWS secret keys containing Base64 characters) and highly sensitive payment-related fields (CVV, CVC, PIN).
**Learning:** Standard alphanumeric regex patterns ([a-zA-Z0-9]) fail to capture many types of secrets that use full Base64 sets or other special characters. Additionally, centralized redaction lists must be kept in sync across diagnostic and logging utilities to prevent inconsistent data exposure.
**Prevention:** Use comprehensive regex patterns that include Base64 characters (`/`, `+`, `=`) for API key redaction. Centralize sensitive keyword lists used by both health checks and log redaction utilities to ensure consistent protection across the application.

## 2026-04-18 - Environment-Agnostic Secure ID and Hashing

**Vulnerability:** The application used inconsistent and sometimes insecure methods for generating identifiers and hashing tokens across different environments. Specifically, it relied on 'node:crypto' which is unavailable in Edge environments (like Cloudflare Workers), and used weak hashing (djb2 or simple substrings) for anonymizing user tokens in rate limiting.
**Learning:** Security utilities must be environment-agnostic to ensure consistent behavior between Node.js and Edge runtimes. Relying on platform-specific modules like 'node:crypto' leads to runtime errors or requires insecure fallbacks when deployed to the Edge.
**Prevention:** Centralize all ID generation and hashing in a dedicated, platform-agnostic utility (`src/lib/id-generator.ts`) that uses globally available Web Crypto APIs (`globalThis.crypto`). Always use stable, collision-resistant hashing for anonymizing sensitive data like tokens.
