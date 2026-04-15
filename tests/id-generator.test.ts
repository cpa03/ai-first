import { generateSecureId } from '@/lib/id-generator';

describe('generateSecureId', () => {
  it('should generate an ID of reasonable length', () => {
    const id = generateSecureId();
    expect(id.length).toBeGreaterThan(20);
  });

  it('should include the prefix if provided', () => {
    const prefix = 'test_';
    const id = generateSecureId(prefix);
    expect(id.startsWith(prefix)).toBe(true);
  });

  it('should generate unique IDs', () => {
    const id1 = generateSecureId();
    const id2 = generateSecureId();
    expect(id1).not.toBe(id2);
  });

  it('should generate UUID-like strings by default', () => {
    const id = generateSecureId();
    // Simple regex for UUID v4 (or similar format)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    // Note: if it falls back to Math.random, this might fail, but in Node environment it should use crypto.randomUUID()
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      expect(id).toMatch(uuidRegex);
    }
  });
});
