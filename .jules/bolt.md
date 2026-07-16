
## 2026-07-16 - [Global Object Caching vs. Testability]
**Learning:** Caching cryptographic methods at the module level (e.g., `const nativeRandomUUID = crypto.randomUUID.bind(crypto)`) provides a minor speedup but breaks tests that mock or remove the `crypto` global, as the cached reference persists across test isolation boundaries in some environments.
**Action:** For performance-critical global utilities, prioritize optimizing expensive operations (like string manipulation) while maintaining live access to global feature detection (e.g., `GLOBAL_OBJ.crypto`) to ensure compatibility with test suites and dynamic environments.
