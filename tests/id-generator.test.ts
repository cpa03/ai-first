import {
  generateSecureId,
  simpleHash,
  timingSafeEqual,
} from '@/lib/id-generator';

describe('id-generator', () => {
  describe('generateSecureId', () => {
    it('should generate a valid UUID v4', () => {
      const id = generateSecureId();
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should generate unique IDs', () => {
      const id1 = generateSecureId();
      const id2 = generateSecureId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('simpleHash', () => {
    it('should generate an 8-character hex string', () => {
      const hash = simpleHash('test-input');
      expect(hash).toMatch(/^[0-9a-f]{8}$/);
    });

    it('should be deterministic', () => {
      const input = 'consistent-input';
      expect(simpleHash(input)).toBe(simpleHash(input));
    });

    it('should generate different hashes for different inputs', () => {
      expect(simpleHash('input-1')).not.toBe(simpleHash('input-2'));
    });

    it('should handle empty string', () => {
      expect(simpleHash('')).toBe('00001505'); // DJB2 initial value
    });
  });

  describe('timingSafeEqual', () => {
    describe('string comparison', () => {
      it('should return true for equal strings', () => {
        expect(timingSafeEqual('abc', 'abc')).toBe(true);
      });

      it('should return false for different strings of same length', () => {
        expect(timingSafeEqual('abc', 'abd')).toBe(false);
      });

      it('should return false for different strings of different length', () => {
        expect(timingSafeEqual('abc', 'abcd')).toBe(false);
      });
    });

    describe('Uint8Array comparison', () => {
      it('should return true for equal arrays', () => {
        const a = new Uint8Array([1, 2, 3]);
        const b = new Uint8Array([1, 2, 3]);
        expect(timingSafeEqual(a, b)).toBe(true);
      });

      it('should return false for different arrays of same length', () => {
        const a = new Uint8Array([1, 2, 3]);
        const b = new Uint8Array([1, 2, 4]);
        expect(timingSafeEqual(a, b)).toBe(false);
      });

      it('should return false for different arrays of different length', () => {
        const a = new Uint8Array([1, 2, 3]);
        const b = new Uint8Array([1, 2, 3, 4]);
        expect(timingSafeEqual(a, b)).toBe(false);
      });
    });

    it('should return false when comparing different types', () => {
      // @ts-expect-error - intentional type mismatch
      expect(timingSafeEqual('abc', new Uint8Array([97, 98, 99]))).toBe(false);
    });
  });
});
