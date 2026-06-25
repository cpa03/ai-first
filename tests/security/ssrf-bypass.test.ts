
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
    const request = createMockRequest('https://example.com/api/test?url=http://0x7f000001');
    const result = detectSuspiciousPatterns(request, { minSeverity: 1 });
    expect(result.detected).toBe(true);
    expect(result.patterns.some(p => p.category === 'ssrf')).toBe(true);
  });

  it('should detect SSRF with decimal-encoded IP', () => {
    const request = createMockRequest('https://example.com/api/test?url=http://2130706433');
    const result = detectSuspiciousPatterns(request, { minSeverity: 1 });
    expect(result.detected).toBe(true);
    expect(result.patterns.some(p => p.category === 'ssrf')).toBe(true);
  });

  it('should detect SSRF with octal-encoded IP', () => {
    const request = createMockRequest('https://example.com/api/test?url=http://017700000001');
    const result = detectSuspiciousPatterns(request, { minSeverity: 1 });
    expect(result.detected).toBe(true);
    expect(result.patterns.some(p => p.category === 'ssrf')).toBe(true);
  });

  it('should detect SSRF with IPv6-mapped IPv4', () => {
    const request = createMockRequest('https://example.com/api/test?url=http://[::ffff:127.0.0.1]');
    const result = detectSuspiciousPatterns(request, { minSeverity: 1 });
    expect(result.detected).toBe(true);
    expect(result.patterns.some(p => p.category === 'ssrf')).toBe(true);
  });
});
