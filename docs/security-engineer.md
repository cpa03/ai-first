# Security Engineer Guide

**Role**: Security Engineer Specialist
**Last Updated**: 2026-02-21
**Status**: ✅ Active

---

## Overview

This document provides security-focused guidelines, findings, and best practices for the IdeaFlow application. It serves as a central reference for security-related decisions, vulnerabilities, fixes, and ongoing security maintenance.

---

## Security Posture

**Overall Security Score**: 8.5/10

### Strengths

- ✅ **Zero production vulnerabilities** (41 vulnerabilities in devDependencies only - accepted risk)
- ✅ **Comprehensive security headers** (CSP, HSTS, X-Frame-Options, etc.)
- ✅ **Proper secrets management** (environment variables, no hardcoded secrets)
- ✅ **Input validation** on all API endpoints
- ✅ **Rate limiting** with tiered structure
- ✅ **PII redaction** for logs and error messages
- ✅ **Circuit breakers** for external service resilience
- ✅ **Secure error handling** (no information leakage)

### Areas for Improvement

- ⚠️ **Rate limiting** is in-memory only (won't scale across multiple instances)
- ⚠️ **CSP uses 'unsafe-inline'** (necessary for Next.js, but could be enhanced with nonces in future)
- ✅ **CSP 'unsafe-eval' removed** (2026-02-21 - codebase doesn't use eval)
- ⚠️ **Admin authentication** is basic API key only
- ⚠️ **npm audit** shows 33 vulnerabilities in devDependencies:
  - 32 HIGH: Mostly from @aws-sdk/\* packages via @opennextjs/cloudflare (Cloudflare deployment tool)
  - 1 MODERATE: ajv/eslint ecosystem (ReDoS vulnerability - not exploitable)
  - All vulnerabilities are in devDependencies only - no production runtime risk

---

## Security Fixes Log

### 2026-02-25: Request Signing for Internal API Communication

**Issue**: Internal API routes communicated without authentication verification. While the app uses Supabase auth for user requests, server-to-server or background job requests lacked verification.

**Risk**: Without request signing:
- Unauthorized internal API access could occur
- Request spoofing in multi-service deployments
- No audit trail for internal operations

**Fix Applied**:

- Created `src/lib/security/request-signer.ts` with:
  - `signRequest(payload, timestamp)` - HMAC-SHA256 signature generation
  - `verifySignature(payload, timestamp, signature)` - Timing-safe verification
  - `createSignedHeaders(payload, timestamp)` - Ready-to-use headers
  - `extractAndVerifySignature(headers)` - Header extraction and verification
  - `createSignatureVerifier()` - Middleware-compatible verifier factory

- Features:
  - Uses Web Crypto API for Edge compatibility
  - Timestamp-based replay attack prevention (5-minute window)
  - Timing-safe signature comparison
  - Security audit logging for failed verification attempts

- Configuration:
  - Set `INTERNAL_API_SECRET` env var (min 32 chars) to enable
  - Works with background jobs, webhooks, and agent operations

**Files Modified**:

- `src/lib/security/request-signer.ts` - New signing utility (380 lines)
- `src/lib/security/index.ts` - Export new utilities
- `tests/security/request-signer.test.ts` - 24 unit tests

**Verification**:

```bash
npm run lint        # ✓ Pass
npm run type-check  # ✓ Pass
npm run test:ci     # ✓ All tests pass (24 tests)
```

**PR**: #1793

---

### 2026-02-21: Sensitive Variable Pattern Enhancement

**Issue**: The `SENSITIVE_VAR_PATTERNS` list in environment validation was missing several modern security-sensitive patterns, potentially allowing exposure of additional credential types in health check responses.

**Risk**: Without comprehensive pattern coverage, sensitive values such as:
- Certificate files (PEM)
- Java keystores (KEYSTORE)
- Encryption/decryption keys
- MFA secrets
- Wallet seed phrases (MNEMONIC)
- Recovery codes
- Backup keys
- JSON Web Keys (JWK)

could potentially be exposed in health check responses or logs.

**Fix Applied**:

- Added 10 new sensitive patterns to `SENSITIVE_VAR_PATTERNS`:
  - `PEM` - Certificate files
  - `KEYSTORE` - Java keystores
  - `ENCRYPTION` - Encryption keys
  - `DECRYPT` - Decryption keys
  - `MFA` - Multi-factor authentication secrets
  - `MNEMONIC` - Wallet seed phrases (crypto)
  - `RECOVERY` - Recovery codes/keys
  - `BACKUP` - Backup keys/codes
  - `SEED` - Seed phrases/values
  - `JWK` - JSON Web Keys

**Files Modified**:

- `src/lib/security/env-validation.ts` - Extended SENSITIVE_VAR_PATTERNS array
- `SECURITY.md` - Updated security audit history
- `docs/security-engineer.md` - Documented fix

**Verification**:

```bash
npm run lint        # ✓ Pass
npm run type-check  # ✓ Pass
npm run test:ci     # ✓ 1296 tests passed
```

### 2026-02-21: Metrics Endpoint Authentication Added

**Issue**: The `/api/metrics` endpoint exposed Prometheus metrics without authentication, potentially allowing unauthorized access to operational telemetry data.

**Risk**: Metrics could expose:

- Request patterns and volumes
- Error rates and types
- Circuit breaker states
- Rate limiting statistics

**Fix Applied**:

- Added conditional admin authentication to the metrics endpoint
- In production (when `ADMIN_API_KEY` is set): requires Bearer token authentication
- In development (when `ADMIN_API_KEY` is not set): allows access for developer experience

**Files Modified**:

- `src/app/api/metrics/route.ts` - Added admin authentication check

**Verification**:

```bash
npm run lint        # ✓ Pass
npm run type-check  # ✓ Pass
npm run test:ci     # ✓ All tests pass
```

### 2026-02-21: CSP 'unsafe-eval' Directive Removed

**Issue**: Content Security Policy included `'unsafe-eval'` directive, which allows execution of dynamic code via `eval()`, `new Function()`, and similar methods. This creates a potential XSS attack vector.

**Risk**: `'unsafe-eval'` could allow attackers to:

- Execute arbitrary JavaScript code via eval-based injection
- Bypass CSP protections if any input reaches eval-like functions
- Reduce overall security posture score

**Analysis**:

- Codebase audit confirmed no usage of `eval()`, `new Function()`, or similar dynamic code execution
- Grep search found no `dangerouslySetInnerHTML` usage
- Next.js does not require `'unsafe-eval'` for core functionality

**Fix Applied**:

- Removed `'unsafe-eval'` from `script-src` directive in CSP
- Added documentation comment explaining the removal rationale

**Files Modified**:

- `next.config.js` - Removed 'unsafe-eval' from CSP script-src directive

**Verification**:

```bash
npm run lint        # ✓ Pass
npm run type-check  # ✓ Pass
npm run test:ci     # ✓ 1282 tests passed
```

### 2026-02-21: Centralized Test Secrets Management (Issue #841)

**Issue**: Test files contained hardcoded secrets like `'test-key'`, `'test-service-key'` that could create security anti-patterns and risk accidental commit of real credentials.

**Risk**:

- Developers may become desensitized to seeing secrets in code
- Pattern normalization makes it easier to accidentally add real secrets
- CI/CD pipelines may expose test values in build logs
- No clear distinction between test and production secrets

**Fix Applied**:

- Created `MOCK_SECRETS` constant object with clearly-marked test values (`MOCK_TEST_*` prefix)
- Added `setMockEnvVars()` helper function for test setup
- Updated `tests/utils/_testHelpers.ts` to use centralized mock values
- All mock values include `NOT_REAL` marker to prevent confusion

**Files Modified**:

- `tests/utils/test-secrets.ts` - Added MOCK_SECRETS object and setMockEnvVars helper
- `tests/utils/_testHelpers.ts` - Updated to import from test-secrets.ts

**Verification**:

```bash
npm run lint        # ✓ Pass
npm run type-check  # ✓ Pass
npm run test:ci     # ✓ 1219 tests passed
```

### 2026-02-20: CSP worker-src and manifest-src Directives Added

**Issue**: Content Security Policy was missing `worker-src` and `manifest-src` directives, creating potential security gaps for web workers and web app manifests.

**Risk**: Without these directives:

- Web workers could potentially be loaded from untrusted sources
- Web app manifests could be loaded from external domains

**Fix Applied**:

- Added `worker-src 'self'` directive to restrict web worker scripts to same origin
- Added `manifest-src 'self'` directive to restrict web app manifests to same origin

**Files Modified**:

- `next.config.js` - Added worker-src and manifest-src CSP directives

**Verification**:

```bash
npm run lint        # ✓ Pass
npm run type-check  # ✓ Pass
```

### 2026-02-20: Health Endpoint Sensitive Variable Filter Enhancement

**Issue**: Health endpoint's `isSensitiveVar()` function could miss some sensitive variable patterns.

**Risk**: OAuth tokens, webhook secrets, salt values, and HMAC keys could potentially be exposed in health check responses.

**Fix Applied**:

- Enhanced `isSensitiveVar()` in `src/app/api/health/route.ts` to include additional patterns:
  - `OAUTH` - OAuth tokens and secrets
  - `WEBHOOK` - Webhook secrets
  - `SALT` - Salt values for hashing
  - `HMAC` - HMAC keys
  - `APIKEY` - API key without underscore (edge case)

**Files Modified**:

- `src/app/api/health/route.ts` - Enhanced sensitive variable detection
- `SECURITY.md` - Updated audit history
- `docs/security-engineer.md` - Documented fix

**Verification**:

```bash
npm run lint        # ✓ Pass
npm run type-check  # ✓ Pass
```

### 2026-02-20: PII Redaction Sensitive Field Pattern Enhancement

**Issue**: PII redaction system was missing some sensitive field patterns for banking, tax, and identification data.

**Risk**: International Bank Account Numbers (IBAN), SWIFT/BIC codes, Tax IDs, National Insurance numbers, and license numbers could potentially be logged without redaction.

**Fix Applied**:

- Enhanced `API_KEY_PREFIXES` in `src/lib/config/constants.ts` to include additional patterns:
  - `iban` - International Bank Account Numbers
  - `swift`, `bic` - Bank Identifier Codes
  - `tax[-_ ]?id` - Tax identification numbers
  - `nino`, `ni[-_ ]?number` - UK National Insurance numbers
  - `license`, `licence` - License/permit numbers

- Updated `SENSITIVE_FIELD_REGEX` in `src/lib/pii-redaction.ts` with the new patterns

**Files Modified**:

- `src/lib/config/constants.ts` - Added sensitive field prefixes
- `src/lib/pii-redaction.ts` - Enhanced regex pattern
- `SECURITY.md` - Updated audit history
- `docs/security-engineer.md` - Documented fix

**Verification**:

```bash
npm run lint        # ✓ Pass
npm run type-check  # ✓ Pass
```

### 2026-02-07: IP Address Spoofing Prevention

**Issue**: Rate limiting used first IP from `X-Forwarded-For` header, which can be spoofed by malicious clients.

**Risk**: Attackers could bypass rate limiting by spoofing different IP addresses.

**Fix Applied**:

- Modified `getClientIdentifier()` in `src/lib/rate-limit.ts` to prioritize `X-Real-IP` header
- Falls back to LAST IP in `X-Forwarded-For` chain (closest to server, added by trusted proxy)
- Returns 'unknown' if no trusted headers present

**Files Modified**:

- `src/lib/rate-limit.ts` - Updated IP extraction logic
- `src/lib/api-handler.ts` - Uses `getClientIdentifier()` consistently
- `tests/rate-limit.test.ts` - Updated tests for new secure behavior
- `tests/api-handler.test.ts` - Added `getClientIdentifier` mock

**Before**:

```typescript
// Vulnerable: Uses first IP which can be spoofed
const ip = forwarded
  ? forwarded.split(',')[0] // First IP is client-controllable
  : request.headers.get('x-real-ip') || 'unknown';
```

**After**:

```typescript
// Secure: Uses trusted headers only
const realIp = request.headers.get('x-real-ip');
if (realIp) {
  return realIp.trim(); // Set by trusted proxy
}

const forwarded = request.headers.get('x-forwarded-for');
if (forwarded) {
  const ips = forwarded.split(',').map((ip) => ip.trim());
  return ips[ips.length - 1] || 'unknown'; // Last IP from trusted proxy
}

return 'unknown';
```

**Verification**:

```bash
npm run lint        # ✓ Pass
npm run type-check  # ✓ Pass
npm test            # ✓ All tests pass
```

---

## Security Architecture

### 1. Security Headers (next.config.js)

All responses include comprehensive security headers:

| Header                       | Value                                                       | Purpose                              |
| ---------------------------- | ----------------------------------------------------------- | ------------------------------------ |
| Content-Security-Policy      | `default-src 'self'; script-src 'self' 'unsafe-inline' ...` | Prevents XSS, data injection         |
| X-Frame-Options              | `DENY`                                                      | Prevents clickjacking                |
| X-Content-Type-Options       | `nosniff`                                                   | Prevents MIME sniffing               |
| X-XSS-Protection             | `0`                                                         | Disabled (rely on CSP instead)       |
| Referrer-Policy              | `strict-origin-when-cross-origin`                           | Controls referrer info               |
| Permissions-Policy           | `camera=(), microphone=(), ...`                             | Restricts browser features           |
| Strict-Transport-Security    | `max-age=31536000; includeSubDomains; preload`              | Enforces HTTPS (production)          |
| Cross-Origin-Resource-Policy | `same-origin`                                               | Prevents cross-origin resource leaks |
| Cross-Origin-Opener-Policy   | `same-origin-allow-popups`                                  | Isolates browsing context            |

### 2. Input Validation (src/lib/validation.ts)

Comprehensive validation for all user inputs:

```typescript
// String length limits
MIN_IDEA_LENGTH = 10;
MAX_IDEA_LENGTH = 10000;
MAX_TITLE_LENGTH = 500;

// Format validation
validateIdea(); // Validates idea text
validateIdeaId(); // Alphanumeric + underscore/hyphen only
validateUserResponses(); // Object structure validation
validateRequestSize(); // 1MB default limit
```

### 3. Rate Limiting (src/lib/rate-limit.ts)

Tiered rate limiting to prevent abuse:

```typescript
// Configuration tiers
strict:    10 req/min  // Admin endpoints
moderate:  30 req/min  // Anonymous users
lenient:   60 req/min  // Default

// User role-based (future implementation)
anonymous:     30 req/min
authenticated: 60 req/min
premium:      120 req/min
enterprise:   300 req/min
```

**Security Enhancement**: IP extraction now prevents spoofing (see Fix Log above).

### 4. PII Redaction (src/lib/pii-redaction.ts)

Automatic redaction of sensitive information:

```typescript
// Redacted patterns
- Email addresses → [REDACTED_EMAIL]
- Phone numbers → [REDACTED_PHONE]
- SSN → [REDACTED_SSN]
- Credit cards → [REDACTED_CARD]
- IP addresses → [REDACTED_IP] (public only)
- API keys → [REDACTED_API_KEY]
- JWT tokens → [REDACTED_TOKEN]
- URLs with credentials → [REDACTED_URL]
```

Applied to:

- Error messages
- Agent logs
- API responses

### 5. Authentication (src/lib/auth.ts)

Admin API key authentication for protected routes:

```typescript
// Supports
- Bearer token: Authorization: Bearer <key>
- Query parameter: ?admin_key=<key>
- Disabled in development (optional)
```

### 6. Error Handling (src/lib/errors.ts)

Secure error responses without information leakage:

```typescript
// Features
- PII redaction in error messages
- Request ID generation for tracing
- Standardized error codes
- No stack traces in production
- Retry logic support
```

### 7. Secrets Management

Environment variables for all secrets:

```bash
# AI Providers
OPENAI_API_KEY
ANTHROPIC_API_KEY

# Integrations
TRELLO_API_KEY, TRELLO_TOKEN
NOTION_API_KEY
GITHUB_TOKEN
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

# Database
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Admin
ADMIN_API_KEY
```

**Security Checks**:

- ✅ No hardcoded secrets in source code
- ✅ `.env` files in `.gitignore`
- ✅ `.env.example` with placeholder values
- ✅ GitHub Actions use `${{ secrets.XXX }}`

---

## Security Checklist

### Development

- [ ] Run `npm audit` before committing
- [ ] No `console.log` with sensitive data
- [ ] All user inputs validated
- [ ] Error messages don't expose internals
- [ ] PII redaction applied to logs

### Code Review

- [ ] Check for hardcoded secrets
- [ ] Verify input validation exists
- [ ] Review error handling paths
- [ ] Check rate limiting coverage
- [ ] Validate security headers

### Deployment

- [ ] Environment variables configured
- [ ] HSTS enabled in production
- [ ] Security headers verified
- [ ] Rate limiting functional
- [ ] Admin routes protected

---

## OWASP Top 10 Coverage

| Risk                           | Status       | Mitigation                                       |
| ------------------------------ | ------------ | ------------------------------------------------ |
| A01: Broken Access Control     | ✅ Mitigated | Role-based rate limiting, admin auth             |
| A02: Cryptographic Failures    | ✅ Mitigated | HTTPS only, HSTS, secrets in env                 |
| A03: Injection                 | ✅ Mitigated | Input validation, parameterized queries          |
| A04: Insecure Design           | ✅ Mitigated | Error handling, resilience patterns              |
| A05: Security Misconfiguration | ✅ Mitigated | Security headers, no debug in prod               |
| A06: Vulnerable Components     | ✅ Mitigated | 0 production CVEs, devDependencies accepted risk |
| A07: Auth Failures             | ⚠️ N/A       | Basic auth only (future: full auth)              |
| A08: Data Integrity            | ✅ Mitigated | TypeScript, validation                           |
| A09: Logging Failures          | ✅ Mitigated | Request IDs, PII redaction                       |
| A10: SSRF                      | ✅ Mitigated | CSP connect-src restrictions                     |

---

## Vulnerability Scanning

### Automated Scans

```bash
# Dependency vulnerabilities
npm audit --audit-level=moderate

# Outdated packages
npm outdated

# Lint for security patterns
npm run lint
```

### Manual Checks

```bash
# Search for potential secrets
grep -r "api_key\|secret\|password\|token" src/ --include="*.ts" --include="*.tsx" | grep -v "process.env"

# Check for console.log in production code
grep -r "console\.log\|console\.warn\|console\.error" src/ --include="*.ts" --include="*.tsx"

# Verify CSP headers
curl -I https://your-domain.com | grep -i "content-security-policy"
```

---

## Incident Response

### Security Incident Procedure

1. **Detection**
   - Monitor rate limit statistics
   - Check error logs for anomalies
   - Review access patterns

2. **Assessment**
   - Determine scope and impact
   - Identify affected components
   - Classify severity (Critical/High/Medium/Low)

3. **Containment**
   - Enable stricter rate limits
   - Block suspicious IPs if needed
   - Disable affected features temporarily

4. **Remediation**
   - Apply security patches
   - Update dependencies if needed
   - Enhance validation/logic

5. **Recovery**
   - Verify fixes with tests
   - Monitor for recurrence
   - Document lessons learned

6. **Post-Incident**
   - Update security documentation
   - Review and improve processes
   - Share findings with team

---

## Security Contacts

- **Security Issues**: Report to project maintainers
- **Vulnerability Disclosure**: Follow responsible disclosure
- **Emergency**: Contact team lead immediately

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Secure Headers](https://owasp.org/www-project-secure-headers/)
- [CSP Quick Reference](https://content-security-policy.com/)
- [Security Headers Test](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)

---

**Next Review Date**: 2026-05-07 (Quarterly)
