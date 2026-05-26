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

  describe('Query Parameter Keys', () => {
    it('should detect NoSQL operator in query parameter keys using bracket notation', () => {
      // payload like ?id[$ne]=null
      const request = createMockRequest('https://example.com/api/test?id[$ne]=null');
      const result = detectSuspiciousPatterns(request, { minSeverity: 2 });

      // This is expected to FAIL before the fix
      expect(result.detected).toBe(true);
      expect(result.patterns.some(p => p.category === 'nosql_injection')).toBe(true);
    });

    it('should detect multiple NoSQL operators in query parameter keys', () => {
      const request = createMockRequest('https://example.com/api/test?user[$gt]=&user[$lt]=100');
      const result = detectSuspiciousPatterns(request, { minSeverity: 2 });

      expect(result.detected).toBe(true);
      expect(result.patterns.filter(p => p.category === 'nosql_injection').length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Header Keys', () => {
    it('should detect suspicious patterns in custom header keys', () => {
      // Using a valid header name that contains a suspicious pattern
      // 'select' is a SQL injection keyword (severity 1 or 3 depending on context)
      const request = createMockRequest('https://example.com/api/test', {
        'X-SQL-SELECT': 'value'
      });
      const result = detectSuspiciousPatterns(request, { minSeverity: 1 });

      expect(result.detected).toBe(true);
      expect(result.patterns.some(p => p.location === 'header' && p.field?.toLowerCase() === 'x-sql-select')).toBe(true);
    });
  });

  describe('Updated NoSQL Patterns', () => {
    it('should detect operators followed by colon (JSON format)', () => {
      // JSON format often has quotes: {"$ne": "..."}
      const request = createMockRequest('https://example.com/api/test?q={"$ne":"null"}');
      const result = detectSuspiciousPatterns(request, { minSeverity: 2 });

      expect(result.detected).toBe(true);
    });

    it('should detect operators followed by bracket (Query string format)', () => {
      const request = createMockRequest('https://example.com/api/test?filter[$regex]=.*');
      const result = detectSuspiciousPatterns(request, { minSeverity: 2 });

      expect(result.detected).toBe(true);
    });
  });
});
