import { NextRequest } from 'next/server';
import { detectSuspiciousPatterns } from '../../src/lib/security/suspicious-patterns';

describe('Suspicious Pattern Detection Performance', () => {
  const createMockRequest = (
    url: string,
    headers: Record<string, string> = {}
  ) => {
    return new NextRequest(new URL(url, 'https://example.com'), {
      headers: new Headers(headers),
    });
  };

  const safeRequest = createMockRequest('https://example.com/api/tasks/123', {
    'X-Request-ID': 'req_123456789',
    'X-Client-Version': '1.0.0',
  });

  const suspiciousRequest = createMockRequest('https://example.com/api/tasks?id=1;DROP TABLE users', {
    'User-Agent': 'Mozilla/5.0',
    'X-Custom-Header': '<script>alert(1)</script>',
  });

  it('measures performance for safe requests', () => {
    const iterations = 10000;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      detectSuspiciousPatterns(safeRequest, { logDetected: false });
    }
    const end = performance.now();
    const duration = end - start;
    console.log(
      `Scanned safe request ${iterations} times in ${duration.toFixed(2)}ms`
    );
    console.log(
      `Average time per safe scan: ${(duration / iterations).toFixed(4)}ms`
    );
  });

  it('measures performance for suspicious requests', () => {
    const iterations = 10000;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      detectSuspiciousPatterns(suspiciousRequest, { logDetected: false });
    }
    const end = performance.now();
    const duration = end - start;
    console.log(
      `Scanned suspicious request ${iterations} times in ${duration.toFixed(2)}ms`
    );
    console.log(
      `Average time per suspicious scan: ${(duration / iterations).toFixed(4)}ms`
    );
  });
});
