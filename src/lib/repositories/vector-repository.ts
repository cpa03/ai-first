import { BaseRepository } from './base-repository';
import { SupabaseClient } from '@supabase/supabase-js';

export interface Vector {
  id: string;
  idea_id: string;
  vector_data: Record<string, unknown>;
  reference_type: string;
  reference_id?: string;
  created_at: string;
}

export class VectorRepository extends BaseRepository {
  constructor(client: SupabaseClient | null, admin: SupabaseClient | null) {
    super(client, admin);
  }

  async storeVector(
    vector: Omit<Vector, 'id' | 'created_at'>
  ): Promise<Vector> {
    this.checkClient();

    const { data, error } = await this.client!.from('vectors')
      .insert(vector)
      .select()
      .single();

    if (error) {
      this.handleError(error, 'storeVector');
    }

    return data;
  }

  async getVectors(ideaId: string, referenceType?: string): Promise<Vector[]> {
    this.checkClient();

    let query = this.client!.from('vectors').select('*').eq('idea_id', ideaId);

    if (referenceType) {
      query = query.eq('reference_type', referenceType);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      this.handleError(error, 'getVectors');
    }

    return data || [];
  }

  async deleteVector(id: string): Promise<void> {
    this.checkClient();

    const { error } = await this.client!.from('vectors').delete().eq('id', id);

    if (error) {
      this.handleError(error, 'deleteVector');
    }
  }
}
