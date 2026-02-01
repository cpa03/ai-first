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
  const ideaId = url.pathname.split('/').slice(0, -1).at(-1);

  const idValidation = validateIdeaId(ideaId || '');
  if (!idValidation.valid) {
    throw new ValidationError(idValidation.errors);
  }

  const session = await dbService.getIdeaSession(ideaId!);

  return standardSuccessResponse(session, context.requestId);
}

export const GET = withApiHandler(handleGet, { rateLimit: 'moderate' });
