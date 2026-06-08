import { detectSuspiciousPatterns } from '@/lib/security/suspicious-patterns';

describe('NoSQL Injection Detection', () => {
  it('should detect NoSQL injection in query parameter values (colon notation)', () => {
    const url = 'https://example.com/api/users?id={"$ne":1}';
    const request = new Request(url);
    const result = detectSuspiciousPatterns(request, { minSeverity: 2 });

    expect(result.detected).toBe(true);
    expect(result.patterns.some(p => p.category === 'nosql_injection')).toBe(true);
  });

  it('should detect NoSQL injection in query parameter keys (bracket notation)', () => {
    const url = 'https://example.com/api/users?id[$ne]=1';
    const request = new Request(url);
    const result = detectSuspiciousPatterns(request, { minSeverity: 2 });

    expect(result.detected).toBe(true);
    expect(result.patterns.some(p => p.category === 'nosql_injection')).toBe(true);
  });
});
