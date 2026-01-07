import { clarifierAgent } from '@/lib/agents/clarifier';
import { validateIdea, validateIdeaId } from '@/lib/validation';
import { ValidationError, AppError, ErrorCode } from '@/lib/errors';
import { withApiHandler, successResponse, ApiContext } from '@/lib/api-handler';

async function handlePost(context: ApiContext) {
  const { request } = context;
  const { ideaId, ideaText } = await request.json();

  const idValidation = validateIdeaId(ideaId);
  if (!idValidation.valid) {
    throw new ValidationError(idValidation.errors);
  }

  const ideaValidation = validateIdea(ideaText);
  if (!ideaValidation.valid) {
    throw new ValidationError(ideaValidation.errors);
  }

  await clarifierAgent.initialize();

  const session = await clarifierAgent.startClarification(
    ideaId.trim(),
    ideaText.trim()
  );

  return successResponse({
    success: true,
    session,
    requestId: context.requestId,
  });
}

async function handleGet(context: ApiContext) {
  const { searchParams } = new URL(context.request.url);
  const ideaId = searchParams.get('ideaId');

  if (!ideaId) {
    throw new ValidationError([
      { field: 'ideaId', message: 'ideaId is required' },
    ]);
  }

  const idValidation = validateIdeaId(ideaId);
  if (!idValidation.valid) {
    throw new ValidationError(idValidation.errors);
  }

  const session = await clarifierAgent.getSession(ideaId.trim());

  if (!session) {
    throw new AppError(
      'Clarification session not found',
      ErrorCode.NOT_FOUND,
      404
    );
  }

  return successResponse({
    success: true,
    session,
    requestId: context.requestId,
  });
}

export const POST = withApiHandler(handlePost);
export const GET = withApiHandler(handleGet);
