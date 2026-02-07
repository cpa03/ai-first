import {
  withApiHandler,
  ApiContext,
  standardSuccessResponse,
} from '@/lib/api-handler';
import { ValidationError } from '@/lib/errors';
import { validateIdeaId } from '@/lib/validation';
import { dbService } from '@/lib/db';
import { requireAuth, verifyResourceOwnership } from '@/lib/auth';

async function handleGet(context: ApiContext) {
  const { request } = context;

  const url = new URL(request.url);
  const ideaId = url.pathname.split('/').at(-2);

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
  const ideaId = url.pathname.split('/').at(-2);

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
    updates.title = title.substring(0, 100);
  }

  if (status !== undefined) {
    const validStatuses = ['draft', 'clarified', 'breakdown', 'completed'];
    if (validStatuses.includes(status)) {
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
  const ideaId = url.pathname.split('/').at(-2);

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
