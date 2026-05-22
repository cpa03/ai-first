/**
 * Targeted security improvements verification
 * @module tests/security/sentinel-improvements.test
 */

import { NextRequest } from 'next/server';
import { detectSuspiciousPatterns } from '@/lib/security/suspicious-patterns';
import { isSensitiveVar } from '@/lib/security/env-validation';

describe('Sentinel Security Improvements', () => {
  const createMockRequest = (
    url: string,
    headers: Record<string, string> = {}
  ) => {
    return new NextRequest(new URL(url, 'https://example.com'), {
      headers: new Headers(headers),
    });
  };

  describe('NoSQL Injection (JSON compatible)', () => {
    it('should detect MongoDB operators with double quotes (JSON style)', () => {
      const payload = '{"$where": "true"}';
      const request = createMockRequest(`https://example.com/api/test?q=${payload}`);
      const result = detectSuspiciousPatterns(request, { minSeverity: 2 });
      expect(result.detected).toBe(true);
      expect(result.patterns.some(p => p.category === 'nosql_injection')).toBe(true);
    });

    it('should detect MongoDB operators with single quotes', () => {
      const payload = "{'$where': 'true'}";
      const request = createMockRequest(`https://example.com/api/test?q=${payload}`);
      const result = detectSuspiciousPatterns(request, { minSeverity: 2 });
      expect(result.detected).toBe(true);
      expect(result.patterns.some(p => p.category === 'nosql_injection')).toBe(true);
    });

    it('should detect comparison operators with quotes', () => {
      const payload = '{"$gt": 0}';
      const request = createMockRequest(`https://example.com/api/test?q=${payload}`);
      const result = detectSuspiciousPatterns(request, { minSeverity: 2 });
      expect(result.detected).toBe(true);
      expect(result.patterns.some(p => p.category === 'nosql_injection')).toBe(true);
    });
  });

  describe('Path Traversal (Expanded Patterns)', () => {
    it('should detect .kube/config access', () => {
      const request = createMockRequest('https://example.com/api/test?file=/root/.kube/config');
      const result = detectSuspiciousPatterns(request, { minSeverity: 3 });
      expect(result.detected).toBe(true);
      expect(result.patterns.some(p => p.category === 'path_traversal')).toBe(true);
    });

    it('should detect AWS/cloud credentials access', () => {
      const request = createMockRequest('https://example.com/api/test?file=/home/user/.aws/credentials');
      const result = detectSuspiciousPatterns(request, { minSeverity: 3 });
      expect(result.detected).toBe(true);
      expect(result.patterns.some(p => p.category === 'path_traversal')).toBe(true);
    });
  });

  describe('SSRF Header Exclusion', () => {
    it('should NOT detect localhost in Referer header as SSRF', () => {
      const request = createMockRequest('https://example.com/api/test', {
        'Referer': 'http://localhost:3000/'
      });
      const result = detectSuspiciousPatterns(request, { minSeverity: 2 });

      // Should not detect SSRF in referer
      const ssrfInReferer = result.patterns.find(p => p.category === 'ssrf' && p.location === 'header' && p.field === 'referer');
      expect(ssrfInReferer).toBeUndefined();
    });

    it('should NOT detect localhost in Origin header as SSRF', () => {
      const request = createMockRequest('https://example.com/api/test', {
        'Origin': 'http://127.0.0.1:3000'
      });
      const result = detectSuspiciousPatterns(request, { minSeverity: 2 });

      // Should not detect SSRF in origin
      const ssrfInOrigin = result.patterns.find(p => p.category === 'ssrf' && p.location === 'header' && p.field === 'origin');
      expect(ssrfInOrigin).toBeUndefined();
    });

    it('should STILL detect XSS in Referer header', () => {
      const request = createMockRequest('https://example.com/api/test', {
        'Referer': 'https://example.com/?q=<script>alert(1)</script>'
      });
      const result = detectSuspiciousPatterns(request, { minSeverity: 2 });

      expect(result.detected).toBe(true);
      expect(result.patterns.some(p => p.category === 'xss' && p.location === 'header' && p.field === 'referer')).toBe(true);
    });

    it('should STILL detect SSRF in query parameters', () => {
      const request = createMockRequest('https://example.com/api/test?url=http://localhost:3000');
      const result = detectSuspiciousPatterns(request, { minSeverity: 2 });

      expect(result.detected).toBe(true);
      expect(result.patterns.some(p => p.category === 'ssrf' && p.location === 'query')).toBe(true);
    });
  });

  describe('Environment Validation', () => {
    it('should identify KUBECONFIG as a sensitive variable', () => {
      expect(isSensitiveVar('KUBECONFIG')).toBe(true);
      expect(isSensitiveVar('MY_APP_KUBECONFIG_PATH')).toBe(true);
    });
  });
});
