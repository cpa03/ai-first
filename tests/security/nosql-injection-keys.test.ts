/**
 * Tests for NoSQL injection detection in keys
 * @module tests/security/nosql-injection-keys.test
 */

import { NextRequest } from 'next/server';
import { detectSuspiciousPatterns } from '@/lib/security/suspicious-patterns';

describe('NoSQL Injection in Keys', () => {
  const createMockRequest = (
    url: string,
    headers: Record<string, string> = {}
  ) => {
    return new NextRequest(new URL(url, 'https://example.com'), {
      headers: new Headers(headers),
    });
  };

  it('should detect NoSQL operator injection in query parameter keys', () => {
    const request = createMockRequest(
      'https://example.com/api/ideas?id[$ne]=null'
    );
    const result = detectSuspiciousPatterns(request, { minSeverity: 2 });

    expect(result.detected).toBe(true);
    expect(result.patterns.some(p => p.category === 'nosql_injection')).toBe(true);
    expect(result.patterns.some(p => p.field === 'id[$ne]')).toBe(true);
  });

  it('should detect NoSQL operator injection in header values', () => {
    const request = createMockRequest(
      'https://example.com/api/ideas',
      { 'X-Filter': '{"$gt": 100}' }
    );
    const result = detectSuspiciousPatterns(request, { minSeverity: 2 });

    expect(result.detected).toBe(true);
    expect(result.patterns.some(p => p.category === 'nosql_injection')).toBe(true);
  });

  it('should detect NoSQL operators using bracket notation in values', () => {
    const request = createMockRequest(
      'https://example.com/api/ideas?filter=[$ne]:null'
    );
    const result = detectSuspiciousPatterns(request, { minSeverity: 2 });

    expect(result.detected).toBe(true);
    expect(result.patterns.some(p => p.category === 'nosql_injection')).toBe(true);
  });
});
