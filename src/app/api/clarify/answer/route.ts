import { clarifierAgent } from '@/lib/agents/clarifier';
import { validateIdeaId } from '@/lib/validation';
import { ValidationError } from '@/lib/errors';
import { withApiHandler, successResponse, ApiContext } from '@/lib/api-handler';

const MAX_ANSWER_LENGTH = 5000;

async function handlePost(context: ApiContext) {
  const { request } = context;
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
  if (trimmedAnswer.length > MAX_ANSWER_LENGTH) {
    throw new ValidationError([
      {
        field: 'answer',
        message: `answer must not exceed ${MAX_ANSWER_LENGTH} characters`,
      },
    ]);
  }

  const session = await clarifierAgent.submitAnswer(
    ideaId.trim(),
    questionId.trim(),
    trimmedAnswer
  );

  return successResponse({
    success: true,
    session,
    requestId: context.requestId,
  });
}

export const POST = withApiHandler(handlePost);
