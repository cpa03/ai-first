import { cn } from '@/lib/utils';

describe('Utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      const result = cn('px-4', 'py-2', 'bg-blue-500');
      expect(result).toBe('px-4 py-2 bg-blue-500');
    });

    it('should handle conditional classes', () => {
      const result = cn(
        'base-class',
        true && 'conditional-class',
        false && 'hidden-class'
      );
      expect(result).toBe('base-class conditional-class');
    });

    it('should handle undefined and null values', () => {
      const result = cn('base-class', undefined, null, 'another-class');
      expect(result).toBe('base-class another-class');
    });

    it('should handle empty strings', () => {
      const result = cn('base-class', '', 'another-class');
      expect(result).toBe('base-class another-class');
    });

    it('should handle conflicting tailwind classes', () => {
      const result = cn('px-4', 'px-8');
      expect(result).toBe('px-8');
    });

    it('should handle arrays of classes', () => {
      const result = cn(['px-4', 'py-2'], 'bg-blue-500');
      expect(result).toBe('px-4 py-2 bg-blue-500');
    });

    it('should handle objects with boolean values', () => {
      const result = cn({
        'px-4': true,
        'py-2': true,
        hidden: false,
        'bg-blue-500': true,
      });
      expect(result).toBe('px-4 py-2 bg-blue-500');
    });
  });

  describe('generateSecureId', () => {
    const { generateSecureId } = require('@/lib/utils');

    it('should generate a string ID', () => {
      const id = generateSecureId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(10);
    });

    it('should generate unique IDs', () => {
      const id1 = generateSecureId();
      const id2 = generateSecureId();
      expect(id1).not.toBe(id2);
    });

    it('should generate valid UUIDs when crypto is available', () => {
      const id = generateSecureId();
      // Simple regex for UUID v4
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      // In Node.js environment, crypto.randomUUID should be available
      expect(id).toMatch(uuidRegex);
    });
  });
});
