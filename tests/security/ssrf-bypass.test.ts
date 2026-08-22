import { NextRequest } from 'next/server';
import { detectSuspiciousPatterns } from '@/lib/security/suspicious-patterns';

describe('Suspicious Pattern Detection Bypasses', () => {
  const createMockRequest = (
    url: string,
    headers: Record<string, string> = {}
  ) => {
    return new NextRequest(new URL(url, 'https://example.com'), {
      headers: new Headers(headers),
    });
  };

  it('should detect SSRF with hex-encoded IP', () => {
    const request = createMockRequest(
      'https://example.com/api/test?url=http://0x7f000001'
    );
    const result = detectSuspiciousPatterns(request, { minSeverity: 1 });
    expect(result.detected).toBe(true);
    expect(result.patterns.some((p) => p.category === 'ssrf')).toBe(true);
  });

  it('should detect SSRF with decimal-encoded IP', () => {
    const request = createMockRequest(
      'https://example.com/api/test?url=http://2130706433'
    );
    const result = detectSuspiciousPatterns(request, { minSeverity: 1 });
    expect(result.detected).toBe(true);
    expect(result.patterns.some((p) => p.category === 'ssrf')).toBe(true);
  });

  it('should detect SSRF with octal-encoded IP', () => {
    const request = createMockRequest(
      'https://example.com/api/test?url=http://017700000001'
    );
    const result = detectSuspiciousPatterns(request, { minSeverity: 1 });
    expect(result.detected).toBe(true);
    expect(result.patterns.some((p) => p.category === 'ssrf')).toBe(true);
  });

  it('should detect SSRF with IPv6-mapped IPv4', () => {
    const request = createMockRequest(
      'https://example.com/api/test?url=http://[::ffff:127.0.0.1]'
    );
    const result = detectSuspiciousPatterns(request, { minSeverity: 1 });
    expect(result.detected).toBe(true);
    expect(result.patterns.some((p) => p.category === 'ssrf')).toBe(true);
  });

  it('should detect SSRF with shorthand loopback IPs', () => {
    const cases = [
      'https://example.com/api/test?url=http://127.1',
      'https://example.com/api/test?url=http://127.0.1',
      'https://example.com/api/test?url=http://127.12.34.56',
    ];
    for (const url of cases) {
      const request = createMockRequest(url);
      const result = detectSuspiciousPatterns(request, { minSeverity: 1 });
      expect(result.detected).toBe(true);
      expect(result.patterns.some((p) => p.category === 'ssrf')).toBe(true);
    }
  });

  it('should detect SSRF with dotted octal loopback IPs', () => {
    const cases = [
      'https://example.com/api/test?url=http://0177.0.0.1',
      'https://example.com/api/test?url=http://0177.0000.0000.0001',
      'https://example.com/api/test?url=http://0177.1',
    ];
    for (const url of cases) {
      const request = createMockRequest(url);
      const result = detectSuspiciousPatterns(request, { minSeverity: 1 });
      expect(result.detected).toBe(true);
      expect(result.patterns.some((p) => p.category === 'ssrf')).toBe(true);
    }
  });

  it('should detect SSRF with protocol-relative or optional non-standard IP encodings', () => {
    const cases = [
      'https://example.com/api/test?url=//0x7f000001',
      'https://example.com/api/test?url=//2130706433',
      'https://example.com/api/test?url=http://0x7f000001',
      'https://example.com/api/test?url=http://2130706433',
    ];
    for (const url of cases) {
      const request = createMockRequest(url);
      const result = detectSuspiciousPatterns(request, { minSeverity: 1 });
      expect(result.detected).toBe(true);
      expect(result.patterns.some((p) => p.category === 'ssrf')).toBe(true);
    }
  });

  it('should detect SSRF with non-standard encodings of cloud metadata IP', () => {
    const cases = [
      'https://example.com/api/test?url=http://2851972862', // Decimal 169.254.169.254
      'https://example.com/api/test?url=http://0xa9feaffe', // Hex 169.254.169.254
      'https://example.com/api/test?url=http://025177527776', // Octal 169.254.169.254
    ];
    for (const url of cases) {
      const request = createMockRequest(url);
      const result = detectSuspiciousPatterns(request, { minSeverity: 1 });
      expect(result.detected).toBe(true);
      expect(result.patterns.some((p) => p.category === 'ssrf')).toBe(true);
    }
  });

  it('should detect SSRF with advanced IPv6 loopback and unspecified addresses', () => {
    const cases = [
      'https://example.com/api/test?url=http://[0:0:0:0:0:0:0:1]',
      'https://example.com/api/test?url=http://[0000:0000:0000:0000:0000:0000:0000:0001]',
      'https://example.com/api/test?url=http://[0::1]',
      'https://example.com/api/test?url=http://[0:0:0:0:0:0:0:0]',
      'https://example.com/api/test?url=http://[0::0]',
      'https://example.com/api/test?url=http://[0::]',
    ];
    for (const url of cases) {
      const request = createMockRequest(url);
      const result = detectSuspiciousPatterns(request, { minSeverity: 1 });
      expect(result.detected).toBe(true);
      expect(result.patterns.some((p) => p.category === 'ssrf')).toBe(true);
    }
  });

  it('should detect SSRF with other IPv6-mapped loopback subnets and shorthands (enhanced security checks)', () => {
    const cases = [
      'https://example.com/api/test?url=http://[::ffff:127.0.0.2]',
      'https://example.com/api/test?url=http://[::ffff:127.12.34.56]',
      'https://example.com/api/test?url=http://[::ffff:127.0.1]',
      'https://example.com/api/test?url=http://[::ffff:127.1]',
    ];
    for (const url of cases) {
      const request = createMockRequest(url);
      const result = detectSuspiciousPatterns(request, { minSeverity: 1 });
      expect(result.detected).toBe(true);
      expect(result.patterns.some((p) => p.category === 'ssrf')).toBe(true);
    }
  });
});
