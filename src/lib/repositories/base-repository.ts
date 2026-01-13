import { SupabaseClient } from '@supabase/supabase-js';

export abstract class BaseRepository {
  protected client: SupabaseClient | null;
  protected admin: SupabaseClient | null;

  constructor(client: SupabaseClient | null, admin: SupabaseClient | null) {
    this.client = client;
    this.admin = admin;
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
    console.error(`Error in ${operation}`, { error });
    throw error;
  }
}
