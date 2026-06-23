
import { sanitizeHtml } from '../src/lib/validation';

describe('sanitizeHtml Performance', () => {
  const plainText = 'This is a normal title without any special characters';
  const htmlText = '<script>alert("xss")</script><b>Bold Text</b> & "quoted"';
  const iterations = 10000;

  test('Benchmark current implementation', () => {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      sanitizeHtml(plainText);
    }
    const end = performance.now();
    console.log(`Plain text sanitizeHtml x ${iterations}: ${end - start}ms`);

    const start2 = performance.now();
    for (let i = 0; i < iterations; i++) {
      sanitizeHtml(htmlText);
    }
    const end2 = performance.now();
    console.log(`HTML text sanitizeHtml x ${iterations}: ${end2 - start2}ms`);
  });

  test('Correctness', () => {
    expect(sanitizeHtml('<b>Hello</b>')).toBe('&lt;b&gt;Hello&lt;&#x2F;b&gt;');
    expect(sanitizeHtml('<script>alert(1)</script>')).toBe('');
    expect(sanitizeHtml('  trimmed  ')).toBe('trimmed');
    expect(sanitizeHtml('')).toBe('');
    expect(sanitizeHtml('   ')).toBe('');
    expect(sanitizeHtml('no special chars')).toBe('no special chars');
    expect(sanitizeHtml('onClick="alert(1)"')).toBe('');
  });

  test('Security Sanitization', () => {
    // Event handlers
    expect(sanitizeHtml('<div onclick="alert(1)">')).toBe('&lt;div&gt;');
    // Script protocol
    expect(sanitizeHtml('<a href="javascript:alert(1)">')).toBe('&lt;a href=&quot;[REDACTED_PROTOCOL]alert(1)&quot;&gt;');
    // Note: sanitizeHtml in this codebase seems to only remove <script> tags and onXXX attributes, then escapes everything.
    // So <a href="javascript:..."> becomes &lt;a href=&quot;javascript:...&quot;&gt; which is safe as it's escaped.
  });
});
