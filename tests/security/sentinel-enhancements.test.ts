import { sanitizeHtml } from '@/lib/validation';
import { withApiHandler } from '@/lib/api-handler/wrapper';
import { detectSuspiciousPatterns } from '@/lib/security/suspicious-patterns';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/lib/security/audit-log', () => ({
  SecurityAuditLog: {
    logEvent: jest.fn(),
    logRateLimit: jest.fn(),
  },
}));

jest.mock('@/lib/metrics', () => ({
  httpRequestDuration: { observe: jest.fn() },
  httpRequestErrors: { inc: jest.fn() },
  httpRequestTotal: { inc: jest.fn() },
}));

jest.mock('@/lib/logger', () => {
  const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    infoWithContext: jest.fn(),
    warnWithContext: jest.fn(),
    errorWithContext: jest.fn(),
  };
  return {
    createLogger: () => mockLogger,
    generateCorrelationId: () => 'test-correlation-id',
    setCorrelationId: jest.fn(),
  };
});

describe('Sentinel Security Enhancements', () => {
  describe('HTML Sanitization (Style Redaction)', () => {
    it('should redact style attributes in various formats', () => {
      const cases = [
        { input: '<div style="color: red">', expected: '<div [REDACTED_STYLE]>' },
        { input: "<div style='color: red'>", expected: '<div [REDACTED_STYLE]>' },
        { input: '<div style=color:red>', expected: '<div [REDACTED_STYLE]>' },
        { input: '<img/style="border:0">', expected: '<img [REDACTED_STYLE]>' },
      ];

      for (const { input, expected } of cases) {
        expect(sanitizeHtml(input)).toContain('[REDACTED_STYLE]');
        // Also ensure it escapes the < and >
        const sanitized = sanitizeHtml(input);
        expect(sanitized).toContain('&lt;');
        expect(sanitized).toContain('&gt;');
      }
    });

    it('should still redact dangerous protocols', () => {
      expect(sanitizeHtml('javascript:alert(1)')).toBe('[REDACTED_PROTOCOL]alert(1)');
      expect(sanitizeHtml('data:text/html,abc')).toBe('[REDACTED_DATA_URI],abc');
    });
  });

  describe('API Blocking Threshold (Severity >= 2)', () => {
    const mockHandler = jest.fn().mockResolvedValue(new Response('OK'));

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should block requests with severity 3 patterns (High)', async () => {
      const wrapped = withApiHandler(mockHandler);
      // Severity 3 pattern (SQL injection UNION SELECT)
      const request = new NextRequest('http://localhost/api/test?q=UNION SELECT * FROM users');

      const response = await wrapped(request);
      expect(response.status).toBe(403);
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should block requests with severity 2 patterns (Medium)', async () => {
      const wrapped = withApiHandler(mockHandler);
      // Severity 2 pattern (Path traversal ../)
      const request = new NextRequest('http://localhost/api/test?file=../../etc/passwd');

      const response = await wrapped(request);
      expect(response.status).toBe(403);
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should NOT block requests with severity 1 patterns (Low)', async () => {
      const wrapped = withApiHandler(mockHandler);
      // Downgraded severity 1 pattern (' or ')
      // We need to make sure this doesn't match a higher severity pattern by accident.
      const request = new NextRequest("http://localhost/api/test?q=' or '");

      const response = await wrapped(request);
      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalled();
    });
  });
});
