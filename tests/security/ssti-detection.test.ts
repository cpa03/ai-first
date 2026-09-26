import { detectSuspiciousPatterns } from '@/lib/security/suspicious-patterns';

describe('Enhanced SSTI Detection', () => {
  it('detects unescaped triple brace template interpolation', async () => {
    const req = new Request('https://example.com/api?q={{{user_input}}}');
    const result = await detectSuspiciousPatterns(req);

    expect(result.detected).toBe(true);
    expect(result.patterns.some((p) => p.category === 'ssti')).toBe(true);
  });

  it('detects SSTI mathematical expression evaluation payloads', async () => {
    const req = new Request('https://example.com/api?calc={{7*7}}');
    const result = await detectSuspiciousPatterns(req);

    expect(result.detected).toBe(true);
    expect(result.patterns.some((p) => p.category === 'ssti')).toBe(true);
  });

  it('detects SSTI string concatenation payloads', async () => {
    const req = new Request('https://example.com/api?str={{"a"+"b"}}');
    const result = await detectSuspiciousPatterns(req);

    expect(result.detected).toBe(true);
    expect(result.patterns.some((p) => p.category === 'ssti')).toBe(true);
  });

  it('detects JS/Python property introspection via SSTI', async () => {
    const req1 = new Request('https://example.com/api?x={{obj.constructor}}');
    const result1 = await detectSuspiciousPatterns(req1);
    expect(result1.detected).toBe(true);

    const req2 = new Request('https://example.com/api?x={{obj.prototype}}');
    const result2 = await detectSuspiciousPatterns(req2);
    expect(result2.detected).toBe(true);
  });

  it('detects execution function access in template tags', async () => {
    const req = new Request('https://example.com/api?x={{process.env}}');
    const result = await detectSuspiciousPatterns(req);

    expect(result.detected).toBe(true);
    expect(result.patterns.some((p) => p.category === 'ssti')).toBe(true);
  });

  it('does NOT trigger false positives on benign inputs', async () => {
    const req = new Request('https://example.com/api?q=hello_world&page=2');
    const result = await detectSuspiciousPatterns(req);

    expect(result.detected).toBe(false);
  });
});
