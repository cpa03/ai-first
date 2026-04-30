## 2026-02-23 - JWT Rate Limit Collision via Token Prefixing
**Vulnerability:** The application used the first 32 characters of an Authorization token as a rate-limit identifier. Since JWTs share identical headers and often similar initial payload segments, different users were incorrectly sharing the same rate limit, leading to potential Denial of Service for legitimate users and ineffective limiting for attackers.

**Learning:** When using tokens as identifiers, a fixed-length prefix is insufficient for uniqueness due to the structured nature of JWTs. Furthermore, implementing a hash function (like djb2) in JavaScript requires explicit bitwise wrapping (e.g., `| 0`) to maintain 32-bit integer precision; otherwise, floating-point precision loss on long strings (like JWTs) causes hash collisions.

**Prevention:** Always hash the full token using a collision-resistant algorithm. In JavaScript, ensure non-cryptographic hashes are constrained to 32-bit integer ranges using bitwise operators to prevent precision-related collisions.
