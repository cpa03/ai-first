import { generateSecureId, timingSafeEqual, simpleHash } from '../src/lib/id-generator';

describe('id-generator', () => {
  describe('generateSecureId', () => {
    it('should generate a valid UUID v4', () => {
      const id = generateSecureId();
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should generate unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateSecureId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('timingSafeEqual', () => {
    it('should return true for equal strings', () => {
      expect(timingSafeEqual('hello', 'hello')).toBe(true);
      expect(timingSafeEqual('', '')).toBe(true);
      expect(timingSafeEqual('a'.repeat(100), 'a'.repeat(100))).toBe(true);
    });

    it('should return false for different strings of same length', () => {
      expect(timingSafeEqual('hello', 'world')).toBe(false);
      expect(timingSafeEqual('abc', 'abd')).toBe(false);
    });

    it('should return false for strings of different length', () => {
      expect(timingSafeEqual('hello', 'helloo')).toBe(false);
      expect(timingSafeEqual('abc', 'ab')).toBe(false);
    });

    it('should handle non-string inputs gracefully', () => {
      // @ts-expect-error - testing invalid inputs
      expect(timingSafeEqual(null, 'a')).toBe(false);
      // @ts-expect-error - testing invalid inputs
      expect(timingSafeEqual('a', undefined)).toBe(false);
    });
  });

  describe('simpleHash', () => {
    it('should be deterministic', () => {
      const input = 'test-string';
      expect(simpleHash(input)).toBe(simpleHash(input));
    });

    it('should produce 16-character hex string', () => {
      const hash = simpleHash('something');
      expect(hash).toMatch(/^[0-9a-f]{16}$/);
    });

    it('should produce different hashes for different inputs', () => {
      const h1 = simpleHash('input1');
      const h2 = simpleHash('input2');
      expect(h1).not.toBe(h2);
    });

    it('should handle empty string', () => {
      expect(simpleHash('')).toMatch(/^[0-9a-f]{16}$/);
    });
  });
});
