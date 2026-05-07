# Sentinel Security Journal

## 2026-05-07 - Rate Limit JWT Collision Fix
**Vulnerability:** User rate-limit identifiers for Bearer tokens were created using only the first 32 characters of the token. Since JWT headers (the first part) are often identical for all users of the same application, this caused multiple different users to share a single rate-limit bucket, leading to unfair throttling and potential DoS vectors.
**Learning:** Substring-based identification for structured tokens (like JWTs) is highly prone to collisions. Centralized hashing of the entire token is necessary for unique identification while maintaining short identifiers.
**Prevention:** Always hash the full authentication token when using it as a unique identifier for rate limiting or caching. Use a consistent, environment-aware hashing utility like `simpleHash`.

## 2026-05-07 - Cryptographically Secure Session IDs
**Vulnerability:** Session IDs were generated using `Math.random()`, which is not cryptographically secure and can be predictable in some environments.
**Learning:** `Math.random()` should be avoided for any identifier that requires security or uniqueness guarantees. `globalThis.crypto.randomUUID()` is the modern standard but requires robust fallbacks for edge runtimes like Cloudflare Workers where the global `crypto` object might have different availability characteristics during SSR or static builds.
**Prevention:** Use a centralized `generateId` utility that handles environment detection and provides secure fallbacks (using `crypto.getRandomValues`) to ensure robust ID generation across Browsers, Node.js, and Edge runtimes.
