/**
 * Client module - re-exports from service.ts for backward compatibility
 *
 * This file is maintained for backward compatibility with existing imports.
 * All client functionality is now in service.ts which implements the ClientProvider interface.
 */

export { supabaseClient, getSupabaseAdmin } from './service';
