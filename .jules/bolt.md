# Bolt Performance Learning Journal

## 2026-07-19 - Robust Memoization of Date Parsing across Mocked Environments
**Learning:** `new Date(dateString)` is heavily used during list rendering but parsing strings repeatedly is a major CPU bottleneck (~13x slower than a Map lookup). Caching parsed Date objects provides an immense speedup. However, in Jest tests that mock or subclass the global `Date` constructor, standard `instanceof Date` checks fail across module boundaries because the input is an instance of the mocked class while the module checks against the original `Date` class.
**Action:** Use `Object.prototype.toString.call(value) === '[object Date]'` as a bulletproof fallback check to reliably recognize subclassed or mocked Date instances cross-boundary.
