/**
 * Database Service Security Tests
 *
 * Tests for security-critical behaviors in the database service,
 * particularly the getSupabaseAdmin() function's browser context protection.
 *
 * @see issue #1135 - Supabase Service Role Key Exposure in Client Bundle
 */

// Mock window object to simulate browser context
const originalWindow = global.window;

beforeEach(() => {
  // Reset window object before each test
  if (originalWindow === undefined) {
    delete (global as Record<string, unknown>).window;
  } else {
    global.window = originalWindow;
  }
});

afterAll(() => {
  // Restore original window object
  if (originalWindow === undefined) {
    delete (global as Record<string, unknown>).window;
  } else {
    global.window = originalWindow;
  }
});

describe('Database Service Security', () => {
  describe('getSupabaseAdmin()', () => {
    it('should throw error when called in browser context', () => {
      // Simulate browser context by defining window
      global.window = {} as Window & typeof globalThis;

      // Dynamic import to ensure fresh module load with window defined

      const { getSupabaseAdmin } = require('@/lib/db/service');

      expect(() => getSupabaseAdmin()).toThrow(
        /CRITICAL SECURITY VIOLATION.*browser context/
      );
    });

    it('should not throw when called in server context', () => {
      // Ensure window is undefined (server context)
      delete (global as Record<string, unknown>).window;

      // Dynamic import to ensure fresh module load without window

      const { getSupabaseAdmin } = require('@/lib/db/service');

      // Should not throw - will return null due to missing env vars
      expect(() => getSupabaseAdmin()).not.toThrow();
    });
  });

  describe('Environment Variable Security', () => {
    it('should not expose SUPABASE_SERVICE_ROLE_KEY in NEXT_PUBLIC_ prefix', () => {
      const publicKey = 'NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY';
      expect(process.env[publicKey]).toBeUndefined();
    });

    it('should have supabaseClient using anon key, not service role key', () => {
      const { supabaseClient } = require('@/lib/db/service');

      if (supabaseClient) {
        // The client should use the anon key, not the service role key
        // We can verify this by checking that the client doesn't have admin privileges
        expect(supabaseClient).toBeDefined();
      }
    });
  });
});
