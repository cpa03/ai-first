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
import { VALIDATION_LEGACY_CONFIG as VALIDATION_CONFIG, STATUS_CODES } from '@/lib/config/constants';
import { API_ERROR_MESSAGES } from '@/lib/config/error-messages';

async function handlePost(context: ApiContext) {
  const { request, rateLimit: _rateLimit } = context;
  const { ideaId, questionId, answer } = await request.json();

  const idValidation = validateIdeaId(ideaId);
  if (!idValidation.valid) {
    throw new ValidationError(idValidation.errors);
  }

  if (
    !questionId ||
    typeof questionId !== 'string' ||
    questionId.trim().length === 0
  ) {
    throw new ValidationError([
      {
        field: 'questionId',
        message: 'questionId is required and must be a non-empty string',
      },
    ]);
  }

  if (!answer || typeof answer !== 'string') {
    throw new ValidationError([
      { field: 'answer', message: 'answer is required and must be a string' },
    ]);
  }

  const trimmedAnswer = answer.trim();
  if (trimmedAnswer.length > VALIDATION_CONFIG.MAX_ANSWER_LENGTH) {
    throw new ValidationError([
      {
        field: 'answer',
        message: `answer must not exceed ${VALIDATION_CONFIG.MAX_ANSWER_LENGTH} characters`,
      },
    ]);
  }

  // Authenticate user
  const user = await requireAuth(request);

  // Verify idea exists and user owns it
  const idea = await dbService.getIdea(ideaId.trim());
  if (!idea) {
    throw new AppError(
      API_ERROR_MESSAGES.NOT_FOUND.IDEA,
      ErrorCode.NOT_FOUND,
      404
    );
  }

  verifyResourceOwnership(user.id, idea.user_id, 'idea');

  const session = await clarifierAgent.submitAnswer(
    ideaId.trim(),
    questionId.trim(),
    trimmedAnswer
  );

  return standardSuccessResponse(
    { session },
    context.requestId,
    STATUS_CODES.OK,
    _rateLimit
  );
}

export const POST = withApiHandler(handlePost, { rateLimit: 'moderate' });
