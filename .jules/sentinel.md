# Sentinel Security Journal

## 2026-06-25 - [SSRF Bypass Detection Enhancement]
**Vulnerability:** Simple SSRF filters often only look for standard decimal IP strings (e.g., `127.0.0.1`), allowing bypasses via non-standard encodings like hex (`0x7f000001`), decimal (`2130706433`), or octal (`017700000001`), as well as IPv6-mapped IPv4 addresses (e.g., `[::ffff:127.0.0.1]`).
**Learning:** The existing `suspicious-patterns.ts` had basic SSRF detection but missed these common obfuscation techniques used to target internal metadata services or localhost.
**Prevention:** Always include patterns for alternative IP representations and IPv6-mapped formats when implementing SSRF protection.
