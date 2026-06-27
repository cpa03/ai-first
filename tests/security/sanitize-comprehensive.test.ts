import { sanitizeHtml } from '@/lib/validation';

describe('sanitizeHtml Comprehensive Security', () => {
  it('should redact javascript: protocol even if it does not contain other special chars', () => {
    const input = 'javascript:alert(1)';
    const sanitized = sanitizeHtml(input);
    expect(sanitized).toContain('[REDACTED_PROTOCOL]');
    expect(sanitized).not.toContain('javascript:');
  });

  it('should redact vbscript: protocol even if it does not contain other special chars', () => {
    const input = 'vbscript:alert(1)';
    const sanitized = sanitizeHtml(input);
    expect(sanitized).toContain('[REDACTED_PROTOCOL]');
    expect(sanitized).not.toContain('vbscript:');
  });

  it('should redact livescript: protocol even if it does not contain other special chars', () => {
    const input = 'livescript:alert(1)';
    const sanitized = sanitizeHtml(input);
    expect(sanitized).toContain('[REDACTED_PROTOCOL]');
    expect(sanitized).not.toContain('livescript:');
  });

  it('should redact dangerous data: URIs (text/html) even if they do not contain other special chars', () => {
    const input = 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==';
    const sanitized = sanitizeHtml(input);
    expect(sanitized).toContain('[REDACTED_DATA_URI]');
    expect(sanitized).not.toContain('data:text/html');
  });

  it('should redact dangerous data: URIs (image/svg+xml) even if they do not contain other special chars', () => {
    const input = 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=';
    const sanitized = sanitizeHtml(input);
    expect(sanitized).toContain('[REDACTED_DATA_URI]');
    expect(sanitized).not.toContain('data:image/svg+xml');
  });

  it('should catch event handlers with different obfuscations', () => {
    const cases = [
      '<img src=x onerror=alert(1)>',
      '<img/src="x"/onerror=alert(1)>',
      '<svg onload=alert(1)>',
      '<details open ontoggle=alert(1)>'
    ];

    for (const input of cases) {
      const sanitized = sanitizeHtml(input);
      expect(sanitized.toLowerCase()).not.toContain('onerror');
      expect(sanitized.toLowerCase()).not.toContain('onload');
      expect(sanitized.toLowerCase()).not.toContain('ontoggle');
      // Should also be escaped
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
    }
  });
});
