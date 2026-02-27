/**
 * Similarity Service
 *
 * Provides similarity search functionality using vector embeddings.
 * Leverages the existing match_vectors database function.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { dbService } from './db';
import { createLogger } from './logger';

const logger = createLogger('SimilarityService');

let supabaseClient: SupabaseClient | null = null;

/**
 * Get or create Supabase client with service role key
 */
function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      throw new Error('Supabase configuration missing');
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
  limit: number = 5,
  threshold: number = 0.7
): Promise<SimilarIdea[]> {
  const supabase = getSupabaseClient();

  // Get the embedding for this idea
  const { data: vectorData, error: vectorError } = await supabase
    .from('vectors')
    .select('embedding')
    .eq('idea_id', ideaId)
    .eq('reference_type', 'idea')
    .single();

  if (vectorError || !vectorData?.embedding) {
    logger.debug('No embeddings found for idea', { ideaId });
    return [];
  }

  // Find similar ideas using the match_vectors function
  const { data: similarResults, error: matchError } = await supabase.rpc(
    'match_vectors',
    {
      idea_id_filter: ideaId, // Exclude the current idea
      match_count: limit + 1,
      match_threshold: threshold,
      query_embedding: vectorData.embedding,
    }
  );

  if (matchError) {
    logger.error('Vector similarity search failed:', matchError);
    throw new Error('Failed to find similar ideas');
  }

  // Filter out the current idea and get full details
  const filteredResults = (similarResults || [])
    .filter((r: { idea_id: string }) => r.idea_id !== ideaId)
    .slice(0, limit);

  // Get full idea details for each similar idea
  const similarIdeas: SimilarIdea[] = await Promise.all(
    filteredResults.map(
      async (result: { idea_id: string; similarity: number }) => {
        try {
          const idea = await dbService.getIdea(result.idea_id);

          // Only include ideas belonging to the user and not deleted
          if (idea && idea.user_id === userId && !idea.deleted_at) {
            return {
              id: idea.id,
              title: idea.title,
              status: idea.status,
              similarity: result.similarity,
              createdAt: idea.created_at,
            };
          }
        } catch (error) {
          logger.warn('Failed to get idea details', {
            ideaId: result.idea_id,
            error,
          });
        }
        return null;
      }
    )
  );

  // Filter out nulls
  return similarIdeas.filter(Boolean) as SimilarIdea[];
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

  await supabase.from('vectors').insert({
    idea_id: ideaId,
    reference_type: 'idea',
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
