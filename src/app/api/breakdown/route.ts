import { breakdownEngine } from '@/lib/agents/breakdown-engine';
import {
  validateIdea,
  validateIdeaId,
  validateUserResponses,
} from '@/lib/validation';
import { ValidationError, ErrorCode, AppError } from '@/lib/errors';
import { withApiHandler, successResponse, ApiContext } from '@/lib/api-handler';

async function handlePost(context: ApiContext) {
  const { request } = context;
  const { ideaId, refinedIdea, userResponses, options } = await request.json();

  const idValidation = validateIdeaId(ideaId);
  if (!idValidation.valid) {
    throw new ValidationError(idValidation.errors);
  }

  const ideaValidation = validateIdea(refinedIdea);
  if (!ideaValidation.valid) {
    throw new ValidationError(ideaValidation.errors);
  }

  const responsesValidation = validateUserResponses(userResponses);
  if (!responsesValidation.valid) {
    throw new ValidationError(responsesValidation.errors);
  }

  await breakdownEngine.initialize();

  const session = await breakdownEngine.startBreakdown(
    ideaId.trim(),
    refinedIdea.trim(),
    userResponses || {},
    options || {}
  );

  return successResponse(
    {
      success: true,
      session,
      requestId: context.requestId,
    },
    200,
    context.rateLimit
  );
}

async function handleGet(context: ApiContext) {
  const { searchParams } = new URL(context.request.url);
  const ideaId = searchParams.get('ideaId');

  if (!ideaId) {
    throw new ValidationError([
      { field: 'ideaId', message: 'ideaId parameter is required' },
    ]);
  }

  const idValidation = validateIdeaId(ideaId);
  if (!idValidation.valid) {
    throw new ValidationError(idValidation.errors);
  }

  const session = await breakdownEngine.getBreakdownSession(ideaId.trim());

  if (!session) {
    throw new AppError(
      'No breakdown session found for this idea',
      ErrorCode.NOT_FOUND,
      404
    );
  }

  return successResponse(
    {
      success: true,
      session,
      requestId: context.requestId,
    },
    200,
    context.rateLimit
  );
}

export const POST = withApiHandler(handlePost, { rateLimit: 'moderate' });
export const GET = withApiHandler(handleGet, { rateLimit: 'lenient' });
