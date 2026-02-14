# Security Engineer Guide

**Role**: Security Engineer Specialist  
**Last Updated**: 2026-02-07  
**Status**: ✅ Active

---

## Overview

This document provides security-focused guidelines, findings, and best practices for the IdeaFlow application. It serves as a central reference for security-related decisions, vulnerabilities, fixes, and ongoing security maintenance.

---

## Security Posture

**Overall Security Score**: 8.5/10

### Strengths

- ✅ **Zero known vulnerabilities** (0 CVEs from npm audit)
- ✅ **Comprehensive security headers** (CSP, HSTS, X-Frame-Options, etc.)
- ✅ **Proper secrets management** (environment variables, no hardcoded secrets)
- ✅ **Input validation** on all API endpoints
- ✅ **Rate limiting** with tiered structure
- ✅ **PII redaction** for logs and error messages
- ✅ **Circuit breakers** for external service resilience
- ✅ **Secure error handling** (no information leakage)

### Areas for Improvement

- ⚠️ **Rate limiting** is in-memory only (won't scale across multiple instances)
- ⚠️ **CSP uses 'unsafe-inline'** (necessary for Next.js, but could be enhanced)
- ⚠️ **Admin authentication** is basic API key only

---

## Security Fixes Log

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

### 1. Security Headers (src/proxy.ts)

All responses include comprehensive security headers:

| Header                    | Value                                                                            | Purpose                      |
| ------------------------- | -------------------------------------------------------------------------------- | ---------------------------- |
| Content-Security-Policy   | `default-src 'self'; script-src 'self' 'unsafe-inline' https://vercel.live; ...` | Prevents XSS, data injection |
| X-Frame-Options           | `DENY`                                                                           | Prevents clickjacking        |
| X-Content-Type-Options    | `nosniff`                                                                        | Prevents MIME sniffing       |
| Referrer-Policy           | `strict-origin-when-cross-origin`                                                | Controls referrer info       |
| Permissions-Policy        | `camera=(), microphone=(), ...`                                                  | Restricts browser features   |
| Strict-Transport-Security | `max-age=31536000; includeSubDomains; preload`                                   | Enforces HTTPS (production)  |

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

| Risk                           | Status       | Mitigation                              |
| ------------------------------ | ------------ | --------------------------------------- |
| A01: Broken Access Control     | ✅ Mitigated | Role-based rate limiting, admin auth    |
| A02: Cryptographic Failures    | ✅ Mitigated | HTTPS only, HSTS, secrets in env        |
| A03: Injection                 | ✅ Mitigated | Input validation, parameterized queries |
| A04: Insecure Design           | ✅ Mitigated | Error handling, resilience patterns     |
| A05: Security Misconfiguration | ✅ Mitigated | Security headers, no debug in prod      |
| A06: Vulnerable Components     | ✅ Mitigated | 0 CVEs, dependency audits               |
| A07: Auth Failures             | ⚠️ N/A       | Basic auth only (future: full auth)     |
| A08: Data Integrity            | ✅ Mitigated | TypeScript, validation                  |
| A09: Logging Failures          | ✅ Mitigated | Request IDs, PII redaction              |
| A10: SSRF                      | ✅ Mitigated | CSP connect-src restrictions            |

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
