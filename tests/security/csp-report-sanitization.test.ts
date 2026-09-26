import { POST } from '@/app/api/csp-report/route';
import { SecurityAuditLog } from '@/lib/security/audit-log';
import { NextRequest } from 'next/server';

jest.mock('@/lib/security/audit-log', () => ({
  SecurityAuditLog: {
    logCSPViolation: jest.fn(),
  },
}));

describe('CSP Violation Report Payload Sanitization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sanitizes CRLF/null characters and redacts PII in CSP report fields', async () => {
    const payload = {
      'csp-report': {
        'document-uri': 'https://example.com/page\r\n[FAKE_LOG_ENTRY]',
        'violated-directive': 'script-src\n\x00',
        'blocked-uri': 'https://example.com/user@example.com/test',
        'source-file': 'https://example.com/app.js\r\nHeader: injected',
        'script-sample': 'console.log("user@example.com")\r\n\x00',
        'original-policy': "script-src 'self'\r\n",
        referrer: 'https://referrer.com\n',
      },
    };

    const req = new NextRequest('http://localhost:3000/api/csp-report', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'user-agent': 'Mozilla/5.0 Injected-Header: 123',
      },
      body: JSON.stringify(payload),
    });

    const res = await POST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(204);

    expect(SecurityAuditLog.logCSPViolation).toHaveBeenCalledTimes(1);
    const logArgs = (SecurityAuditLog.logCSPViolation as jest.Mock).mock.calls[0][0];

    // Assert CRLF and null bytes removed
    expect(logArgs.documentUri).not.toContain('\r');
    expect(logArgs.documentUri).not.toContain('\n');
    expect(logArgs.violatedDirective).not.toContain('\n');
    expect(logArgs.violatedDirective).not.toContain('\x00');
    expect(logArgs.sourceFile).not.toContain('\r');
    expect(logArgs.sourceFile).not.toContain('\n');
    expect(logArgs.scriptSample).not.toContain('\r');
    expect(logArgs.scriptSample).not.toContain('\n');

    // Assert PII redacted
    expect(logArgs.blockedUri).not.toContain('user@example.com');
    expect(logArgs.blockedUri).toContain('[REDACTED_EMAIL]');
    expect(logArgs.scriptSample).not.toContain('user@example.com');
    expect(logArgs.scriptSample).toContain('[REDACTED_EMAIL]');
  });
});
