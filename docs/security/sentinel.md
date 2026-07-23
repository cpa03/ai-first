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

## 2026-07-22 - HTML Sanitization Bypass via Protocol Obfuscation

**Vulnerability:** The HTML sanitization regex patterns was vulnerable to bypasses using whitespaces (tabs, newlines, carriage returns, or vertical tabs) or control characters inserted within sensitive protocols like `javascript:`, `vbscript:`, `livescript:`, and `data:`. Browsers naturally strip or ignore these characters in URLs, but standard strict string matches or simple regexes fail to match them, leaving the payload active.
**Learning:** Custom, regex-based sanitizers are highly prone to protocol-obfuscation bypasses because they expect contiguous, clean strings. Obfuscation techniques take advantage of the difference between how regex engines scan strings and how browser URL/HTML parsers normalize and decode attributes before executing them.
**Prevention:** Always write defensive regexes that account for optional whitespace or control characters (`[\s\x00-\x1F]*`) inside protocol names when building custom sanitizers, or prefer robust, standard parser-based sanitizers (like DOMPurify) when applicable.

## 2026-07-23 - Timing Side-Channel and Edge Compatibility in Request Signing

**Vulnerability:** Request signature verification in `src/lib/security/request-signer.ts` utilized Node.js's native `crypto.timingSafeEqual`, which expects buffers of identical length. When signature lengths differed, it threw a `TypeError`. Although caught, this created a timing discrepancy (try-throw vs normal flow execution path) and was incompatible with serverless/Edge environments (Cloudflare Workers, Vercel Edge) lacking complete Node polyfills.
**Learning:** Standard timing-safe utilities in core platforms often enforce strict type or size restrictions that leak length/format validation details via exceptions, bypassing the constant-time design. Furthermore, relying on Node-specific objects (`Buffer`, `node:crypto` functions) restricts deployment portability.
**Prevention:** Use a runtime-agnostic, constant-time character-comparison function (like `timingSafeEqualStrings`) that operates on variable-length inputs without throwing exceptions, guaranteeing constant-time behavior across all environments.
