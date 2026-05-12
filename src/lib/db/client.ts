import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { redactPIIInObject } from '../pii-redaction';
import { createLogger } from '../logger';
import { resourceCleanupManager } from '../resource-cleanup';
import { AGENT_CONFIG, VALIDATION_LIMITS } from '../config/constants';

const logger = createLogger('DatabaseService');
const { DATABASE } = AGENT_CONFIG;

// Supabase client configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// SECURITY: Service role key is NEVER accessed at module level
// to prevent accidental bundling in client-side code.
// Use getSupabaseAdmin() function instead for server-side operations.

// Client for browser-side operations (with RLS)
export const supabaseClient =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : null;

// SECURITY: Lazy-loaded admin client to prevent client-side bundle exposure
// This ensures the service role key is only accessed in server-side contexts
let _supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Get the Supabase admin client (server-side only)
 *
 * ⚠️ CRITICAL SECURITY WARNING ⚠️
 * This function accesses the SUPABASE_SERVICE_ROLE_KEY which bypasses ALL Row Level Security (RLS) policies.
 * It MUST ONLY be called in server-side contexts (API routes, server components, server actions).
 *
 * NEVER call this function from:
 * - Client components (use 'use client' directive)
 * - Browser-side code
 * - Any code that may be bundled for the client
 *
 * The service role key grants FULL ADMIN ACCESS to the database. Exposing it to clients
 * would allow anyone to read/modify/delete any data, bypassing all security policies.
 *
 * @returns Supabase admin client or null if not in server context
 * @throws Error if called in browser context
 */
export function getSupabaseAdmin(): ReturnType<
  typeof createClient<Database>
> | null {
  // SECURITY: Runtime check to ensure we're on the server
  // This prevents accidental usage in client components
  if (typeof window !== 'undefined') {
    throw new Error(
      'CRITICAL SECURITY VIOLATION: getSupabaseAdmin() was called in browser context.\n' +
        'The Supabase service role key bypasses RLS and must NEVER be exposed to clients.\n' +
        'Use API routes for admin operations instead.'
    );
  }

  // Lazy initialization to prevent key from being accessed during module load
  // This ensures the key is only loaded when actually needed
  if (!_supabaseAdmin) {
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseServiceKey) {
      logger.warn(
        'SUPABASE_SERVICE_ROLE_KEY not configured - admin operations will fail'
      );
      return null;
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      logger.error('Supabase environment variables not configured');
      return null;
    }

    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'public',
      },
    });

    // Register cleanup to dispose admin client on shutdown
    resourceCleanupManager.register('supabase-admin-client', () => {
      logger.info('Disposing Supabase admin client');
      _supabaseAdmin = null;
    });
  }

  return _supabaseAdmin;
}

// SECURITY NOTE: The previous supabaseAdmin export has been REMOVED
// to prevent any risk of the service role key being bundled in client code.
// Always use getSupabaseAdmin() function instead.

export {
  redactPIIInObject,
  createLogger,
  resourceCleanupManager,
  AGENT_CONFIG,
  VALIDATION_LIMITS,
  logger,
  DATABASE,
};
