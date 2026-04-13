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

## 2026-02-19 - Fragmentation and Insecurity in Unique Identifier Generation

**Vulnerability:** Widespread use of `Math.random().toString(36)` for security-sensitive identifiers (Session IDs, Subscription IDs, A/B test keys) across core modules. While some modules (`logger.ts`, `timeline.ts`) attempted secure generation with manual `crypto.randomUUID()` checks, others completely bypassed it, leading to a fragmented and partially insecure identity system.
**Learning:** Organic growth of a codebase often leads to "copy-paste" patterns of utility logic. Without a centralized, hardened utility for common tasks like ID generation, developers default to the easiest (and often least secure) methods available in the global namespace.
**Prevention:** Centralize all security-sensitive utility logic (like ID generation) into a single, well-tested module (`src/lib/utils.ts`). Use automated security scanners (like `scripts/security-check.sh`) to enforce the use of these centralized utilities and flag insecure global alternatives like `Math.random()` in non-UI contexts.
