import {
  withApiHandler,
  ApiContext,
  standardSuccessResponse,
} from '@/lib/api-handler';
import { ValidationError, AppError, ErrorCode } from '@/lib/errors';
import { createLogger } from '@/lib/logger';
import { API_ERROR_MESSAGES } from '@/lib/config/error-messages';
import { validateIdeaId, sanitizeHtml } from '@/lib/validation';
import { dbService, Idea } from '@/lib/db';
import { requireAuth, verifyResourceOwnership, optionalAuth, isGuestRequest } from '@/lib/auth';
import { IDEA_CONFIG, IDEA_STATUS_CONFIG, STATUS_CODES } from '@/lib/config';
import { RESOURCE_TYPES } from '@/lib/config/modular-constants';

const logger = createLogger('IdeaByIdAPI');

// Type guard for valid idea status values
function isValidStatus(status: string): status is Idea['status'] {
  return IDEA_STATUS_CONFIG.ALL_STATUSES.includes(
    status as (typeof IDEA_STATUS_CONFIG.ALL_STATUSES)[number]
  );
}

async function handleGet(context: ApiContext) {
  const { request, params } = context;

  // PERFORMANCE: Use context.params.id for faster access
  // instead of manual URL parsing and segment extraction.
  const ideaId = params.id;

  const idValidation = validateIdeaId(ideaId || '');
  if (!idValidation.valid) {
    throw new ValidationError(idValidation.errors);
  }

  // Check if this is a guest request
  const guestMode = isGuestRequest(request);
  
  if (guestMode) {
    // For guest mode, allow access to any idea by ID (for preview)
    // In production, you might want to add additional validation
    const idea = await dbService.getIdea(ideaId!);

    if (!idea) {
      throw new AppError(
        API_ERROR_MESSAGES.NOT_FOUND.IDEA,
        ErrorCode.NOT_FOUND,
        STATUS_CODES.NOT_FOUND
      );
    }

    // Return idea without ownership verification for guest preview
    return standardSuccessResponse(
      { ...idea, isGuestPreview: true },
      context.requestId,
      STATUS_CODES.OK,
      context.rateLimit
    );
  }

  // Authenticate user
  const user = await requireAuth(request);

  const idea = await dbService.getIdea(ideaId!);

  if (!idea) {
    throw new AppError(
      API_ERROR_MESSAGES.NOT_FOUND.IDEA,
      ErrorCode.NOT_FOUND,
      STATUS_CODES.NOT_FOUND
    );
  }

  // Verify ownership
  verifyResourceOwnership(user.id, idea.user_id, RESOURCE_TYPES.IDEA);

  return standardSuccessResponse(
    idea,
    context.requestId,
    STATUS_CODES.OK,
    context.rateLimit
  );
}

async function handlePut(context: ApiContext) {
  const { request, params } = context;

  // PERFORMANCE: Use context.params.id for faster access
  // instead of manual URL parsing and segment extraction.
  const ideaId = params.id;

  const idValidation = validateIdeaId(ideaId || '');
  if (!idValidation.valid) {
    throw new ValidationError(idValidation.errors);
  }

  // Check if this is a guest request - guests cannot update ideas
  const guestMode = isGuestRequest(request);
  if (guestMode) {
    throw new AppError(
      'Guest users cannot update ideas. Please sign in to save changes.',
      ErrorCode.AUTHORIZATION_ERROR,
      STATUS_CODES.FORBIDDEN
    );
  }

  // Authenticate user
  const user = await requireAuth(request);
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch (parseError) {
    logger.warnWithContext(
      'Failed to parse JSON body for idea update',
      {
        requestId: context.requestId,
        component: 'IdeaByIdAPI',
        action: 'handlePut.parseBody',
      },
      parseError
    );
    throw new ValidationError([
      {
        field: 'body',
        message: API_ERROR_MESSAGES.ROUTE_VALIDATION.INVALID_JSON_BODY,
      },
    ]);
  }
  const { title, status } = body as { title?: unknown; status?: unknown };

  // Handle potential null/undefined values gracefully
  const safeTitle = title === null ? undefined : title;
  const safeStatus = status === null ? undefined : status;

  const existingIdea = await dbService.getIdea(ideaId!);
  if (!existingIdea) {
    throw new AppError(
      API_ERROR_MESSAGES.NOT_FOUND.IDEA,
      ErrorCode.NOT_FOUND,
      STATUS_CODES.NOT_FOUND
    );
  }

  // Verify ownership
  verifyResourceOwnership(user.id, existingIdea.user_id, RESOURCE_TYPES.IDEA);

  const updates: {
    title?: string;
    status?: 'draft' | 'clarified' | 'breakdown' | 'completed';
    updated_at?: string;
  } = {
    updated_at: new Date().toISOString(),
  };

  if (safeTitle !== undefined) {
    const titleStr =
      typeof safeTitle === 'string' ? safeTitle : String(safeTitle ?? '');
    updates.title = sanitizeHtml(titleStr).substring(
      0,
      IDEA_CONFIG.VALIDATION.MAX_TITLE_LENGTH
    );
  }

  if (safeStatus !== undefined && typeof safeStatus === 'string') {
    if (isValidStatus(safeStatus)) {
      updates.status = safeStatus;
    }
  }

  const updatedIdea = await dbService.updateIdea(ideaId!, updates);

  return standardSuccessResponse(
    {
      id: updatedIdea.id,
      title: updatedIdea.title,
      status: updatedIdea.status,
      createdAt: updatedIdea.created_at,
      updatedAt: updatedIdea.updated_at,
    },
    context.requestId,
    STATUS_CODES.OK,
    context.rateLimit
  );
}

async function handleDelete(context: ApiContext) {
  const { request, params } = context;

  // PERFORMANCE: Use context.params.id for faster access
  // instead of manual URL parsing and segment extraction.
  const ideaId = params.id;

  const idValidation = validateIdeaId(ideaId || '');
  if (!idValidation.valid) {
    throw new ValidationError(idValidation.errors);
  }

  // Check if this is a guest request - guests cannot delete ideas
  const guestMode = isGuestRequest(request);
  if (guestMode) {
    throw new AppError(
      'Guest users cannot delete ideas. Please sign in to manage your ideas.',
      ErrorCode.AUTHORIZATION_ERROR,
      STATUS_CODES.FORBIDDEN
    );
  }

  // Authenticate user
  const user = await requireAuth(request);

  const existingIdea = await dbService.getIdea(ideaId!);
  if (!existingIdea) {
    throw new AppError(
      API_ERROR_MESSAGES.NOT_FOUND.IDEA,
      ErrorCode.NOT_FOUND,
      STATUS_CODES.NOT_FOUND
    );
  }

  // Verify ownership
  verifyResourceOwnership(user.id, existingIdea.user_id, RESOURCE_TYPES.IDEA);

  await dbService.softDeleteIdea(ideaId!);

  return standardSuccessResponse(
    {
      message: API_ERROR_MESSAGES.ROUTE_SUCCESS.IDEA_DELETED,
      id: ideaId,
    },
    context.requestId,
    STATUS_CODES.OK,
    context.rateLimit
  );
}

export const GET = withApiHandler(handleGet, { rateLimit: 'moderate' });
export const PUT = withApiHandler(handlePut, { rateLimit: 'moderate' });
export const DELETE = withApiHandler(handleDelete, { rateLimit: 'moderate' });
