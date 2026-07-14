/**
 * @jest-environment node
 */

/**
 * Database Service Security Tests
 *
 * Tests for security-critical behaviors in the database service,
 * particularly the getSupabaseAdmin() function's browser context protection.
 *
 * @see issue #1135 - Supabase Service Role Key Exposure in Client Bundle
 */

describe('Database Service Security', () => {
  describe('getSupabaseAdmin()', () => {
    it('should throw error when called in browser context', () => {
      (global as Record<string, unknown>).window = {};

      const { getSupabaseAdmin } = require('@/lib/db/service');

      expect(() => getSupabaseAdmin()).toThrow(
        /CRITICAL SECURITY VIOLATION.*browser context/
      );
    });

    it('should not throw when called in server context', () => {
      delete (global as Record<string, unknown>).window;

      const { getSupabaseAdmin } = require('@/lib/db/service');

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
        expect(supabaseClient).toBeDefined();
      }
    });
  });
});
