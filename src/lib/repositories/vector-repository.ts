import { BaseRepository } from './base-repository';
import { SupabaseClient } from '@supabase/supabase-js';

export interface Vector {
  id: string;
  idea_id: string;
  vector_data?: Record<string, unknown>;
  reference_type: string;
  reference_id?: string;
  created_at: string;
  embedding?: number[];
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

  async getVectorsBatch(
    ideaIds: string[],
    referenceType?: string
  ): Promise<Vector[]> {
    this.checkClient();

    let query = this.client!.from('vectors').select('*').in('idea_id', ideaIds);

    if (referenceType) {
      query = query.eq('reference_type', referenceType);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      this.handleError(error, 'getVectorsBatch');
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

  async getVectorsByIdeaIds(
    ideaIds: string[],
    referenceType?: string
  ): Promise<Map<string, Vector[]>> {
    this.checkClient();
    if (ideaIds.length === 0) return new Map();

    let query = this.client!.from('vectors').select('*').in('idea_id', ideaIds);

    if (referenceType) {
      query = query.eq('reference_type', referenceType);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      this.handleError(error, 'getVectorsByIdeaIds');
    }

    const vectors = data || [];
    const resultMap = new Map<string, Vector[]>();

    for (const vector of vectors) {
      const ideaId = vector.idea_id;
      if (!resultMap.has(ideaId)) {
        resultMap.set(ideaId, []);
      }
      resultMap.get(ideaId)!.push(vector);
    }

    return resultMap;
  }

  async storeEmbedding(
    ideaId: string,
    referenceType: string,
    embedding: number[],
    referenceId?: string,
    vectorData?: Record<string, unknown>
  ): Promise<Vector> {
    this.requireAdmin();

    const { data, error } = await this.requireAdmin()
      .from('vectors')
      .insert({
        idea_id: ideaId,
        embedding: `[${embedding.join(',')}]`,
        reference_type: referenceType,
        reference_id: referenceId,
        vector_data: vectorData,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async searchSimilarVectors(
    ideaId: string,
    queryEmbedding: number[],
    limit: number = 10
  ): Promise<Vector[]> {
    this.checkClient();

    const embeddingString = `[${queryEmbedding.join(',')}]`;

    const { data, error } = await this.client!.rpc('match_vectors', {
      query_embedding: embeddingString,
      match_threshold: 0.78,
      match_count: limit,
      idea_id_filter: ideaId,
    });

    if (error) {
      this.handleError(error, 'searchSimilarVectors');
    }

    return data || [];
  }
}
