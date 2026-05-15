## 2026-05-15 - Insecure Randomness in Sensitive Contexts
**Vulnerability:** Use of insecure `Math.random()` for generating subscription IDs and performing analytics/logger sampling.
**Learning:** While `Math.random()` is fine for UI effects, it's predictable and shouldn't be used for identifiers or security-relevant logic (like sampling sensitive logs).
**Prevention:** Use `globalThis.crypto.getRandomValues` to implement a `secureRandom()` utility for all security-sensitive random needs.
