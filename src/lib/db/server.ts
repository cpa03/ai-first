/**
 * Server-only database operations
 *
 * This module exports functions that MUST ONLY be used in server-side contexts.
 * These functions access the Supabase service role key which bypasses ALL
 * Row Level Security (RLS) policies.
 *
 * ⚠️ CRITICAL SECURITY WARNING ⚠️
 * NEVER import this module in client components ('use client').
 * NEVER use these functions in browser-side code.
 *
 * The service role key grants FULL ADMIN ACCESS to the database. Exposing it
 * to clients would allow anyone to read/modify/delete any data, bypassing
 * all security policies.
 *
 * @module lib/db/server
 */

import { getSupabaseAdmin } from './service';

/**
 * Get the Supabase admin client for server-side operations only
 *
 * This is a convenience wrapper around getSupabaseAdmin() that
 * provides additional documentation and type safety for server-only usage.
 *
 * @returns Supabase admin client
 * @throws Error if called in browser context
 */
export function getServerAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error(
      'SECURITY VIOLATION: getServerAdminClient() was called in browser context.\n' +
        'This function accesses the Supabase service role key which bypasses RLS.\n' +
        'Use API routes for admin operations instead.'
    );
  }

  const client = getSupabaseAdmin();
  if (!client) {
    throw new Error(
      'Supabase admin client not initialized. Check environment variables.'
    );
  }

  return client;
}

/**
 * Check if we're in a server-side context
 * Useful for conditional server-only operations
 */
export function isServerContext(): boolean {
  return typeof window === 'undefined';
}
