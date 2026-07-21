import { sanitizeHtml, clearSanitizeHtmlCache } from '../src/lib/validation';

describe('sanitizeHtml Performance and Cache Correctness', () => {
  const plainText = 'This is a normal title without any special characters';
  const htmlText = '<script>alert("xss")</script><b>Bold Text</b> & "quoted"';
  const iterations = 10000;

  beforeEach(() => {
    clearSanitizeHtmlCache();
  });

  test('Benchmark current implementation', () => {
    // Cold run (uncached) - first operation
    clearSanitizeHtmlCache();
    const startCold = performance.now();
    sanitizeHtml(htmlText);
    const endCold = performance.now();
    const durationCold = endCold - startCold;

    // Warm run (cached) - many iterations
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      sanitizeHtml(plainText);
    }
    const end = performance.now();
    console.log(`Plain text sanitizeHtml x ${iterations}: ${(end - start).toFixed(2)}ms`);

    const start2 = performance.now();
    for (let i = 0; i < iterations; i++) {
      sanitizeHtml(htmlText);
    }
    const end2 = performance.now();
    console.log(`HTML text sanitizeHtml x ${iterations}: ${(end2 - start2).toFixed(2)}ms`);

    console.log(`Cold (uncached) scan took ${durationCold.toFixed(4)}ms vs cached average.`);
  });

  test('Cache Eviction and Cleaning', () => {
    clearSanitizeHtmlCache();
    const result1 = sanitizeHtml('<b>Hello</b>');
    expect(result1).toBe('&lt;b&gt;Hello&lt;&#x2F;b&gt;');

    // Fill the cache to test eviction limits
    for (let i = 0; i < 1100; i++) {
      sanitizeHtml(`some unique text ${i} <script>`);
    }

    // Cache should still function correctly
    const result2 = sanitizeHtml('<b>Hello</b>');
    expect(result2).toBe('&lt;b&gt;Hello&lt;&#x2F;b&gt;');

    // Clear cache
    clearSanitizeHtmlCache();
    const result3 = sanitizeHtml('<b>Hello</b>');
    expect(result3).toBe('&lt;b&gt;Hello&lt;&#x2F;b&gt;');
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
    expect(sanitizeHtml('<a href="javascript:alert(1)">')).toBe(
      '&lt;a href=&quot;[REDACTED_PROTOCOL]alert(1)&quot;&gt;'
    );
  });
});
