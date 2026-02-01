import {
  withApiHandler,
  ApiContext,
  standardSuccessResponse,
} from '@/lib/api-handler';
import {
  ValidationError,
  AppError,
  ErrorCode,
  ErrorDetail,
} from '@/lib/errors';
import { validateIdeaId } from '@/lib/validation';
import { repositories } from '@/lib/repositories';
import { dbService, Idea } from '@/lib/db';

async function handleGet(context: ApiContext) {
  const { request } = context;

  const url = new URL(request.url);
  const ideaId = url.pathname.split('/').at(-2);

  const idValidation = validateIdeaId(ideaId || '');
  if (!idValidation.valid) {
    throw new ValidationError(idValidation.errors);
  }

  const idea = await repositories.idea.getIdea(ideaId!);

  if (!idea) {
    return standardSuccessResponse(null, context.requestId, 404);
  }

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

  const body = await request.json();
  const { title, status } = body;

  const existingIdea = await repositories.idea.getIdea(ideaId!);
  if (!existingIdea) {
    throw new AppError(
      'Idea not found',
      ErrorCode.NOT_FOUND,
      404,
      undefined,
      false
    );
  }

  const updates: Partial<Idea> = {};
  if (title !== undefined) updates.title = title;
  if (status !== undefined) {
    const validStatuses = ['draft', 'clarified', 'breakdown', 'completed'];
    if (!validStatuses.includes(status)) {
      const errorDetail: ErrorDetail = {
        field: 'status',
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        code: 'INVALID_STATUS',
      };
      throw new ValidationError([errorDetail]);
    }
    updates.status = status as Idea['status'];
  }

  if (Object.keys(updates).length === 0) {
    const errorDetail: ErrorDetail = {
      message: 'No fields provided for update',
      code: 'NO_UPDATES',
    };
    throw new ValidationError([errorDetail]);
  }

  const updatedIdea = await dbService.updateIdea(ideaId!, updates);

  return standardSuccessResponse(
    {
      id: updatedIdea.id,
      title: updatedIdea.title,
      status: updatedIdea.status,
      createdAt: updatedIdea.created_at,
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

  const existingIdea = await repositories.idea.getIdea(ideaId!);
  if (!existingIdea) {
    throw new AppError(
      'Idea not found',
      ErrorCode.NOT_FOUND,
      404,
      undefined,
      false
    );
  }

  await dbService.softDeleteIdea(ideaId!);

  return standardSuccessResponse(
    { message: 'Idea deleted successfully' },
    context.requestId,
    200
  );
}

export const GET = withApiHandler(handleGet, { rateLimit: 'moderate' });
export const PUT = withApiHandler(handlePut, { rateLimit: 'moderate' });
export const DELETE = withApiHandler(handleDelete, { rateLimit: 'moderate' });
