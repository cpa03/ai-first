import {
  withApiHandler,
  ApiContext,
  standardSuccessResponse,
} from '@/lib/api-handler';
import { ValidationError } from '@/lib/errors';
import { validateIdeaId } from '@/lib/validation';
import { dbService } from '@/lib/db';

async function handleGet(context: ApiContext) {
  const { request } = context;

  const url = new URL(request.url);
  const ideaId = url.pathname.split('/').at(-2);

  const idValidation = validateIdeaId(ideaId || '');
  if (!idValidation.valid) {
    throw new ValidationError(idValidation.errors);
  }

  const idea = await dbService.getIdea(ideaId!);

  if (!idea) {
    return standardSuccessResponse(null, context.requestId, 404);
  }

  return standardSuccessResponse(idea, context.requestId);
}

export const GET = withApiHandler(handleGet, { rateLimit: 'moderate' });
