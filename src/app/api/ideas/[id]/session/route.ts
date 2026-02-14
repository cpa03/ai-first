import {
  withApiHandler,
  ApiContext,
  standardSuccessResponse,
} from '@/lib/api-handler';
import { ValidationError, AppError, ErrorCode } from '@/lib/errors';
import { validateIdeaId } from '@/lib/validation';
import { dbService } from '@/lib/db';
import { requireAuth, verifyResourceOwnership } from '@/lib/auth';

async function handleGet(context: ApiContext) {
  const { request } = context;

  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const ideaId = segments[2];

  const idValidation = validateIdeaId(ideaId || '');
  if (!idValidation.valid) {
    throw new ValidationError(idValidation.errors);
  }

  // Authenticate user
  const user = await requireAuth(request);

  // Verify idea exists and user owns it
  const idea = await dbService.getIdea(ideaId!);
  if (!idea) {
    throw new AppError('Idea not found', ErrorCode.NOT_FOUND, 404);
  }

  verifyResourceOwnership(user.id, idea.user_id, 'idea');

  const session = await dbService.getIdeaSession(ideaId!);

  return standardSuccessResponse(session, context.requestId);
}

export const GET = withApiHandler(handleGet, { rateLimit: 'moderate' });
