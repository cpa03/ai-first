import {
  withApiHandler,
  standardSuccessResponse,
  ApiContext,
} from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { findSimilarIdeas } from '@/lib/similarity-service';

/**
 * GET /api/ideas/[id]/similar
 *
 * Finds similar ideas based on vector embeddings.
 * Uses the match_vectors database function for similarity search.
 *
 * Query Parameters:
 * - limit: Maximum number of similar ideas to return (default: 5)
 * - threshold: Minimum similarity threshold (0-1, default: 0.7)
 */
async function handleGet(context: ApiContext) {
  const { request, rateLimit, params } = context;
  const url = new URL(request.url);

  const limit = parseInt(url.searchParams.get('limit') || '5', 10);
  const threshold = parseFloat(url.searchParams.get('threshold') || '0.7');

  const ideaId = params?.id;

  if (!ideaId) {
    throw new Error('Idea ID is required');
  }

  // Authenticate user
  const user = await requireAuth(request);
  const userId = user.id;

  // Find similar ideas
  const similarIdeas = await findSimilarIdeas(ideaId, userId, limit, threshold);

  return standardSuccessResponse(
    {
      similarIdeas,
      count: similarIdeas.length,
    },
    context.requestId,
    200,
    rateLimit
  );
}

export const GET = withApiHandler(handleGet, { rateLimit: 'lenient' });
