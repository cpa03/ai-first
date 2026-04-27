import { generateSecureId, simpleHash, timingSafeEqual } from '../src/lib/id-generator';

describe('id-generator', () => {
  describe('generateSecureId', () => {
    it('should generate a unique ID with prefix', () => {
      const id1 = generateSecureId('test_');
      const id2 = generateSecureId('test_');
      expect(id1).not.toBe(id2);
      expect(id1.startsWith('test_')).toBe(true);
      expect(id1.length).toBeGreaterThan(20);
    });

    it('should generate a unique ID without prefix', () => {
      const id1 = generateSecureId();
      const id2 = generateSecureId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('simpleHash', () => {
    it('should be deterministic', () => {
      const input = 'test-input';
      const hash1 = simpleHash(input, 16);
      const hash2 = simpleHash(input, 16);
      expect(hash1).toBe(hash2);
    });

    it('should respect requested length', () => {
      const input = 'test-input';
      expect(simpleHash(input, 8).length).toBe(8);
      expect(simpleHash(input, 16).length).toBe(16);
      expect(simpleHash(input, 32).length).toBe(32);
    });

    it('should produce different hashes for different inputs', () => {
      const hash1 = simpleHash('input1', 16);
      const hash2 = simpleHash('input2', 16);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('timingSafeEqual', () => {
    it('should return true for equal strings', () => {
      expect(timingSafeEqual('secret', 'secret')).toBe(true);
    });

    it('should return false for different strings', () => {
      expect(timingSafeEqual('secret', 'wrong')).toBe(false);
    });

    it('should return false for different lengths', () => {
      expect(timingSafeEqual('secret', 'sec')).toBe(false);
    });

    it('should work with Uint8Arrays', () => {
      const a = new TextEncoder().encode('hello');
      const b = new TextEncoder().encode('hello');
      const c = new TextEncoder().encode('world');
      expect(timingSafeEqual(a, b)).toBe(true);
      expect(timingSafeEqual(a, c)).toBe(false);
    });
  });
});
