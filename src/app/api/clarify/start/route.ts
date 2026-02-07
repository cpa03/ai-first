import { clarifierAgent } from '@/lib/agents/clarifier';
import { validateIdea, validateIdeaId } from '@/lib/validation';
import { ValidationError, AppError, ErrorCode } from '@/lib/errors';
import {
  withApiHandler,
  standardSuccessResponse,
  ApiContext,
} from '@/lib/api-handler';
import { requireAuth, verifyResourceOwnership } from '@/lib/auth';
import { dbService } from '@/lib/db';

async function handlePost(context: ApiContext) {
  const { request, rateLimit: _rateLimit } = context;
  const { ideaId, ideaText } = await request.json();

  const idValidation = validateIdeaId(ideaId);
  if (!idValidation.valid) {
    throw new ValidationError(idValidation.errors);
  }

  const ideaValidation = validateIdea(ideaText);
  if (!ideaValidation.valid) {
    throw new ValidationError(ideaValidation.errors);
  }

  // Authenticate user
  const user = await requireAuth(request);

  // Verify idea exists and user owns it
  const idea = await dbService.getIdea(ideaId.trim());
  if (!idea) {
    throw new AppError('Idea not found', ErrorCode.NOT_FOUND, 404);
  }

  verifyResourceOwnership(user.id, idea.user_id, 'idea');

  await clarifierAgent.initialize();

  const session = await clarifierAgent.startClarification(
    ideaId.trim(),
    ideaText.trim()
  );

  return standardSuccessResponse(
    { session },
    context.requestId,
    200,
    _rateLimit
  );
}

async function handleGet(context: ApiContext) {
  const { request, rateLimit: _rateLimit } = context;
  const { searchParams } = new URL(request.url);
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

  // Authenticate user
  const user = await requireAuth(request);

  // Verify idea exists and user owns it
  const idea = await dbService.getIdea(ideaId.trim());
  if (!idea) {
    throw new AppError('Idea not found', ErrorCode.NOT_FOUND, 404);
  }

  verifyResourceOwnership(user.id, idea.user_id, 'idea');

  const session = await clarifierAgent.getSession(ideaId.trim());

  if (!session) {
    throw new AppError(
      'Clarification session not found',
      ErrorCode.NOT_FOUND,
      404
    );
  }

  return standardSuccessResponse(
    { session },
    context.requestId,
    200,
    _rateLimit
  );
}

export const POST = withApiHandler(handlePost, { rateLimit: 'moderate' });
export const GET = withApiHandler(handleGet, { rateLimit: 'moderate' });
