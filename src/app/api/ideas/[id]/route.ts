import {
  withApiHandler,
  ApiContext,
  standardSuccessResponse,
} from '@/lib/api-handler';
import { ValidationError } from '@/lib/errors';
import { validateIdeaId, sanitizeHtml } from '@/lib/validation';
import { dbService, Idea } from '@/lib/db';
import { requireAuth, verifyResourceOwnership } from '@/lib/auth';

// Type guard for valid idea status values
function isValidStatus(status: string): status is Idea['status'] {
  return ['draft', 'clarified', 'breakdown', 'completed'].includes(status);
}

async function handleGet(context: ApiContext) {
  const { request } = context;

  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const ideaId = segments.at(-1);

  const idValidation = validateIdeaId(ideaId || '');
  if (!idValidation.valid) {
    throw new ValidationError(idValidation.errors);
  }

  // Authenticate user
  const user = await requireAuth(request);

  const idea = await dbService.getIdea(ideaId!);

  if (!idea) {
    return standardSuccessResponse(null, context.requestId, 404);
  }

  // Verify ownership
  verifyResourceOwnership(user.id, idea.user_id, 'idea');

  return standardSuccessResponse(idea, context.requestId);
}

async function handlePut(context: ApiContext) {
  const { request } = context;

  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const ideaId = segments.at(-1);

  const idValidation = validateIdeaId(ideaId || '');
  if (!idValidation.valid) {
    throw new ValidationError(idValidation.errors);
  }

  // Authenticate user
  const user = await requireAuth(request);

  const body = await request.json();
  const { title, status } = body;

  const existingIdea = await dbService.getIdea(ideaId!);
  if (!existingIdea) {
    return standardSuccessResponse(null, context.requestId, 404);
  }

  // Verify ownership
  verifyResourceOwnership(user.id, existingIdea.user_id, 'idea');

  const updates: {
    title?: string;
    status?: 'draft' | 'clarified' | 'breakdown' | 'completed';
    updated_at?: string;
  } = {
    updated_at: new Date().toISOString(),
  };

  if (title !== undefined) {
    updates.title = sanitizeHtml(title).substring(0, 100);
  }

  if (status !== undefined && typeof status === 'string') {
    if (isValidStatus(status)) {
      updates.status = status;
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
    context.requestId
  );
}

async function handleDelete(context: ApiContext) {
  const { request } = context;

  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const ideaId = segments.at(-1);

  const idValidation = validateIdeaId(ideaId || '');
  if (!idValidation.valid) {
    throw new ValidationError(idValidation.errors);
  }

  // Authenticate user
  const user = await requireAuth(request);

  const existingIdea = await dbService.getIdea(ideaId!);
  if (!existingIdea) {
    return standardSuccessResponse(null, context.requestId, 404);
  }

  // Verify ownership
  verifyResourceOwnership(user.id, existingIdea.user_id, 'idea');

  await dbService.softDeleteIdea(ideaId!);

  return standardSuccessResponse(
    {
      message: 'Idea deleted successfully',
      id: ideaId,
    },
    context.requestId
  );
}

export const GET = withApiHandler(handleGet, { rateLimit: 'moderate' });
export const PUT = withApiHandler(handlePut, { rateLimit: 'moderate' });
export const DELETE = withApiHandler(handleDelete, { rateLimit: 'moderate' });
