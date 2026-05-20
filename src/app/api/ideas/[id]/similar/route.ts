import {
  withApiHandler,
  standardSuccessResponse,
  ApiContext,
} from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { findSimilarIdeas } from '@/lib/similarity-service';
import { ValidationError } from '@/lib/errors';
import { APP_CONFIG } from '@/lib/config/app';
import { SIMILARITY_CONFIG } from '@/lib/config/similarity-config';
import { STATUS_CODES } from '@/lib/config/http';

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
  const { request, rateLimit } = context;
  const url = new URL(request.url);

  const limit = parseInt(
    url.searchParams.get('limit') || String(SIMILARITY_CONFIG.DEFAULT_LIMIT),
    10
  );
  const threshold = parseFloat(
    url.searchParams.get('threshold') ||
      String(SIMILARITY_CONFIG.DEFAULT_THRESHOLD)
  );

  // Validate pagination parameters to prevent DoS attacks
  if (Number.isNaN(limit) || !Number.isFinite(limit)) {
    throw new ValidationError([
      {
        field: 'limit',
        message: 'Invalid limit parameter: must be a valid number',
      },
    ]);
  }
  if (limit < APP_CONFIG.PAGINATION.MIN_LIMIT) {
    throw new ValidationError([
      {
        field: 'limit',
        message: `Limit must be at least ${APP_CONFIG.PAGINATION.MIN_LIMIT}`,
      },
    ]);
  }
  if (limit > APP_CONFIG.PAGINATION.MAX_LIMIT) {
    throw new ValidationError([
      {
        field: 'limit',
        message: `Limit cannot exceed ${APP_CONFIG.PAGINATION.MAX_LIMIT}`,
      },
    ]);
  }

  // Validate threshold parameter
  if (Number.isNaN(threshold) || !Number.isFinite(threshold)) {
    throw new ValidationError([
      {
        field: 'threshold',
        message: 'Invalid threshold parameter: must be a valid number',
      },
    ]);
  }
  if (
    threshold < SIMILARITY_CONFIG.MIN_THRESHOLD ||
    threshold > SIMILARITY_CONFIG.MAX_THRESHOLD
  ) {
    throw new ValidationError([
      {
        field: 'threshold',
        message: `Threshold must be between ${SIMILARITY_CONFIG.MIN_THRESHOLD} and ${SIMILARITY_CONFIG.MAX_THRESHOLD}`,
      },
    ]);
  }

  // Extract idea ID from URL path: /api/ideas/[id]/similar
  const segments = url.pathname.split('/').filter(Boolean);
  const ideaId = segments.at(-2);

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
    STATUS_CODES.OK,
    rateLimit
  );
}

export const GET = withApiHandler(handleGet, { rateLimit: 'lenient' });
