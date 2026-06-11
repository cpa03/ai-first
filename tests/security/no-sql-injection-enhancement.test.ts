/**
 * Tests for NoSQL injection detection enhancements
 */

import { NextRequest } from 'next/server';
import { detectSuspiciousPatterns } from '@/lib/security/suspicious-patterns';

describe('NoSQL Injection Detection Enhancements', () => {
  const createMockRequest = (
    url: string,
    headers: Record<string, string> = {}
  ) => {
    return new NextRequest(new URL(url, 'https://example.com'), {
      headers: new Headers(headers),
    });
  };

  it('should detect NoSQL injection in query parameter values', () => {
    const request = createMockRequest(
      'https://example.com/api/test?id={"$ne": null}'
    );
    const result = detectSuspiciousPatterns(request, { minSeverity: 2 });
    expect(result.detected).toBe(true);
    expect(result.patterns.some((p) => p.category === 'nosql_injection')).toBe(
      true
    );
  });

  it('should detect NoSQL injection in query parameter keys (bracket notation)', () => {
    const request = createMockRequest('https://example.com/api/test?id[$ne]=1');
    const result = detectSuspiciousPatterns(request, { minSeverity: 2 });
    expect(result.detected).toBe(true);
    expect(result.patterns.some((p) => p.category === 'nosql_injection')).toBe(
      true
    );
  });

  it('should detect high-severity NoSQL operators in keys', () => {
    const request = createMockRequest(
      'https://example.com/api/test?user[$where]=this.age > 25'
    );
    const result = detectSuspiciousPatterns(request, { minSeverity: 3 });
    expect(result.detected).toBe(true);
    expect(result.maxSeverity).toBe(3);
    expect(result.patterns.some((p) => p.category === 'nosql_injection')).toBe(
      true
    );
  });
});
