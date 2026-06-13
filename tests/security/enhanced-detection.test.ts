/**
 * Tests for enhanced suspicious request pattern detection
 */

import { NextRequest } from 'next/server';
import { detectSuspiciousPatterns } from '@/lib/security/suspicious-patterns';

describe('Enhanced Suspicious Pattern Detection', () => {
  const createMockRequest = (
    url: string,
    headers: Record<string, string> = {}
  ) => {
    return new NextRequest(new URL(url, 'https://example.com'), {
      headers: new Headers(headers),
    });
  };

  it('should detect suspicious patterns in query parameter keys', () => {
    // Prototype pollution in key
    const request = createMockRequest(
      'https://example.com/api/test?__proto__.polluted=true'
    );
    const result = detectSuspiciousPatterns(request, { minSeverity: 1 });
    expect(result.detected).toBe(true);
    expect(result.patterns.some(p => p.category === 'prototype_pollution')).toBe(true);
  });

  it('should detect suspicious patterns in header keys', () => {
    // SQL injection in header key
    const request = createMockRequest(
      'https://example.com/api/test',
      { "X-Query-SELECT-FROM": "true" }
    );
    const result = detectSuspiciousPatterns(request, { minSeverity: 1 });
    expect(result.detected).toBe(true);
    expect(result.patterns.some(p => p.category === 'sql_injection')).toBe(true);
  });

  it('should detect NoSQL bracket notation injection in query parameter keys', () => {
    // NoSQL injection like ?id[$ne]=1
    const request = createMockRequest(
      'https://example.com/api/test?id[$ne]=1'
    );
    const result = detectSuspiciousPatterns(request, { minSeverity: 1 });
    expect(result.detected).toBe(true);
    expect(result.patterns.some(p => p.category === 'nosql_injection')).toBe(true);
  });
});
