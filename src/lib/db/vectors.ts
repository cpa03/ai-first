import { AGENT_CONFIG, VALIDATION_LIMITS } from '../config/constants';
import { API_ERROR_MESSAGES } from '../config/error-messages';
import { DB_TABLES, DB_RPC } from '../config/database-tables';
import type { ClientProvider } from './ideas';
import type { Vector, PaginationOptions, PaginatedResult } from './types';

const { DATABASE } = AGENT_CONFIG;

/**
 * VectorService handles all vector/embedding-related database operations
 * Extracted from DatabaseService for better modularity and testability
 */
export class VectorService {
  constructor(private readonly clientProvider: ClientProvider) {}

  /**
   * Store a vector record
   */
  async storeVector(
    vector: Omit<Vector, 'id' | 'created_at'>
  ): Promise<Vector> {
    const client = this.clientProvider.getClient();
    if (!client) throw new Error(API_ERROR_MESSAGES.DB.CLIENT_NOT_INITIALIZED);

    const { data, error } = await client
      .from(DB_TABLES.VECTORS)
      .insert(vector as never)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get all vectors for an idea, optionally filtered by reference type
   */
  async getVectors(ideaId: string, referenceType?: string): Promise<Vector[]> {
    const client = this.clientProvider.getClient();
    if (!client) throw new Error(API_ERROR_MESSAGES.DB.CLIENT_NOT_INITIALIZED);

    let query = client
      .from(DB_TABLES.VECTORS)
      .select('*')
      .eq('idea_id', ideaId);

    if (referenceType) {
      query = query.eq('reference_type', referenceType);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get paginated vectors for an idea
   */
  async getVectorsPaginated(
    ideaId: string,
    referenceType?: string,
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<Vector>> {
    const client = this.clientProvider.getClient();
    if (!client) throw new Error(API_ERROR_MESSAGES.DB.CLIENT_NOT_INITIALIZED);

    const page = Math.max(1, pagination.page || 1);
    const pageSize = Math.min(
      pagination.pageSize || VALIDATION_LIMITS.PAGINATION.DEFAULT_LIMIT,
      VALIDATION_LIMITS.PAGINATION.MAX_LIMIT
    );
    const offset = (page - 1) * pageSize;

    let countQuery = client
      .from(DB_TABLES.VECTORS)
      .select('*', { count: 'exact', head: true })
      .eq('idea_id', ideaId);

    if (referenceType) {
      countQuery = countQuery.eq('reference_type', referenceType);
    }

    const { count, error: countError } = await countQuery;

    if (countError) throw countError;

    let query = client
      .from(DB_TABLES.VECTORS)
      .select('*')
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (referenceType) {
      query = query.eq('reference_type', referenceType);
    }

    const { data, error } = await query;

    if (error) throw error;

    const total = count || 0;

    return {
      data: data || [],
      total,
      page,
      pageSize,
      hasMore: offset + (data?.length || 0) < total,
    };
  }

  /**
   * Get vectors for multiple ideas, grouped by idea ID
   */
  async getVectorsByIdeaIds(
    ideaIds: string[],
    referenceType?: string
  ): Promise<Map<string, Vector[]>> {
    const client = this.clientProvider.getClient();
    if (!client) throw new Error(API_ERROR_MESSAGES.DB.CLIENT_NOT_INITIALIZED);
    if (ideaIds.length === 0) return new Map();

    let query = client
      .from(DB_TABLES.VECTORS)
      .select('*')
      .in('idea_id', ideaIds);

    if (referenceType) {
      query = query.eq('reference_type', referenceType);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) throw error;

    const vectors = (data || []) as Vector[];
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

  /**
   * Delete a vector by ID
   */
  async deleteVector(id: string): Promise<void> {
    const client = this.clientProvider.getClient();
    if (!client) throw new Error(API_ERROR_MESSAGES.DB.CLIENT_NOT_INITIALIZED);

    const { error } = await client
      .from(DB_TABLES.VECTORS)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Store an embedding vector with metadata
   */
  async storeEmbedding(
    ideaId: string,
    referenceType: string,
    embedding: number[],
    referenceId?: string,
    vectorData?: Record<string, unknown>
  ): Promise<Vector> {
    const admin = this.clientProvider.getAdmin();
    if (!admin) throw new Error(API_ERROR_MESSAGES.DB.ADMIN_NOT_INITIALIZED);

    const { data, error } = await admin
      .from(DB_TABLES.VECTORS)
      .insert({
        idea_id: ideaId,
        embedding: `[${embedding.join(',')}]`,
        reference_type: referenceType,
        reference_id: referenceId,
        vector_data: vectorData,
      } as never)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Search for similar vectors using embedding similarity
   */
  async searchSimilarVectors(
    ideaId: string,
    queryEmbedding: number[],
    limit: number = DATABASE.DEFAULT_SEARCH_LIMIT
  ): Promise<Vector[]> {
    const client = this.clientProvider.getClient();
    if (!client) throw new Error(API_ERROR_MESSAGES.DB.CLIENT_NOT_INITIALIZED);

    const embeddingString = `[${queryEmbedding.join(',')}]`;

    const { data, error } = await client.rpc(DB_RPC.MATCH_VECTORS, {
      query_embedding: embeddingString,
      match_threshold: DATABASE.VECTOR_SIMILARITY_THRESHOLD,
      match_count: limit,
      idea_id_filter: ideaId,
    } as never);

    if (error) throw error;
    return data || [];
  }
}
