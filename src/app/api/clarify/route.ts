import { clarifierAgent } from '@/lib/agents/clarifier';
import { validateIdea, validateIdeaId } from '@/lib/validation';
import { ValidationError } from '@/lib/errors';
import {
  withApiHandler,
  standardSuccessResponse,
  ApiContext,
} from '@/lib/api-handler';
import { requireAuth, verifyResourceOwnership } from '@/lib/auth';
import { dbService } from '@/lib/db';

async function handlePost(context: ApiContext) {
  const { request } = context;
  const { idea, ideaId } = await request.json();

  const ideaValidation = validateIdea(idea);
  if (!ideaValidation.valid) {
    throw new ValidationError(ideaValidation.errors);
  }

  const validatedIdea = idea.trim();

  let finalIdeaId = ideaId;

  if (finalIdeaId) {
    const idValidation = validateIdeaId(finalIdeaId);
    if (!idValidation.valid) {
      throw new ValidationError(idValidation.errors);
    }
    finalIdeaId = finalIdeaId.trim();

    // Authenticate user
    const user = await requireAuth(request);

    // Verify idea exists and user owns it
    const ideaRecord = await dbService.getIdea(finalIdeaId);
    if (ideaRecord) {
      verifyResourceOwnership(user.id, ideaRecord.user_id, 'idea');
    }
  } else {
    // Still require authentication even for new ideas
    await requireAuth(request);
    finalIdeaId = `idea_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  const session = await clarifierAgent.startClarification(
    finalIdeaId,
    validatedIdea
  );

  return standardSuccessResponse(
    {
      questions: session.questions,
      ideaId: session.ideaId,
      status: session.status,
      confidence: session.confidence,
    },
    context.requestId,
    200,
    context.rateLimit
  );
}

export const POST = withApiHandler(handlePost, { rateLimit: 'moderate' });
