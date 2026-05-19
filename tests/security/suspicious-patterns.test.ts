/**
 * Tests for suspicious request pattern detection
 * @module tests/security/suspicious-patterns.test
 */

import { NextRequest } from 'next/server';
import { detectSuspiciousPatterns } from '@/lib/security/suspicious-patterns';

describe('Suspicious Pattern Detection Improvements', () => {
  const createMockRequest = (
    url: string,
    headers: Record<string, string> = {}
  ) => {
    return new NextRequest(new URL(url, 'https://example.com'), {
      headers: new Headers(headers),
    });
  };

  describe('SQL Injection', () => {
    it('should detect string-based tautologies without numbers', () => {
      const request = createMockRequest(
        "https://example.com/api/test?id=' OR 'a'='a"
      );
      const result = detectSuspiciousPatterns(request, { minSeverity: 1 });
      expect(result.detected).toBe(true);
      expect(result.patterns.some((p) => p.category === 'sql_injection')).toBe(
        true
      );
    });

    it('should detect system table access attempts even without keywords', () => {
      // Current patterns might miss this if they only look for SELECT ... FROM
      const request = createMockRequest(
        'https://example.com/api/test?table=information_schema.columns'
      );
      const result = detectSuspiciousPatterns(request, { minSeverity: 1 });
      expect(result.detected).toBe(true);
      expect(result.patterns.some((p) => p.category === 'sql_injection')).toBe(
        true
      );
    });
  });

  describe('XSS', () => {
    it('should detect srcdoc attribute injection', () => {
      // Existing patterns might miss srcdoc if it doesn't contain <script>
      const request = createMockRequest(
        'https://example.com/api/test?attr=<div srcdoc="onclick=alert(1)">'
      );
      const result = detectSuspiciousPatterns(request, { minSeverity: 1 });
      expect(result.detected).toBe(true);
      expect(result.patterns.some((p) => p.category === 'xss')).toBe(true);
    });

    it('should detect vbscript: protocol', () => {
      const requestVb = createMockRequest(
        'https://example.com/api/test?url=vbscript:msgbox("hello")'
      );
      const result = detectSuspiciousPatterns(requestVb, { minSeverity: 1 });
      expect(result.detected).toBe(true);
      expect(result.patterns.some((p) => p.category === 'xss')).toBe(true);
    });
  });

  describe('Command Injection', () => {
    it('should detect environment variable dumping (env/printenv)', () => {
      // Existing patterns miss env/printenv
      const requestEnv = createMockRequest(
        'https://example.com/api/test?cmd=printenv'
      );
      const result = detectSuspiciousPatterns(requestEnv, { minSeverity: 1 });
      expect(result.detected).toBe(true);
      expect(
        result.patterns.some((p) => p.category === 'command_injection')
      ).toBe(true);
    });

    it('should detect Node.js specific injection attempts', () => {
      const request = createMockRequest(
        'https://example.com/api/test?code=process.version'
      );
      const result = detectSuspiciousPatterns(request, { minSeverity: 1 });
      expect(result.detected).toBe(true);
      expect(
        result.patterns.some((p) => p.category === 'command_injection')
      ).toBe(true);
    });

    it('should detect reconnaissance commands with separators', () => {
      const commands = ['whoami', 'id', 'hostname', 'uname'];
      for (const cmd of commands) {
        // Test with different separators
        // Note: & is excluded from unencoded URL testing because URL search params
        // would split it into multiple parameters.
        const separators = [';', '|', '`'];
        for (const sep of separators) {
          const payload =
            sep === '`' ? `test${sep}${cmd}${sep}` : `test ${sep} ${cmd}`;
          const request = createMockRequest(
            `https://example.com/api/test?cmd=${payload}`
          );
          const result = detectSuspiciousPatterns(request, { minSeverity: 3 });
          expect(result.detected).toBe(true);
          expect(result.maxSeverity).toBe(3);
          expect(
            result.patterns.some((p) => p.category === 'command_injection')
          ).toBe(true);
        }
      }
    });

    it('should NOT detect standalone reconnaissance commands as parameters', () => {
      const commands = ['whoami', 'id', 'hostname', 'uname'];
      for (const cmd of commands) {
        const request = createMockRequest(
          `https://example.com/api/test?${cmd}=test-value`
        );
        const result = detectSuspiciousPatterns(request, { minSeverity: 3 });
        // Should not be detected at severity 3
        expect(result.detected).toBe(false);
      }
    });
  });

  describe('New Enhanced Patterns', () => {
    it('should detect error/time-based SQL functions', () => {
      const functions = ['extractvalue', 'updatexml', 'pg_sleep', 'sleep'];
      for (const fn of functions) {
        const request = createMockRequest(
          `https://example.com/api/test?q=${fn}(1)`
        );
        const result = detectSuspiciousPatterns(request, { minSeverity: 3 });
        expect(result.detected).toBe(true);
        expect(result.maxSeverity).toBe(3);
        expect(
          result.patterns.some((p) => p.category === 'sql_injection')
        ).toBe(true);
      }
    });

    it('should detect Windows sensitive paths', () => {
      const paths = [
        'C:\\Windows\\System32',
        'C:\\winnt\\system32',
        'C:\\boot.ini',
        'C:\\inetpub\\wwwroot',
      ];
      for (const path of paths) {
        const request = createMockRequest(
          `https://example.com/api/test?file=${path}`
        );
        const result = detectSuspiciousPatterns(request, { minSeverity: 3 });
        expect(result.detected).toBe(true);
        expect(result.maxSeverity).toBe(3);
        expect(
          result.patterns.some((p) => p.category === 'path_traversal')
        ).toBe(true);
      }
    });

    it('should detect expanded SSRF cloud metadata and link-local access', () => {
      const targets = [
        'metadata.google.internal',
        'instance-data',
        '169.254.1.1',
      ];
      for (const target of targets) {
        const request = createMockRequest(
          `https://example.com/api/test?url=http://${target}`
        );
        const result = detectSuspiciousPatterns(request, { minSeverity: 3 });
        expect(result.detected).toBe(true);
        expect(result.maxSeverity).toBe(3);
        expect(result.patterns.some((p) => p.category === 'ssrf')).toBe(true);
      }
    });
  });
});
