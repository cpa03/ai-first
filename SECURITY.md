# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability, please report it by opening a GitHub issue with the `security` and `P0` labels. For critical vulnerabilities that should not be publicly disclosed immediately, please contact the maintainers directly.

**Please do not open public issues for critical security vulnerabilities.**

---

## Security Measures

### Supabase Service Role Key Protection

The Supabase Service Role Key grants full administrative access to the database, bypassing all Row Level Security (RLS) policies. We implement multiple layers of protection:

#### 1. Runtime Browser Detection

```typescript
if (typeof window !== 'undefined') {
  throw new Error('CRITICAL SECURITY VIOLATION: ...');
}
```

This ensures the service role key can never be accessed from browser contexts.

#### 2. Lazy Loading

The admin client is lazy-loaded and only initialized when explicitly requested in server-side contexts.

#### 3. Environment Variable Isolation

- Server-only: `SUPABASE_SERVICE_ROLE_KEY`
- Client-safe: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

The service role key never has the `NEXT_PUBLIC_` prefix, ensuring Next.js never bundles it for the client.

#### 4. API Route Abstraction

All privileged database operations go through authenticated API routes:

```typescript
// Client-side (safe)
const response = await fetch(`/api/ideas/${id}`, { method: 'PUT', ... });

// Server-side API route (has admin access)
const updated = await dbService.updateIdea(id, updates);
```

### Environment Variables

Required environment variables:

```bash
# Client-side (safe to expose)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Server-side only (NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

### Content Security Policy

We recommend implementing the following security headers:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
Cross-Origin-Resource-Policy: same-origin
Cross-Origin-Opener-Policy: same-origin-allow-popups
```

### Cross-Origin Security Headers (Added 2026-02-19)

We implement modern cross-origin security headers to prevent cross-origin attacks:

| Header                         | Value                      | Purpose                                                                               |
| ------------------------------ | -------------------------- | ------------------------------------------------------------------------------------- |
| `Cross-Origin-Resource-Policy` | `same-origin`              | Prevents cross-origin resource leaks (CORP)                                           |
| `Cross-Origin-Opener-Policy`   | `same-origin-allow-popups` | Isolates browsing context, prevents cross-origin attacks while allowing popup windows |

These headers address Issue #1171 (Security Hardening) and align with OWASP recommendations.

### CSP Violation Reporting (Added 2026-02-19)

We monitor Content Security Policy violations to detect potential XSS attacks and policy misconfigurations:

| Feature       | Description                                        |
| ------------- | -------------------------------------------------- |
| **Endpoint**  | `/api/csp-report` (POST)                           |
| **Purpose**   | Receives CSP violation reports from browsers       |
| **Response**  | 204 No Content (efficient for browser reporting)   |
| **Logging**   | All violations logged with severity classification |
| **Issue Ref** | #891 (partial - CSP reporting capability)          |

**Severity Classification**:

| Severity | Condition                                               |
| -------- | ------------------------------------------------------- |
| ERROR    | Script violations from external sources (potential XSS) |
| WARN     | Default source and resource violations                  |
| INFO     | Other policy violations                                 |

The reporting endpoint is designed to be lightweight and non-blocking for browsers. It logs all violations with contextual information for security incident response.

---

## Security Checklist

### For Developers

- [ ] Never use `SUPABASE_SERVICE_ROLE_KEY` in client components
- [ ] Always use API routes for privileged operations
- [ ] Never prefix sensitive variables with `NEXT_PUBLIC_`
- [ ] Always validate and sanitize user input
- [ ] Use parameterized queries (Supabase client does this automatically)
- [ ] Implement proper authentication checks in API routes
- [ ] Review bundle analyzer output for sensitive data

### For DevOps

- [ ] Rotate `SUPABASE_SERVICE_ROLE_KEY` periodically
- [ ] Monitor for unauthorized database access
- [ ] Enable Supabase audit logging
- [ ] Configure IP allowlisting in Supabase (if applicable)
- [ ] Set up security alerting for suspicious activity
- [ ] Regular dependency vulnerability scanning

---

## Security Audit History

| Date       | Issue                                          | Status           | Report                                                     |
| ---------- | ---------------------------------------------- | ---------------- | ---------------------------------------------------------- |
| 2026-02-17 | #1135 - Service Role Key Exposure              | ✅ Resolved      | [View Report](./docs/security/SECURITY_AUDIT_P0_1135.md)   |
| 2026-02-18 | #1185 - npm audit vulnerabilities (ajv/eslint) | ✅ Accepted Risk | DevDependencies only, not exploitable                      |
| 2026-02-18 | #1171 - Consolidated Security Hardening        | 🔄 In Progress   | Multiple security items being addressed                    |
| 2026-02-19 | #1171 - Cross-Origin Security Headers Added    | ✅ Implemented   | CORP and COOP headers added per OWASP recommendations      |
| 2026-02-19 | #891 - CSP Violation Reporting                 | ✅ Implemented   | /api/csp-report endpoint for XSS monitoring                |
| 2026-02-20 | #878 - Rate Limiting for CSP Report Endpoint   | ✅ Implemented   | Added rate limiting (60 req/min) to prevent DoS abuse      |
| 2026-02-20 | #1171 - Health Endpoint Sensitive Var Filter   | ✅ Implemented   | Added OAUTH, WEBHOOK, SALT, HMAC, APIKEY patterns          |
| 2026-02-20 | #1171 - PII Redaction Enhancement              | ✅ Implemented   | Added IBAN, SWIFT/BIC, Tax ID, NINO, License patterns      |
| 2026-02-20 | #1171 - CSP worker-src/manifest-src Directives | ✅ Implemented   | Added missing CSP directives for web workers and manifests |
| 2026-02-21 | #841 - Centralized Test Secrets Management     | ✅ Implemented   | Added MOCK_SECRETS object with safe test credential values |
| 2026-02-21 | CSP 'unsafe-eval' Directive Removed            | ✅ Implemented   | Hardened CSP by removing eval permission (not used)        |
| 2026-02-21 | Metrics Endpoint Authentication                | ✅ Implemented   | Added admin auth requirement for /api/metrics endpoint     |
| 2026-02-21 | #1171 - Sensitive Variable Patterns Enhanced  | ✅ Implemented   | Added PEM, KEYSTORE, ENCRYPTION, DECRYPT, MFA, MNEMONIC, RECOVERY, BACKUP, SEED, JWK patterns |
| 2026-02-22 | Security Audit Event Logging Added            | ✅ Implemented   | Added SecurityAuditLog module for structured security event logging |

## Current npm Audit Status (2026-02-18)

**Summary**: 46 vulnerabilities detected (1 low, 18 moderate, 27 high, 0 critical)

### Vulnerability Breakdown

| Category             | Count | Risk Level | Notes                                            |
| -------------------- | ----- | ---------- | ------------------------------------------------ |
| Production deps      | 0     | ✅ Safe    | No direct production vulnerabilities             |
| DevDependencies      | 46    | ⚠️ Low     | All in dev tooling, not deployed                 |
| Transitive (AWS SDK) | 27    | ⚠️ Low     | From @opennextjs/cloudflare, not used at runtime |

### Accepted Risks

1. **eslint/ajv vulnerabilities** (18 moderate) - DevDependencies only
   - ReDoS in ajv when using `$data` option
   - Not exploitable in production builds
   - Breaking change required to update

2. **fast-xml-parser** (27 high) - Transitive dependency
   - From @opennextjs/cloudflare → AWS SDK chain
   - DoS through entity expansion in DOCTYPE
   - Not used at runtime in deployed application
   - Requires major dependency tree changes to fix

### Mitigation

- Production dependencies are clean (0 vulnerabilities)
- All vulnerabilities are in development/build tooling
- Runtime application is not affected
- Regular monitoring for new vulnerabilities

---

## Related Documentation

- [Security Audit Report #1135](./docs/security/SECURITY_AUDIT_P0_1135.md)
- [Architecture Documentation](./docs/architecture.md)
- [Environment Configuration](./config/.env.example)

---

_Last Updated: 2026-02-21_
