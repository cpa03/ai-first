import { sanitizeHtml } from '@/lib/validation';

describe('sanitizeHtml Security Bypasses', () => {
  it('should not allow javascript: protocol bypass', () => {
    const input = 'javascript:alert(1)';
    const sanitized = sanitizeHtml(input);
    // Current implementation will likely return it as is because it doesn't match NEEDS_SANITIZATION_REGEX
    expect(sanitized).not.toBe(input);
    expect(sanitized.toLowerCase()).not.toContain('javascript:');
  });

  it('should not allow data: protocol bypass', () => {
    const input = 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==';
    const sanitized = sanitizeHtml(input);
    expect(sanitized).not.toBe(input);
    expect(sanitized.toLowerCase()).not.toContain('data:text/html');
  });

  it('should catch event handlers with single quotes', () => {
    const input = "<img src=x onerror='alert(1)'>";
    const sanitized = sanitizeHtml(input);
    // It should at least remove the onerror part or escape it so it's not a functional attribute
    // if it were to be used in a way that unescapes it.
    // However, sanitizeHtml currently escapes < and >, which is good.
    // But let's see if we can catch the attribute specifically.
    expect(sanitized.toLowerCase()).not.toContain('onerror');
  });

  it('should catch unquoted event handlers', () => {
    const input = '<img src=x onerror=alert(1)>';
    const sanitized = sanitizeHtml(input);
    expect(sanitized.toLowerCase()).not.toContain('onerror');
  });

  it('should catch event handlers without preceding space', () => {
    const input = '<img/onload=alert(1)>';
    const sanitized = sanitizeHtml(input);
    expect(sanitized.toLowerCase()).not.toContain('onload');
  });

  it('should catch obfuscated javascript protocols with whitespace and control characters', () => {
    const inputs = [
      'java\nscript:alert(1)',
      'java\tscript:alert(1)',
      'java\rscript:alert(1)',
      'java\u0000script:alert(1)',
      'j\ta\nv\ra\ts\nc\rr\ti\np\rt:alert(1)',
    ];

    for (const input of inputs) {
      const sanitized = sanitizeHtml(input);
      expect(sanitized).not.toBe(input);
      expect(sanitized).toContain('[REDACTED_PROTOCOL]');
    }
  });

  it('should catch obfuscated data protocols with whitespace and control characters', () => {
    const inputs = [
      'da\nta:text/html,abc',
      'da\tta:text/html,abc',
      'da\rta:text/html,abc',
      'da\u0000ta:text/html,abc',
    ];

    for (const input of inputs) {
      const sanitized = sanitizeHtml(input);
      expect(sanitized).not.toBe(input);
      expect(sanitized).toContain('[REDACTED_DATA_URI]');
    }
  });
});
