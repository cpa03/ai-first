/**
 * Similarity Service
 *
 * Provides similarity search functionality using vector embeddings.
 * Leverages the existing match_vectors database function.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createLogger } from './logger';
import { SIMILARITY_CONFIG } from './config/similarity-config';
import {
  DB_TABLES,
  DB_RPC,
  DB_REFERENCE_TYPES,
  DB_COLUMNS,
} from './config/database-tables';
import { API_ERROR_MESSAGES } from './config';
import { DATABASE_ENV_KEYS } from './config/env-keys';

const logger = createLogger('SimilarityService');

let supabaseClient: SupabaseClient | null = null;

/**
 * Get or create Supabase client with service role key
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
 */
function getSupabaseClient(): SupabaseClient {
  // SECURITY: Runtime check to ensure we're on the server
  // This prevents accidental usage in client components
  if (typeof window !== 'undefined') {
    throw new Error(
      API_ERROR_MESSAGES.AI.SECURITY_SIMILARITY_BROWSER_VIOLATION
    );
  }

  if (!supabaseClient) {
    const supabaseUrl = process.env[DATABASE_ENV_KEYS.NEXT_PUBLIC_SUPABASE_URL];
    const serviceKey = process.env[DATABASE_ENV_KEYS.SUPABASE_SERVICE_ROLE_KEY];

    if (!supabaseUrl || !serviceKey) {
      throw new Error(API_ERROR_MESSAGES.DB.CONFIG_MISSING);
    }

    supabaseClient = createClient(supabaseUrl, serviceKey);
  }
  return supabaseClient;
}

export interface SimilarIdea {
  id: string;
  title: string;
  status: string;
  similarity: number;
  createdAt: string;
}

/**
 * Find similar ideas based on vector embeddings.
 * Uses the match_vectors database function for similarity search.
 *
 * @param ideaId - The ID of the idea to find similar ones for
 * @param userId - The ID of the user (for authorization)
 * @param limit - Maximum number of similar ideas to return (default: 5)
 * @param threshold - Minimum similarity threshold 0-1 (default: 0.7)
 * @returns Promise<SimilarIdea[]> Array of similar ideas with similarity scores
 */
export async function findSimilarIdeas(
  ideaId: string,
  userId: string,
  limit: number = SIMILARITY_CONFIG.DEFAULT_LIMIT,
  threshold: number = SIMILARITY_CONFIG.DEFAULT_THRESHOLD
): Promise<SimilarIdea[]> {
  const supabase = getSupabaseClient();

  // Get the embedding for this idea
  const { data: vectorData, error: vectorError } = await supabase
    .from(DB_TABLES.VECTORS)
    .select(DB_COLUMNS.EMBEDDING)
    .eq(DB_COLUMNS.IDEA_ID, ideaId)
    .eq(DB_COLUMNS.REFERENCE_TYPE, DB_REFERENCE_TYPES.IDEA)
    .single();

  if (vectorError || !vectorData?.embedding) {
    logger.debug('No embeddings found for idea', { ideaId });
    return [];
  }

  // Find similar ideas using the match_vectors function
  const { data: similarResults, error: matchError } = await supabase.rpc(
    DB_RPC.MATCH_VECTORS,
    {
      idea_id_filter: ideaId, // Exclude the current idea
      match_count: limit + 1,
      match_threshold: threshold,
      query_embedding: vectorData.embedding,
    }
  );

  if (matchError) {
    logger.error('Vector similarity search failed:', matchError);
    throw new Error(API_ERROR_MESSAGES.AI.FAILED_TO_FIND_SIMILAR_IDEAS);
  }

  // Filter out the current idea and get full details
  const filteredResults = (similarResults || [])
    .filter((r: { idea_id: string }) => r.idea_id !== ideaId)
    .slice(0, limit);

  // PERFORMANCE OPTIMIZATION (Issue #1928 - N+1 Query Resolution):
  // ===========================================================================
  // Resolve N+1 query pattern by fetching all idea details in a single bulk query
  // using .in() filter. This reduces database round-trips from 1+N to exactly 2.
  //
  // OLD (N+1): 1 query for similarity + N queries for idea details (O(N) queries)
  // NEW (Optimized): 1 query for similarity + 1 bulk query for details (O(1) queries)
  const ideaIds = filteredResults.map((r: { idea_id: string }) => r.idea_id);

  if (ideaIds.length === 0) return [];

  const { data: ideasData, error: ideasError } = await supabase
    .from(DB_TABLES.IDEAS)
    .select('*')
    .in(DB_COLUMNS.ID, ideaIds)
    .eq(DB_COLUMNS.USER_ID, userId)
    .is(DB_COLUMNS.DELETED_AT, null);

  if (ideasError) {
    logger.error('Failed to fetch similar ideas details:', ideasError);
    return [];
  }

  // PERFORMANCE: Map results back to maintain original similarity sorting from RPC
  const ideasMap = new Map((ideasData || []).map((idea) => [idea.id, idea]));

  return filteredResults
    .map((result: { idea_id: string; similarity: number }) => {
      const idea = ideasMap.get(result.idea_id);
      if (!idea) return null;

      return {
        id: idea.id,
        title: idea.title,
        status: idea.status,
        similarity: result.similarity,
        createdAt: idea.created_at,
      };
    })
    .filter(Boolean) as SimilarIdea[];
}

/**
 * Store embedding for an idea in the vectors table
 *
 * @param ideaId - The ID of the idea
 * @param title - The title of the idea
 * @param text - The raw text of the idea
 * @param embeddingResult - The embedding result from generateEmbedding
 */
export async function storeIdeaEmbedding(
  ideaId: string,
  title: string,
  text: string,
  embeddingResult: { embedding: number[]; model: string; tokens: number }
): Promise<void> {
  const supabase = getSupabaseClient();

  await supabase.from(DB_TABLES.VECTORS).insert({
    idea_id: ideaId,
    reference_type: DB_REFERENCE_TYPES.IDEA,
    reference_id: ideaId,
    embedding: embeddingResult.embedding,
    vector_data: {
      title,
      text,
      model: embeddingResult.model,
      tokens: embeddingResult.tokens,
    },
  });

  logger.debug('Stored embedding for idea', { ideaId });
}
