# Sentinel Security Journal

## 2026-03-16 - [CSRF Platform-Level Bypass]
**Vulnerability:** CSRF protection was using broad suffix-based matching for .vercel.app and .pages.dev domains.
**Learning:** This allowed any other application hosted on the same platform (Vercel or Cloudflare Pages) to bypass CSRF validation, as their origins would also end with the trusted suffix.
**Prevention:** Use exact origin matching for all trusted domains. Avoid endsWith or broad regex patterns when validating security-sensitive headers like Origin.

## 2026-03-16 - [Insecure ID Generation]
**Vulnerability:** Multiple modules were using Math.random().toString(36) for session IDs, request IDs, and other identifiers.
**Learning:** Math.random() is not cryptographically secure and can be predictable. Using a centralized utility ensures that the best available secure random source is used across the codebase.
**Prevention:** Standardize on globalThis.crypto.randomUUID() or getRandomValues() for all identifier generation. Centralize these in a zero-dependency utility to ensure consistent application.
