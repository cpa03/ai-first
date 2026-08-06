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

## 2026-07-29 - Timing Side-Channel in Byte Array Comparisons

**Vulnerability:** The local `safeEqual` comparison function in `src/lib/auth.ts` returned `false` immediately on length mismatches before checking byte contents. While SHA-256 hashes are of a fixed size, this early return pattern leaks length/format details via a timing side-channel and represents an insecure coding pattern.
**Learning:** Handcrafted comparison algorithms often inadvertently prioritize efficiency over constant-time security constraints. Even when input sizes are expected to be fixed, early-returning short circuits allow timing leaks.
**Prevention:** Always use a platform-agnostic, constant-time comparison helper (such as `timingSafeEqualArrays`) that iterates across the maximum of both inputs' lengths to ensure uniform execution times under all circumstances.

## 2026-07-31 - CSRF Blockage on Browser Out-of-Band Security Reporting (CSP Reports)

**Vulnerability:** The Content Security Policy violation report endpoint (`/api/csp-report`) processed incoming `POST` requests through the standard `withApiHandler` wrapper. Because `skipCSRF` was not enabled, the wrapper subjected all inbound reports to full CSRF verification, rejecting legitimate browser-level reports when security-conscious browsers omitted or modified the `Origin` or `Referer` headers.
**Learning:** Browsers dispatch native security notifications (like CSP reports) out-of-band. Because they are not standard user-driven AJAX calls, they do not carry custom anti-csrf headers. Subjecting these telemetry routes to session/origin CSRF validation causes reports to fail silently or be blocked, degrading security audit visibility.
**Prevention:** Always bypass CSRF origin and token validation on telemetry/auditing API endpoints (like CSP reports) that do not perform state changes or side effects on behalf of user sessions.

## 2026-08-01 - SSRF Detection Gaps for Shorthand Loopback and Protocol-Relative Formats

**Vulnerability:** The Server-Side Request Forgery (SSRF) detection patterns in `src/lib/config/security-patterns.ts` were vulnerable to bypasses using shorthand IPv4 loopback notation (e.g. `127.1`, `127.0.1`), class A loopback subnet ranges (e.g., `127.12.34.56`), and non-standard/omitted protocol prefixes (e.g., `//0x7f000001` or raw numeric/hex formats like `2130706433` or `0x7f000001`).
**Learning:** Security rules that strictly check contiguous strings or expect specific protocol schemes (`http(s)://`) are easily bypassed by browsers and parsers that automatically normalize or resolve alternate IP formats, protocol-relative syntax, or omitted schemes.
**Prevention:** Design input validation and security patterns defensively to match any standard loopback address in the entire `127.0.0.0/8` block and support optional, omitted, or protocol-relative schemes for non-standard IP encodings.

## 2026-08-06 - SSRF Bypass via Advanced IPv6 Loopback and Unspecified Addresses

**Vulnerability:** SSRF blocklist patterns in `src/lib/config/security-patterns.ts` did not detect advanced/alternate IPv6 loopback (e.g., `[0:0:0:0:0:0:0:1]`, `[0::1]`) and unspecified (e.g., `[0:0:0:0:0:0:0:0]`, `[0::0]`, `[0::]`) representations. Attackers can leverage these representations to bypass naive SSRF filters since web clients still resolve them to local targets.
**Learning:** Regex-based SSRF mitigations often overlook the rich variety of formats supported by IPv6 (e.g., full-length, double-colon compressed, optional trailing colons, and varying zero-padding).
**Prevention:** Always design IPv6 loopback patterns defensively with robust patterns that match brackets containing any valid IPv6 loopback and unspecified variants (both compressed and full-length, ending in 0 or 1).
