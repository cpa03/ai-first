import { detectSuspiciousPatterns } from '../src/lib/security/suspicious-patterns';
import { NextRequest } from 'next/server';

describe('Security Pattern Detection Performance', () => {
  const createMockRequest = (
    url: string,
    headers: Record<string, string> = {}
  ) => {
    return new NextRequest(new URL(url, 'https://example.com'), {
      headers: new Headers(headers),
    });
  };

  const cleanRequest = createMockRequest(
    'https://example.com/api/ideas?id=123&query=search+term&filter=active',
    {
      'User-Agent': 'Mozilla/5.0 ...',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'X-Custom-Header': 'some-value',
    }
  );

  it('measures scanning performance for a clean request', () => {
    const iterations = 5000;

    // Warm up
    for (let i = 0; i < 500; i++) {
      detectSuspiciousPatterns(cleanRequest, { minSeverity: 2 });
    }

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      detectSuspiciousPatterns(cleanRequest, { minSeverity: 2 });
    }
    const end = performance.now();
    const duration = end - start;

    console.log(
      `Scanned clean request ${iterations} times in ${duration.toFixed(2)}ms`
    );
    console.log(
      `Average time per scan: ${(duration / iterations).toFixed(4)}ms`
    );

    // Expectation: Should be fast, but we'll see the baseline first.
    // Typical result might be ~0.2-0.5ms per scan.
  });

  const maliciousRequest = createMockRequest(
    "https://example.com/api/test?id=' OR '1'='1"
  );

  it('measures scanning performance for a malicious request', () => {
    const iterations = 5000;

    // Warm up
    for (let i = 0; i < 500; i++) {
      detectSuspiciousPatterns(maliciousRequest, { minSeverity: 2 });
    }

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      detectSuspiciousPatterns(maliciousRequest, { minSeverity: 2 });
    }
    const end = performance.now();
    const duration = end - start;

    console.log(
      `Scanned malicious request ${iterations} times in ${duration.toFixed(2)}ms`
    );
    console.log(
      `Average time per scan: ${(duration / iterations).toFixed(4)}ms`
    );
  });
});
