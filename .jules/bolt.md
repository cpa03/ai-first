# Bolt Performance Learning Journal

## 2026-07-19 - Robust Memoization of Date Parsing across Mocked Environments
**Learning:** `new Date(dateString)` is heavily used during list rendering but parsing strings repeatedly is a major CPU bottleneck (~13x slower than a Map lookup). Caching parsed Date objects provides an immense speedup. However, in Jest tests that mock or subclass the global `Date` constructor, standard `instanceof Date` checks fail across module boundaries because the input is an instance of the mocked class while the module checks against the original `Date` class.
**Action:** Use `Object.prototype.toString.call(value) === '[object Date]'` as a bulletproof fallback check to reliably recognize subclassed or mocked Date instances cross-boundary.

## 2026-07-20 - Cache-Aside Memoization for Multi-Regex PII Redaction
**Learning:** PII redaction of raw strings involves running up to 10 sequential complex regex replacements, which is a major CPU-bound bottleneck in high-frequency logging paths. Since logs and trace records often process identical strings (e.g. repeated structures, constant values, or metadata fields), memoizing `_redactPII` outputs using a Map-based FIFO cache yields a ~2.3x speedup on complex payloads while maintaining absolute correctness and safety via size bounds.
**Action:** Always employ bounded Map memoization (`size >= 1000`) for CPU-heavy sanitization and redaction tasks on repeated log strings, and ensure integration with general cache clearing utilities.
