/**
 * Tests for NoSQL injection detection in request keys
 * @module tests/security/nosql-injection-keys.test
 */

import { NextRequest } from 'next/server';
import { detectSuspiciousPatterns } from '@/lib/security/suspicious-patterns';

describe('NoSQL Injection in Keys Detection', () => {
  const createMockRequest = (
    url: string,
    headers: Record<string, string> = {}
  ) => {
    return new NextRequest(new URL(url, 'https://example.com'), {
      headers: new Headers(headers),
    });
  };

  it('should detect NoSQL operators in query parameter keys', () => {
    // Current implementation might miss these as it only scans values
    const maliciousUrls = [
      'https://example.com/api/ideas?id[$ne]=null',
      'https://example.com/api/ideas?status[$in][]=published&status[$in][]=draft',
      'https://example.com/api/ideas?price[$gt]=0',
      'https://example.com/api/ideas?user[$exists]=true',
    ];

    for (const url of maliciousUrls) {
      const request = createMockRequest(url);
      const result = detectSuspiciousPatterns(request, { minSeverity: 2 });

      // We expect this to fail initially if the implementation only checks values
      expect(result.detected).toBe(true);
      expect(result.patterns.some((p) => p.category === 'nosql_injection')).toBe(true);
      expect(result.maxSeverity).toBeGreaterThanOrEqual(2);
    }
  });

  it('should detect NoSQL operators in header values', () => {
    const request = createMockRequest('https://example.com/api/ideas', {
      'X-Custom-Filter': '{"$ne": null}'
    });

    const result = detectSuspiciousPatterns(request, { minSeverity: 2 });
    expect(result.detected).toBe(true);
    expect(result.patterns.some((p) => p.category === 'nosql_injection')).toBe(true);
  });

  it('should not flag normal query parameters', () => {
    const normalUrls = [
      'https://example.com/api/ideas?id=123',
      'https://example.com/api/ideas?search=test',
      'https://example.com/api/ideas?page=1&limit=10',
    ];

    for (const url of normalUrls) {
      const request = createMockRequest(url);
      const result = detectSuspiciousPatterns(request, { minSeverity: 2 });
      expect(result.detected).toBe(false);
    }
  });
});
