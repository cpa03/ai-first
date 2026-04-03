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

## 2026-04-03 - Insecure Identifier Generation via Math.random()

**Vulnerability:** Core system components (Session Analytics, Logger, A/B Testing, Event Bus) were using `Math.random()` to generate identifiers like session IDs and correlation IDs. While not directly exploitable for privilege escalation in all cases, it failed automated security audits and provided insufficient entropy for collision-resistant tracing in high-traffic scenarios.
**Learning:** `Math.random()` is PRNG-based and predictable, making it unsuitable for any identifier that might be used in a security context or requires high uniqueness guarantees. Automated audit scripts (like `scripts/security-check.sh`) correctly flag these as risks.
**Prevention:** Centralize identifier generation in a utility like `generateSecureId()` that prioritizes `crypto.randomUUID()` and `crypto.getRandomValues()`. This ensures a consistent security posture and simplifies satisfying audit requirements across the entire codebase.
