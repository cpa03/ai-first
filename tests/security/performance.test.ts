import { NextRequest } from 'next/server';
import { detectSuspiciousPatterns } from '@/lib/security/suspicious-patterns';

describe('Suspicious Pattern Detection Performance', () => {
  const createRequest = (url: string, headers: Record<string, string> = {}) => {
    return new NextRequest(new URL(url, 'https://example.com'), {
      headers: new Headers(headers),
    });
  };

  const cleanRequest = createRequest('https://example.com/api/clean', {
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0',
  });

  const heavyCleanRequest = createRequest('https://example.com/api/heavy?q=search&page=1&sort=desc&limit=10&filter=active', {
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0',
    'X-Custom-Header-1': 'Value1',
    'X-Custom-Header-2': 'Value2',
    'X-Custom-Header-3': 'Value3',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
  });

  const suspiciousRequest = createRequest('https://example.com/api/danger?id=1%20OR%201=1', {
    'X-Attacker-Header': '<script>alert(1)</script>',
  });

  const iterations = 5000;

  it('measures performance for clean requests', () => {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      detectSuspiciousPatterns(cleanRequest, { logDetected: false });
    }
    const end = performance.now();
    console.log(`Clean request performance: ${((end - start) / iterations).toFixed(4)}ms per call`);
  });

  it('measures performance for heavy clean requests', () => {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      detectSuspiciousPatterns(heavyCleanRequest, { logDetected: false });
    }
    const end = performance.now();
    console.log(`Heavy clean request performance: ${((end - start) / iterations).toFixed(4)}ms per call`);
  });

  it('measures performance for suspicious requests', () => {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      detectSuspiciousPatterns(suspiciousRequest, { logDetected: false });
    }
    const end = performance.now();
    console.log(`Suspicious request performance: ${((end - start) / iterations).toFixed(4)}ms per call`);
  });
});
