/**
 * Tests for null byte injection detection in path traversal
 * @module tests/security/null-byte-traversal.test
 */

import { NextRequest } from 'next/server';
import { detectSuspiciousPatterns } from '@/lib/security/suspicious-patterns';

describe('Null Byte Path Traversal Detection', () => {
  const createMockRequest = (url: string) => {
    return new NextRequest(new URL(url, 'https://example.com'));
  };

  it('should detect URL-encoded null byte (%00)', () => {
    const request = createMockRequest(
      'https://example.com/api/files?file=secret.txt%00.png'
    );
    const result = detectSuspiciousPatterns(request, { minSeverity: 3 });
    expect(result.detected).toBe(true);
    expect(result.maxSeverity).toBe(3);
    expect(
      result.patterns.some((p) => p.category === 'path_traversal')
    ).toBe(true);
  });

  it('should detect double URL-encoded null byte (%2500)', () => {
    const request = createMockRequest(
      'https://example.com/api/files?file=../../etc/passwd%2500.jpg'
    );
    const result = detectSuspiciousPatterns(request, { minSeverity: 3 });
    expect(result.detected).toBe(true);
    expect(result.maxSeverity).toBe(3);
    expect(
      result.patterns.some((p) => p.category === 'path_traversal')
    ).toBe(true);
  });

  it('should detect raw null byte character (\x00)', () => {
    const request = createMockRequest(
      'https://example.com/api/files?file=etc/passwd\x00.pdf'
    );
    const result = detectSuspiciousPatterns(request, { minSeverity: 3 });
    expect(result.detected).toBe(true);
    expect(result.maxSeverity).toBe(3);
    expect(
      result.patterns.some((p) => p.category === 'path_traversal')
    ).toBe(true);
  });

  it('should not flag normal file paths without null bytes', () => {
    const request = createMockRequest(
      'https://example.com/api/files?file=document.pdf'
    );
    const result = detectSuspiciousPatterns(request, { minSeverity: 3 });
    expect(result.detected).toBe(false);
  });
});
