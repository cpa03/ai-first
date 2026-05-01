## 2026-02-23 - JWT Rate-Limit Identifier Collision
**Vulnerability:** Authenticated users were sharing the same rate-limit bucket because identifiers were generated using only the first 32 characters of the Authorization token. Standard JWT headers are often identical and exceed 32 characters when encoded.
**Learning:** Using substrings of structured tokens (like JWTs) for unique identification is insecure as it ignores the variable part of the token (the payload and signature).
**Prevention:** Always hash the entire token or extract a verified unique claim (like 'sub') to generate identifiers. Deterministic non-cryptographic hashes like djb2 are sufficient for rate-limit keys.
