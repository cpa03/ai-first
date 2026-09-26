import { dbService } from '@/lib/db';
import { validateIdea, sanitizeHtml } from '@/lib/validation';
import { ValidationError, AppError, ErrorCode } from '@/lib/errors';
import {
  withApiHandler,
  standardSuccessResponse,
  ApiContext,
} from '@/lib/api-handler';
import { requireAuth, optionalAuth, isGuestRequest, getUserIdOrGuest } from '@/lib/auth';
import { APP_CONFIG } from '@/lib/config/app';
import { STATUS_CODES } from '@/lib/config/http';
import { IDEA_STATUS_CONFIG } from '@/lib/config';
import { API_ERROR_MESSAGES } from '@/lib/config/error-messages';
import { generateEmbedding } from '@/lib/embedding-service';
import { storeIdeaEmbedding } from '@/lib/similarity-service';
import { createLogger } from '@/lib/logger';

const logger = createLogger('IdeasAPI');

/**
 * GET /api/ideas
 *
 * Retrieves paginated ideas for the authenticated user.
 * Supports guest mode for anonymous users with a valid guest session.
 *
 * Query Parameters:
 * - status: Filter by status ('draft', 'clarified', 'breakdown', 'completed', 'all')
 * - search: Search term to filter ideas by title or content
 * - limit: Number of items per page (default: from APP_CONFIG)
 * - page: Page number (1-indexed, default: 1)
 *
 * PERFORMANCE: This endpoint now uses database-level pagination instead of
 * in-memory filtering, reducing memory usage and improving response times
 * for users with many ideas.
 */
async function handleGet(context: ApiContext) {
  const { request, rateLimit } = context;

  // PERFORMANCE: Use request.nextUrl.searchParams for faster access (~15-20x)
  // compared to new URL(request.url).
  const { searchParams } = request.nextUrl;

  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const limit = parseInt(
    searchParams.get('limit') || String(APP_CONFIG.PAGINATION.DEFAULT_LIMIT),
    10
  );
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Validate pagination parameters to prevent DoS attacks
  if (Number.isNaN(limit) || !Number.isFinite(limit)) {
    throw new ValidationError([
      {
        field: 'limit',
        message: API_ERROR_MESSAGES.ROUTE_VALIDATION.INVALID_LIMIT,
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
  if (Number.isNaN(page) || !Number.isFinite(page) || page < 1) {
    throw new ValidationError([
      {
        field: 'page',
        message: API_ERROR_MESSAGES.ROUTE_VALIDATION.PAGE_REQUIRED,
      },
    ]);
  }

  // Check if this is a guest request
  const guestMode = isGuestRequest(request);

  if (guestMode) {
    // For guest mode, return empty list (guests don't have persistent ideas list)
    // They access individual ideas via /api/ideas/[id]
    return standardSuccessResponse(
      {
        ideas: [],
        pagination: {
          total: 0,
          page: 1,
          limit,
          hasMore: false,
        },
      },
      context.requestId,
      STATUS_CODES.OK,
      rateLimit
    );
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
        'draft' | 'clarified' | 'breakdown' | 'completed' | 'all' | undefined,
      search: search || undefined,
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
 * Creates a new idea for the authenticated user or guest user.
 * Also generates and stores vector embedding for similarity search.
 * Supports guest mode via x-guest-mode header.
 */
async function handlePost(context: ApiContext) {
  const { request } = context;
  const { idea } = await request.json();

  // Check if this is a guest request
  const guestMode = isGuestRequest(request);
  const guestSessionId = request.headers.get('x-guest-session-id');

  let userId: string;

  if (guestMode && guestSessionId) {
    // Guest user - validate the untrusted session ID (UUIDv4, max-length);
    // malformed values are rejected with 401 instead of trusted verbatim.
    const bare = guestSessionId.startsWith('guest_')
      ? guestSessionId.slice('guest_'.length)
      : guestSessionId;
    const valid =
      guestSessionId.length > 0 &&
      guestSessionId.length <= 128 &&
      // eslint-disable-next-line no-control-regex
      !/[\x00-\x1f\x7f]/.test(guestSessionId) &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        bare
      );
    if (!valid) {
      throw new AppError(
        API_ERROR_MESSAGES.AUTH.UNAUTHORIZED_TOKEN,
        ErrorCode.AUTHENTICATION_ERROR,
        STATUS_CODES.UNAUTHORIZED
      );
    }
    userId = `guest_${bare}`;
  } else {
    // Authenticated user
    const user = await requireAuth(request);
    userId = user.id;
  }

  const ideaValidation = validateIdea(idea);
  if (!ideaValidation.valid) {
    throw new ValidationError(ideaValidation.errors);
  }

  const validatedIdea = idea.trim();
  // Sanitization must occur BEFORE truncation to ensure tag-matching regexes work correctly
  const sanitizedIdea = sanitizeHtml(validatedIdea);

  const newIdea = {
    user_id: userId,
    title:
      sanitizedIdea.substring(
        0,
        APP_CONFIG.STRING_LIMITS.TITLE_PREVIEW_LENGTH
      ) +
      (sanitizedIdea.length > APP_CONFIG.STRING_LIMITS.TITLE_PREVIEW_LENGTH
        ? '...'
        : ''),
    raw_text: sanitizedIdea,
    status: IDEA_STATUS_CONFIG.TYPES.DRAFT,
    deleted_at: null,
  };

  const savedIdea = await dbService.createIdea(newIdea);

  // Generate and store embedding for similarity search (non-blocking)
  generateEmbedding(validatedIdea)
    .then((embeddingResult) =>
      storeIdeaEmbedding(
        savedIdea.id,
        savedIdea.title,
        validatedIdea,
        embeddingResult
      )
    )
    .catch((error) => {
      logger.error('Failed to generate embedding for idea', {
        ideaId: savedIdea.id,
        error: error instanceof Error ? error.message : String(error),
      });
    });

  return standardSuccessResponse(
    {
      id: savedIdea.id,
      title: savedIdea.title,
      status: savedIdea.status,
      createdAt: savedIdea.created_at,
      isGuest: guestMode,
    },
    context.requestId,
    STATUS_CODES.CREATED,
    context.rateLimit
  );
}

export const GET = withApiHandler(handleGet, { rateLimit: 'lenient' });
export const POST = withApiHandler(handlePost, { rateLimit: 'moderate' });
