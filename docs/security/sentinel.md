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

## 2026-08-08 - Loose Integration Secrets Validation Gaps

**Vulnerability:** High-risk third-party client secrets (`GITHUB_CLIENT_SECRET`, `NOTION_CLIENT_SECRET`), OAuth refresh tokens (`GOOGLE_REFRESH_TOKEN`), and private analytics keys (`POSTHOG_API_KEY`) were not covered by strict server startup validation. This could lead to accidental frontend exposure through `NEXT_PUBLIC_` prefixes, use of default/example values, or weak/short keys in production.
**Learning:** When adding standard environment variable keys or examples to configuration, developers often neglect registering them in strict runtime security validators. This results in inconsistent protection where some integrations are hardened while others remain vulnerable to leakage or weak configurations.
**Prevention:** Centralize all sensitive integration credentials in type-safe environment key accessors and map them directly into a strict validation whitelist. Ensure any private OAuth or client secret is explicitly protected against frontend bundling and validated for high-entropy strength in production.

## 2026-08-10 - SSRF Bypass via IPv6-Mapped IPv4 Loopback Subnets

**Vulnerability:** The Server-Side Request Forgery (SSRF) security patterns only detected a single hardcoded IPv6-mapped IPv4 loopback representation (`::ffff:127.0.0.1`). Attackers could bypass this filter by utilizing other valid loopback addresses in the `127.0.0.0/8` subnet (e.g. `::ffff:127.0.0.2`, `::ffff:127.12.34.56`) or shorthand formats (e.g. `::ffff:127.1`) which are internally resolved to local interfaces by modern network clients.
**Learning:** Checking a single static loopback mapped address fails to secure the full block of 16.7 million loopback IPs that modern network clients happily resolve. Pattern-based blocklists must cover the entire `127.0.0.0/8` subnet and shorthand notations, mirroring how IPv4 loopback security filters are designed.
**Prevention:** Always design IPv6-mapped IPv4 loopback patterns to capture the full `127.0.0.0/8` subnet prefix range (`127\.(?:[0-9]{1,3}\.){1,3}[0-9]{1,3}`) along with standard shorthand variations (`127.1`).

## 2026-08-11 - Stream Consumption and Edge Compatibility in Request Signature Verification

**Vulnerability:** Request signature verification in `src/lib/security/request-signer.ts` consumed the request body stream directly using `request.text()`. In modern Edge and Serverless runtimes, this prematurely locks and exhausts the readable stream, causing subsequent route handlers to fail with `TypeError: body stream already read` errors or prevent validation of requests with payloads.
**Learning:** Web APIs enforce a single-consumption rule on request/response body streams. Middleware and interceptors that perform validation checks (such as HMAC signature verification) must not mutate or exhaust the request stream before it reaches the main handlers.
**Prevention:** Always clone the Request object (`request.clone().text()`) when performing out-of-band body inspection, signature verification, or logging, ensuring downstream route handlers can safely consume the request body.

## 2026-08-13 - AI Model Parameter Validation Length Limits

**Vulnerability:** The AI model configuration validation in `src/lib/validation.ts` (`validateModelName`) lacked a maximum length check on user-supplied model name strings. This exposed the application to potential Denial of Service (DoS) and memory/CPU resource exhaustion attacks through excessively long model names causing expensive regex execution and string manipulation overhead on the server-side.
**Learning:** Standard security validation schemes often focus on pattern matches (like allowed prefixes or character sets) but fail to enforce basic length boundaries. This can be exploited to cause denial of service via catastrophic regex backtracking or high allocation overhead.
**Prevention:** Always enforce strict length limits on any parameter input fields (such as a maximum of 100 characters for AI model names) before matching against complex regexes or processing them in down-stream integrations.

## 2026-08-15 - Unhandled Serialization Exception Vulnerability in JSON-LD Rendering

**Vulnerability:** The `safeJsonLd` utility in `src/lib/security/json-ld.ts` passed inputs directly to `JSON.stringify(obj)` without error wrapping. When passed unstringifiable or throwing values (such as circular references, `BigInt` values, or `undefined`), `JSON.stringify` throws a `TypeError` or returns `undefined`, causing server-side rendering (SSR) crashes during HTML generation in `src/app/layout.tsx`.
**Learning:** Utilities that sanitize or prepare dynamic data for HTML insertion (`dangerouslySetInnerHTML`) must be completely crash-resilient. Uncaught exceptions during stringification in SSR layouts lead to application-wide Denial of Service or broken rendering pipelines.
**Prevention:** Always wrap `JSON.stringify` calls in security and HTML rendering utilities with `try...catch` blocks and explicitly validate that the output string is defined, falling back gracefully to a safe empty structure (`'{}'`).

## 2026-08-22 - SSRF Bypass via Dotted Octal Loopback IP Encodings

**Vulnerability:** SSRF detection patterns in `src/lib/config/security-patterns.ts` only matched decimal IPv4 loopback notation (`127.x.x.x`). Attackers could bypass localhost filters by specifying octal-encoded loopback addresses (e.g. `0177.0.0.1`, `0177.0000.0000.0001`, `0177.1`), which operating systems and network clients resolve to `127.0.0.1`.
**Learning:** Network stacks interpret numbers with leading zeros in IP octets as octal (e.g., `0177` = `127` in decimal). Regex patterns matching strictly `127` miss these equivalent octal representations.
**Prevention:** Design IPv4 loopback detection regexes to support both decimal `127` and octal `0177` prefixes across full and shorthand IP octets.
