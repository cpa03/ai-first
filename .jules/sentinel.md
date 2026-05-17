# Sentinel Journal

## 2026-05-17 - Avoiding Security Theater in Randomness
**Vulnerability:** Over-application of cryptographically secure random number generators (CSPRNG) in non-sensitive contexts.
**Learning:** Replacing `Math.random()` with `secureRandom()` for UI animations (e.g., ripple effects) or network retry jitter provides no real security benefit but increases code complexity and performance overhead. These values do not cross security boundaries and do not need to be unpredictable to an attacker.
**Prevention:** Only use CSPRNG (like `crypto.randomUUID()` or `generateId()`) for security-sensitive values such as tokens, session IDs, or encryption keys. For non-sensitive logic, standard pseudo-randomness is sufficient and preferred to avoid "security theater".
