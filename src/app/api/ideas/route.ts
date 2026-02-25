import { dbService } from '@/lib/db';
import { validateIdea } from '@/lib/validation';
import { ValidationError } from '@/lib/errors';
import {
  withApiHandler,
  standardSuccessResponse,
  ApiContext,
} from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { APP_CONFIG, STATUS_CODES } from '@/lib/config';

/**
 * GET /api/ideas
 *
 * Retrieves paginated ideas for the authenticated user.
 * Uses database-level pagination and filtering for optimal performance.
 *
 * Query Parameters:
 * - status: Filter by status ('draft', 'clarified', 'breakdown', 'completed', 'all')
 * - limit: Number of items per page (default: from APP_CONFIG)
 * - page: Page number (1-indexed, default: 1)
 *
 * PERFORMANCE: This endpoint now uses database-level pagination instead of
 * in-memory filtering, reducing memory usage and improving response times
 * for users with many ideas.
 */
async function handleGet(context: ApiContext) {
  const { request, rateLimit } = context;
  const url = new URL(request.url);

  const status = url.searchParams.get('status');
  const limitRaw = url.searchParams.get('limit');
  const pageRaw = url.searchParams.get('page');

  // Validate pagination parameters to prevent DoS attacks
  // Validate limit
  let limit: number;
  if (limitRaw !== null) {
    limit = parseInt(limitRaw, 10);
    if (isNaN(limit) || !isFinite(limit)) {
      throw new ValidationError([
        { field: 'limit', message: `Invalid limit parameter: '${limitRaw}' is not a valid number` },
      ]);
    }
    if (limit < APP_CONFIG.PAGINATION.MIN_LIMIT) {
      throw new ValidationError([
        { field: 'limit', message: `Limit must be at least ${APP_CONFIG.PAGINATION.MIN_LIMIT}` },
      ]);
    }
    if (limit > APP_CONFIG.PAGINATION.MAX_LIMIT) {
      throw new ValidationError([
        { field: 'limit', message: `Limit cannot exceed ${APP_CONFIG.PAGINATION.MAX_LIMIT}` },
      ]);
    }
  } else {
    limit = APP_CONFIG.PAGINATION.DEFAULT_LIMIT;
  }

  // Validate page
  let page: number;
  if (pageRaw !== null) {
    page = parseInt(pageRaw, 10);
    if (isNaN(page) || !isFinite(page)) {
      throw new ValidationError([
        { field: 'page', message: `Invalid page parameter: '${pageRaw}' is not a valid number` },
      ]);
    }
    if (page < 1) {
      throw new ValidationError([
        { field: 'page', message: 'Page must be at least 1' },
      ]);
    }
  } else {
    page = 1;
  }

  // Authenticate user
  const user = await requireAuth(request);
  const userId = user.id;

  // Use database-level pagination and filtering for better performance
  // This avoids fetching all ideas and filtering in-memory
  const result = await dbService.getUserIdeasPaginated(
    userId,
    { page, pageSize: limit },
    {
      status: status as
        | 'draft'
        | 'clarified'
        | 'breakdown'
        | 'completed'
        | 'all'
        | undefined,
    }
  );

  const formattedIdeas = result.data.map((idea) => ({
    id: idea.id,
    title: idea.title,
    status: idea.status,
    createdAt: idea.created_at,
    updatedAt: idea.updated_at,
  }));

  return standardSuccessResponse(
    {
      ideas: formattedIdeas,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.pageSize,
        hasMore: result.hasMore,
      },
    },
    context.requestId,
    STATUS_CODES.OK,
    rateLimit
  );
}

/**
 * POST /api/ideas
 *
 * Creates a new idea for the authenticated user.
 */
async function handlePost(context: ApiContext) {
  const { request } = context;
  const { idea } = await request.json();

  // Authenticate user
  const user = await requireAuth(request);
  const userId = user.id;

  const ideaValidation = validateIdea(idea);
  if (!ideaValidation.valid) {
    throw new ValidationError(ideaValidation.errors);
  }

  const validatedIdea = idea.trim();

  const newIdea = {
    user_id: userId,
    title:
      validatedIdea.substring(
        0,
        APP_CONFIG.STRING_LIMITS.TITLE_PREVIEW_LENGTH
      ) +
      (validatedIdea.length > APP_CONFIG.STRING_LIMITS.TITLE_PREVIEW_LENGTH
        ? '...'
        : ''),
    raw_text: validatedIdea,
    status: 'draft' as const,
    deleted_at: null,
  };

  const savedIdea = await dbService.createIdea(newIdea);

  return standardSuccessResponse(
    {
      id: savedIdea.id,
      title: savedIdea.title,
      status: savedIdea.status,
      createdAt: savedIdea.created_at,
    },
    context.requestId,
    STATUS_CODES.CREATED,
    context.rateLimit
  );
}

export const GET = withApiHandler(handleGet, { rateLimit: 'lenient' });
export const POST = withApiHandler(handlePost, { rateLimit: 'moderate' });
