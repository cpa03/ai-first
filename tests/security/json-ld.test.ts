/**
 * Tests for JSON-LD security utility
 * @module tests/security/json-ld.test
 */

import { safeJsonLd } from '@/lib/security/json-ld';

describe('JSON-LD Security', () => {
  it('should stringify a simple object', () => {
    const obj = { name: 'IdeaFlow', url: 'https://ideaflow.ai' };
    const result = safeJsonLd(obj);
    expect(result).toBe('{"name":"IdeaFlow","url":"https://ideaflow.ai"}');
  });

  it('should escape < character to prevent script tag breakout', () => {
    const obj = { description: '</script><script>alert(1)</script>' };
    const result = safeJsonLd(obj);

    // Should contain escaped version of <
    expect(result).toContain('\\u003c/script\\u003e\\u003cscript\\u003ealert(1)\\u003c/script\\u003e');
    // Should NOT contain raw </script>
    expect(result).not.toContain('</script>');
    // Should NOT contain raw <script>
    expect(result).not.toContain('<script>');
  });

  it('should escape > character', () => {
    const obj = { test: 'a > b' };
    const result = safeJsonLd(obj);
    expect(result).toContain('a \\u003e b');
    expect(result).not.toContain('>');
  });

  it('should escape & character', () => {
    const obj = { test: 'a & b' };
    const result = safeJsonLd(obj);
    expect(result).toContain('a \\u0026 b');
    expect(result).not.toContain('&');
  });

  it('should handle complex nested objects', () => {
    const obj = {
      '@context': 'https://schema.org',
      nested: {
        payload: '<img src=x onerror=alert(1)>'
      }
    };
    const result = safeJsonLd(obj);
    expect(result).toContain('\\u003cimg src=x onerror=alert(1)\\u003e');
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
  });
});
