import { clarifierAgent } from '@/lib/agents/clarifier';
import { validateIdeaId } from '@/lib/validation';
import { ValidationError } from '@/lib/errors';
import {
  withApiHandler,
  standardSuccessResponse,
  ApiContext,
} from '@/lib/api-handler';
import { VALIDATION_CONFIG } from '@/lib/config/constants';

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

  const session = await clarifierAgent.submitAnswer(
    ideaId.trim(),
    questionId.trim(),
    trimmedAnswer
  );

  return standardSuccessResponse(
    { session },
    context.requestId,
    200,
    _rateLimit
  );
}

export const POST = withApiHandler(handlePost, { rateLimit: 'moderate' });
