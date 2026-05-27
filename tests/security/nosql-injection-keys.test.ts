
import { NextRequest } from 'next/server';
import { detectSuspiciousPatterns } from '@/lib/security/suspicious-patterns';

describe('NoSQL Injection in Keys', () => {
  const createMockRequest = (url: string) => {
    return new NextRequest(new URL(url, 'https://example.com'));
  };

  it('should detect NoSQL injection in query parameter keys using bracket notation', () => {
    // This is a common NoSQL injection pattern: ?id[$ne]=null
    const request = createMockRequest('https://example.com/api/ideas?id[$ne]=null');
    const result = detectSuspiciousPatterns(request, { minSeverity: 2 });

    expect(result.detected).toBe(true);
    expect(result.patterns.some(p => p.category === 'nosql_injection')).toBe(true);
  });

  it('should detect NoSQL injection in query parameter values (JSON style)', () => {
    const request = createMockRequest('https://example.com/api/ideas?filter={"id":{"$ne":null}}');
    const result = detectSuspiciousPatterns(request, { minSeverity: 2 });

    expect(result.detected).toBe(true);
    expect(result.patterns.some(p => p.category === 'nosql_injection')).toBe(true);
  });
});
