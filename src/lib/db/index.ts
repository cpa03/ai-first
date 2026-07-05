/**
 * Database module exports
 *
 * IMPORTANT SECURITY NOTE:
 * ========================
 * This module exports both client-safe and server-only functions.
 *
 * CLIENT-SAFE EXPORTS (safe to use in 'use client' components):
 * - supabaseClient: Uses anon key with RLS enforcement
 * - Type exports: Idea, Task, Deliverable, etc.
 *
 * SERVER-ONLY EXPORTS (MUST NOT be used in client components):
 * - getSupabaseAdmin: Uses service role key, bypasses RLS
 * - DatabaseService: Contains admin client access
 * - dbService: Singleton instance of DatabaseService
 *
 * If you need admin operations in client components, create an API route
 * and call it via fetch() instead.
 *
 * @module lib/db
 */

// Main service exports
export {
  supabaseClient,
  getSupabaseAdmin,
  DatabaseService,
  dbService,
} from './service';

// Server-only exports (separate module for clarity)
export { getServerAdminClient, isServerContext } from './server';

// Re-export sub-services for direct access
export { IdeaService } from './ideas';
export { DeliverableService } from './deliverables';
export { TaskService } from './tasks';
export { VectorService } from './vectors';
export { ClarificationService } from './clarification';

// Re-export types (safe for client use)
export * from './types';

// Re-export ClientProvider interface for custom implementations
export type { ClientProvider } from './ideas';
