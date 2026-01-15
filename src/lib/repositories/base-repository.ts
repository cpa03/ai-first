import { SupabaseClient } from '@supabase/supabase-js';
import { createLogger } from '@/lib/logger';

const logger = createLogger('BaseRepository');

export abstract class BaseRepository {
  protected client: SupabaseClient | null;
  protected admin: SupabaseClient | null;

  constructor(client: SupabaseClient | null, admin: SupabaseClient | null) {
    this.client = client;
    this.admin = admin;
  }

  protected requireClient(): SupabaseClient {
    if (!this.client) {
      throw new Error('Supabase client not initialized');
    }
    return this.client;
  }

  protected requireAdmin(): SupabaseClient {
    if (!this.admin) {
      throw new Error('Supabase admin client not initialized');
    }
    return this.admin;
  }

  protected checkClient(): void {
    if (!this.client) {
      throw new Error('Supabase client not initialized');
    }
  }

  protected checkAdmin(): void {
    if (!this.admin) {
      throw new Error('Supabase admin client not initialized');
    }
  }

  protected handleError(error: unknown, operation: string): never {
    logger.error(`Error in ${operation}`, { error });
    throw error;
  }
}
