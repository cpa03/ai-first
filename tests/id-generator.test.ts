import { generateSecureId } from '../src/lib/id-generator';

describe('generateSecureId', () => {
  it('generates a valid UUID v4 by default', () => {
    const id = generateSecureId();
    // UUID v4 regex
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(id).toMatch(uuidRegex);
  });

  it('applies the specified prefix', () => {
    const prefix = 'test_';
    const id = generateSecureId(prefix);
    expect(id.startsWith(prefix)).toBe(true);

    const uuidPart = id.substring(prefix.length);
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(uuidPart).toMatch(uuidRegex);
  });

  it('generates unique IDs', () => {
    const ids = new Set();
    for (let i = 0; i < 100; i++) {
      const id = generateSecureId();
      expect(ids.has(id)).toBe(false);
      ids.add(id);
    }
    expect(ids.size).toBe(100);
  });

  it('works when crypto.randomUUID is missing', () => {
    const originalRandomUUID = crypto.randomUUID;
    // @ts-expect-error - explicitly testing fallback
    delete crypto.randomUUID;

    try {
      const id = generateSecureId();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(id).toMatch(uuidRegex);
    } finally {
      crypto.randomUUID = originalRandomUUID;
    }
  });

  it('works when both randomUUID and getRandomValues are missing', () => {
    const originalRandomUUID = crypto.randomUUID;
    const originalGetRandomValues = crypto.getRandomValues;

    // @ts-expect-error: explicitly testing fallback
    delete crypto.randomUUID;
    // @ts-expect-error: explicitly testing fallback
    delete crypto.getRandomValues;

    try {
      const id = generateSecureId('prefix_');
      expect(id.startsWith('prefix_')).toBe(true);
      // When both are missing, it uses generateFallbackUuid which uses Math.random()
      // resulting in a UUID-formatted string.
      const uuidPart = id.substring('prefix_'.length);
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuidPart).toMatch(uuidRegex);
    } finally {
      crypto.randomUUID = originalRandomUUID;
      crypto.getRandomValues = originalGetRandomValues;
    }
  });

  it('uses emergency fallback when an error occurs during generation', () => {
    const originalRandomUUID = crypto.randomUUID;
    // Force an error by making it something that's not a function but passes the type check if not careful
    // or just mocking it to throw
    try {
      // Use any to bypass readonly check in a way that doesn't trigger @ts-ignore/expect-error lint rules inconsistently
      (crypto as any).randomUUID = () => {
        throw new Error('Unexpected error');
      };
    } catch (_e) {
      // In some environments, assigning to a readonly property might throw immediately.
      // If it does, we can't test the fallback this way, so we skip.
      return;
    }

    try {
      const id = generateSecureId('prefix_');
      expect(id.startsWith('prefix_')).toBe(true);
      expect(id).toContain('fallback_');
    } finally {
      crypto.randomUUID = originalRandomUUID;
    }
  });
});
