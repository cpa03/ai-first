import { generateSecureId, timingSafeEqual, simpleHash } from '../src/lib/id-generator';

describe('id-generator', () => {
  describe('generateSecureId', () => {
    it('should generate a valid UUID', () => {
      const id = generateSecureId();
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should generate unique IDs', () => {
      const id1 = generateSecureId();
      const id2 = generateSecureId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('timingSafeEqual', () => {
    it('should return true for equal strings', () => {
      expect(timingSafeEqual('hello', 'hello')).toBe(true);
    });

    it('should return false for different strings', () => {
      expect(timingSafeEqual('hello', 'world')).toBe(false);
    });

    it('should return false for strings of different lengths', () => {
      expect(timingSafeEqual('abc', 'abcd')).toBe(false);
    });

    it('should return true for equal Uint8Arrays', () => {
      const a = new Uint8Array([1, 2, 3]);
      const b = new Uint8Array([1, 2, 3]);
      expect(timingSafeEqual(a, b)).toBe(true);
    });

    it('should return false for different Uint8Arrays', () => {
      const a = new Uint8Array([1, 2, 3]);
      const b = new Uint8Array([1, 2, 4]);
      expect(timingSafeEqual(a, b)).toBe(false);
    });
  });

  describe('simpleHash', () => {
    it('should return a stable hash for the same input', () => {
      const input = 'test-string';
      expect(simpleHash(input)).toBe(simpleHash(input));
    });

    it('should return different hashes for different inputs', () => {
      expect(simpleHash('input1')).not.toBe(simpleHash('input2'));
    });

    it('should return an 8-character hex string', () => {
      expect(simpleHash('test')).toMatch(/^[0-9a-f]{8}$/);
    });
  });
});
