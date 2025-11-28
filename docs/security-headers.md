# Security Headers Implementation Guide

This document outlines the security headers implemented in the IdeaFlow application and provides guidance for production deployment.

## Implemented Security Headers

### Content Security Policy (CSP)

The CSP header prevents various injection attacks by controlling which resources the browser is allowed to load.

**Current Implementation:**

```
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live;
style-src 'self' 'unsafe-inline';
img-src 'self' data: https: blob:;
font-src 'self' data:;
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests
```

**Directives Explained:**

- `default-src 'self'`: Default policy allows resources from same origin only
- `script-src`: Allows scripts from same origin, Vercel live preview, and necessary inline/eval for Next.js
- `style-src 'self' 'unsafe-inline'`: Required for Tailwind CSS and Next.js styling
- `img-src`: Allows images from same origin, data URLs, HTTPS, and blob URLs
- `font-src 'self' data:`: Allows fonts from same origin and data URLs
- `object-src 'none'`: Disallows plugins (Flash, etc.)
- `base-uri 'self'`: Restricts base tag to same origin
- `form-action 'self'`: Restricts form submissions to same origin
- `frame-ancestors 'none'`: Prevents clickjacking
- `upgrade-insecure-requests`: Upgrades HTTP to HTTPS

### X-Frame-Options: DENY

Prevents the site from being embedded in iframes, protecting against clickjacking attacks.

### X-Content-Type-Options: nosniff

Prevents MIME-type sniffing attacks by ensuring the browser respects the declared content type.

### X-XSS-Protection: 1; mode=block

Enables XSS filtering in browsers that support it and blocks the response if an attack is detected.

### Referrer-Policy: strict-origin-when-cross-origin

Controls how much referrer information is sent with requests, balancing privacy and functionality.

### Permissions-Policy

Disables browser features that are not needed:

- `camera=()`: Disables camera access
- `microphone=()`: Disables microphone access
- `geolocation=()`: Disables geolocation access
- `browsing-topics=()`: Disables privacy-preserving ad topics

### Strict-Transport-Security (HSTS)

**Production Only:** Enforces HTTPS connections for 1 year with subdomain inclusion and preload listing.

```
max-age=31536000; includeSubDomains; preload
```

## Production Deployment Considerations

### 1. CSP Hardening

For production, consider tightening the CSP:

- Remove `'unsafe-eval'` if possible (requires Next.js configuration changes)
- Remove `'unsafe-inline'` by using nonce or hash-based CSP
- Specify exact domains for external resources instead of `https:`

### 2. HSTS Preload

To enable HSTS preload:

1. Ensure all subdomains support HTTPS
2. Submit domain to https://hstspreload.org/
3. Verify preload status

### 3. Certificate Management

- Use valid SSL/TLS certificates
- Implement automatic certificate renewal
- Monitor certificate expiration

### 4. Monitoring and Testing

#### Security Headers Testing

Use these tools to verify security headers:

- https://securityheaders.com/
- https://observatory.mozilla.org/
- https://csp-evaluator.withgoogle.com/

#### CSP Violation Reporting

Consider adding a CSP report-uri for monitoring violations:

```
Content-Security-Policy-Report-Only: ...; report-uri /api/csp-report
```

## Environment-Specific Configuration

### Development

- HSTS header is disabled to allow HTTP
- CSP allows `unsafe-eval` for Next.js development mode

### Production

- HSTS header is enabled
- Consider stricter CSP policies
- Enable security monitoring

## Security Best Practices

### 1. Regular Updates

- Keep Next.js and dependencies updated
- Monitor security advisories
- Apply security patches promptly

### 2. Dependency Security

- Run `npm audit` regularly
- Use automated security scanning in CI/CD
- Review dependency changes for security impact

### 3. Data Protection

- Implement PII redaction for logs
- Use encryption for sensitive data
- Follow data retention policies

### 4. Access Control

- Implement proper authentication and authorization
- Use least privilege principle
- Regular access reviews

## Troubleshooting

### Common CSP Issues

1. **Inline Scripts Blocked**
   - Use nonce or hash-based CSP
   - Move inline code to external files

2. **External Resources Blocked**
   - Add specific domains to CSP directives
   - Use HTTPS versions of external resources

3. **Third-party Integrations**
   - Review integration requirements
   - Add necessary CSP directives

### Testing Security Headers

```bash
# Test headers locally
curl -I https://your-domain.com

# Check specific headers
curl -H "Accept: text/html" https://your-domain.com | grep -i "content-security-policy"
```

## Compliance

This implementation helps with:

- GDPR compliance through data protection measures
- SOC 2 security requirements
- OWASP security best practices
- Industry security standards

## References

- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [CSP Specification](https://www.w3.org/TR/CSP/)
- [HSTS Specification](https://tools.ietf.org/html/rfc6797)
