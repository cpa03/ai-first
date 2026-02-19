import {
  withApiHandler,
  ApiContext,
  standardSuccessResponse,
} from '@/lib/api-handler';
import { ValidationError, AppError, ErrorCode } from '@/lib/errors';
import { validateIdeaId } from '@/lib/validation';
import { dbService } from '@/lib/db';
import { requireAuth, verifyResourceOwnership } from '@/lib/auth';
import { API_ERROR_MESSAGES } from '@/lib/config/error-messages';
import { STATUS_CODES } from '@/lib/config/constants';

async function handleGet(context: ApiContext) {
  const { request } = context;

  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const ideaId = segments.at(-2);

  const idValidation = validateIdeaId(ideaId || '');
  if (!idValidation.valid) {
    throw new ValidationError(idValidation.errors);
  }

  // Authenticate user
  const user = await requireAuth(request);

  // Verify idea exists and user owns it
  const idea = await dbService.getIdea(ideaId!);
  if (!idea) {
    throw new AppError(
      API_ERROR_MESSAGES.NOT_FOUND.IDEA,
      ErrorCode.NOT_FOUND,
      STATUS_CODES.NOT_FOUND
    );
  }

  verifyResourceOwnership(user.id, idea.user_id, 'idea');

  const session = await dbService.getIdeaSession(ideaId!);

  return standardSuccessResponse(
    session,
    context.requestId,
    STATUS_CODES.OK,
    context.rateLimit
  );
}

export const GET = withApiHandler(handleGet, { rateLimit: 'moderate' });
