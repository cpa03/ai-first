import { detectSuspiciousPatterns } from '@/lib/security/suspicious-patterns';

describe('Enhanced SSTI Detection', () => {
  it('detects unescaped triple brace template interpolation', () => {
    const req = new Request('https://example.com/api?q={{{user_input}}}');
    const result = detectSuspiciousPatterns(req);

    expect(result.detected).toBe(true);
    expect(result.patterns.some((p) => p.category === 'ssti')).toBe(true);
  });

  it('detects SSTI mathematical expression evaluation payloads', () => {
    const req = new Request('https://example.com/api?calc={{7*7}}');
    const result = detectSuspiciousPatterns(req);

    expect(result.detected).toBe(true);
    expect(result.patterns.some((p) => p.category === 'ssti')).toBe(true);
  });

  it('detects SSTI string concatenation payloads', () => {
    const req = new Request('https://example.com/api?str={{"a"+"b"}}');
    const result = detectSuspiciousPatterns(req);

    expect(result.detected).toBe(true);
    expect(result.patterns.some((p) => p.category === 'ssti')).toBe(true);
  });

  it('detects JS/Python property introspection via SSTI', () => {
    const req1 = new Request('https://example.com/api?x={{obj.constructor}}');
    const result1 = detectSuspiciousPatterns(req1);
    expect(result1.detected).toBe(true);

    const req2 = new Request('https://example.com/api?x={{obj.prototype}}');
    const result2 = detectSuspiciousPatterns(req2);
    expect(result2.detected).toBe(true);
  });

  it('detects execution function access in template tags', () => {
    const req = new Request('https://example.com/api?x={{process.env}}');
    const result = detectSuspiciousPatterns(req);

    expect(result.detected).toBe(true);
    expect(result.patterns.some((p) => p.category === 'ssti')).toBe(true);
  });

  it('does NOT trigger false positives on benign inputs', () => {
    const req = new Request('https://example.com/api?q=hello_world&page=2');
    const result = detectSuspiciousPatterns(req);

    expect(result.detected).toBe(false);
  });
});
