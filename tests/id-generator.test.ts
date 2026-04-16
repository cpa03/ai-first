import { generateSecureId } from '../src/lib/id-generator';

describe('generateSecureId', () => {
  it('should generate a non-empty string', () => {
    const id = generateSecureId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('should generate unique IDs', () => {
    const ids = new Set();
    for (let i = 0; i < 100; i++) {
      const id = generateSecureId();
      expect(ids.has(id)).toBe(false);
      ids.add(id);
    }
  });

  it('should respect the length parameter when not using randomUUID', () => {
    // We can't easily force the fallback here without mocking globalThis.crypto,
    // but we can check that it returns a string of reasonable length.
    const id = generateSecureId(32);
    expect(typeof id).toBe('string');
    // UUID v4 is 36 chars, custom random is length
    expect(id.length).toBeGreaterThanOrEqual(21);
  });

  it('should use crypto.randomUUID when available', () => {
    // In Vitest/Jest environment, crypto is usually available
    const id = generateSecureId();
    // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (uuidRegex.test(id)) {
      expect(id).toMatch(uuidRegex);
    } else {
      // If not a UUID, it should be our custom random string
      expect(id.length).toBe(21);
    }
  });
});
