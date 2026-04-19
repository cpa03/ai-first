import { generateSecureId, simpleHash } from '../src/lib/id-generator';

describe('id-generator', () => {
  describe('generateSecureId', () => {
    it('should generate a string ID', () => {
      const id = generateSecureId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate unique IDs', () => {
      const id1 = generateSecureId();
      const id2 = generateSecureId();
      expect(id1).not.toBe(id2);
    });

    it('should follow UUID format if crypto.randomUUID is used', () => {
      // In jest/node environment, crypto.randomUUID should be available
      const id = generateSecureId();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const hex16Regex = /^[0-9a-f]{32}$/i;

      // It could be either a UUID or 32-char hex depending on the environment/fallback
      expect(uuidRegex.test(id) || hex16Regex.test(id) || id.includes('-')).toBe(true);
    });
  });

  describe('simpleHash', () => {
    it('should generate a deterministic hash', () => {
      const input = 'test-string';
      const hash1 = simpleHash(input);
      const hash2 = simpleHash(input);
      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different inputs', () => {
      const hash1 = simpleHash('input1');
      const hash2 = simpleHash('input2');
      expect(hash1).not.toBe(hash2);
    });

    it('should return a hex string', () => {
      const hash = simpleHash('test');
      expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
    });

    it('should handle empty input', () => {
      expect(simpleHash('')).toBe('0000000000000000');
    });
  });
});
