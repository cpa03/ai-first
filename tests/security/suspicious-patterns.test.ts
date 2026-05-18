/**
 * Tests for suspicious request pattern detection
 * @module tests/security/suspicious-patterns.test
 */

import { NextRequest } from 'next/server';
import { detectSuspiciousPatterns } from '@/lib/security/suspicious-patterns';

describe('Suspicious Pattern Detection Improvements', () => {
  const createMockRequest = (url: string, headers: Record<string, string> = {}) => {
    return new NextRequest(new URL(url, 'https://example.com'), {
      headers: new Headers(headers),
    });
  };

  describe('SQL Injection', () => {
    it('should detect string-based tautologies without numbers', () => {
      const request = createMockRequest("https://example.com/api/test?id=' OR 'a'='a");
      const result = detectSuspiciousPatterns(request, { minSeverity: 1 });
      expect(result.detected).toBe(true);
      expect(result.patterns.some(p => p.category === 'sql_injection')).toBe(true);
    });

    it('should detect system table access attempts even without keywords', () => {
      // Current patterns might miss this if they only look for SELECT ... FROM
      const request = createMockRequest('https://example.com/api/test?table=information_schema.columns');
      const result = detectSuspiciousPatterns(request, { minSeverity: 1 });
      expect(result.detected).toBe(true);
      expect(result.patterns.some(p => p.category === 'sql_injection')).toBe(true);
    });
  });

  describe('XSS', () => {
    it('should detect srcdoc attribute injection', () => {
      // Existing patterns might miss srcdoc if it doesn't contain <script>
      const request = createMockRequest('https://example.com/api/test?attr=<div srcdoc="onclick=alert(1)">');
      const result = detectSuspiciousPatterns(request, { minSeverity: 1 });
      expect(result.detected).toBe(true);
      expect(result.patterns.some(p => p.category === 'xss')).toBe(true);
    });

    it('should detect vbscript: protocol', () => {
      const requestVb = createMockRequest('https://example.com/api/test?url=vbscript:msgbox("hello")');
      const result = detectSuspiciousPatterns(requestVb, { minSeverity: 1 });
      expect(result.detected).toBe(true);
      expect(result.patterns.some(p => p.category === 'xss')).toBe(true);
    });
  });

  describe('Command Injection', () => {
    it('should detect environment variable dumping (env/printenv)', () => {
      // Existing patterns miss env/printenv
      const requestEnv = createMockRequest('https://example.com/api/test?cmd=printenv');
      const result = detectSuspiciousPatterns(requestEnv, { minSeverity: 1 });
      expect(result.detected).toBe(true);
      expect(result.patterns.some(p => p.category === 'command_injection')).toBe(true);
    });

    it('should detect Node.js specific injection attempts', () => {
      const request = createMockRequest('https://example.com/api/test?code=process.version');
      const result = detectSuspiciousPatterns(request, { minSeverity: 1 });
      expect(result.detected).toBe(true);
      expect(result.patterns.some(p => p.category === 'command_injection')).toBe(true);
    });
  });
});
