import { clarifierAgent } from '@/lib/agents/clarifier';
import { validateIdeaId } from '@/lib/validation';
import { ValidationError, AppError, ErrorCode } from '@/lib/errors';
import {
  withApiHandler,
  standardSuccessResponse,
  ApiContext,
} from '@/lib/api-handler';
import { requireAuth, verifyResourceOwnership } from '@/lib/auth';
import { dbService } from '@/lib/db';
import { API_ERROR_MESSAGES } from '@/lib/config/error-messages';
import { STATUS_CODES } from '@/lib/config/constants';

async function handlePost(context: ApiContext) {
  const { request, rateLimit: _rateLimit } = context;
  const { ideaId } = await request.json();

  const idValidation = validateIdeaId(ideaId);
  if (!idValidation.valid) {
    throw new ValidationError(idValidation.errors);
  }

  // Authenticate user
  const user = await requireAuth(request);

  // Verify idea exists and user owns it
  const idea = await dbService.getIdea(ideaId.trim());
  if (!idea) {
    throw new AppError(
      API_ERROR_MESSAGES.NOT_FOUND.IDEA,
      ErrorCode.NOT_FOUND,
      STATUS_CODES.NOT_FOUND
    );
  }

  verifyResourceOwnership(user.id, idea.user_id, 'idea');

  const result = await clarifierAgent.completeClarification(ideaId.trim());

  return standardSuccessResponse(
    result,
    context.requestId,
    STATUS_CODES.OK,
    _rateLimit
  );
}

export const POST = withApiHandler(handlePost, { rateLimit: 'moderate' });
