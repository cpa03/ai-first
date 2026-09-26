/**
 * Regression tests for #4470 (regex /g .test flap) and #4471 (isSafeUrl bypass).
 * Code fix already landed in #4472; these tests lock the behavior.
 */
import {
  sanitizeXSS,
  validateNoXSS,
} from '@/lib/validators/xss-sanitizer';

describe('#4470 validateNoXSS is stable across repeated calls (/g lastIndex)', () => {
  it('returns invalid on every repeated call with XSS input', () => {
    const xss = '<script>alert(1)</script>';
    for (let i = 0; i < 5; i++) {
      const r = validateNoXSS(xss, 'field');
      expect(r.valid).toBe(false);
      expect(r.errors.length).toBeGreaterThan(0);
    }
  });

  it('returns valid on every repeated call with safe input', () => {
    for (let i = 0; i < 5; i++) {
      expect(validateNoXSS('hello world', 'field').valid).toBe(true);
    }
  });

  it('does not flap when alternating safe and malicious input', () => {
    expect(
      validateNoXSS('<script>alert(1)</script>', 'f').valid
    ).toBe(false);
    expect(validateNoXSS('just text', 'f').valid).toBe(true);
    expect(
      validateNoXSS('<script>alert(1)</script>', 'f').valid
    ).toBe(false);
    expect(validateNoXSS('just text', 'f').valid).toBe(true);
  });
});

describe('#4471 isSafeUrl blocks obfuscated schemes and svg data URIs', () => {
  const opts = { allowBasicFormatting: false, allowLinks: true };

  it('strips tab-obfuscated javascript: href', () => {
    const out = sanitizeXSS(
      '<a href="java\tscript:alert(1)">x</a>',
      opts
    );
    expect(out.toLowerCase()).not.toContain('javascript');
    expect(out).not.toContain('href="java');
  });

  it('strips LF/CR-obfuscated javascript: href', () => {
    for (const ch of ['\n', '\r']) {
      const out = sanitizeXSS(
        `<a href="java${ch}script:alert(1)">x</a>`,
        opts
      );
      expect(out.toLowerCase()).not.toContain('javascript');
    }
  });

  it('blocks data:image/svg+xml href', () => {
    const out = sanitizeXSS(
      '<a href="data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=">x</a>',
      opts
    );
    expect(out).not.toContain('data:image/svg+xml');
  });

  it('blocks data:text/html href', () => {
    const out = sanitizeXSS(
      '<a href="data:text/html;base64,PGI+">x</a>',
      opts
    );
    expect(out).not.toContain('data:text/html');
  });

  it('still allows inert bitmap data URIs and https links', () => {
    // Note: sanitizeXSS escapes HTML entities in the final pass, so '/'
    // becomes '&#x2F;'. Assert on the escaped form.
    const png = sanitizeXSS(
      '<a href="data:image/png;base64,iVBORw0=">x</a>',
      opts
    );
    expect(png).toContain('data:image');
    expect(png).toContain('href=');
    const https = sanitizeXSS('<a href="https://example.com">x</a>', opts);
    expect(https).toContain('example.com');
    expect(https).toContain('href=');
  });
});
