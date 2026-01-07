import { clarifierAgent } from '@/lib/agents/clarifier';
import { validateIdea, validateIdeaId } from '@/lib/validation';
import { ValidationError } from '@/lib/errors';
import { withApiHandler, successResponse, ApiContext } from '@/lib/api-handler';

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
  } else {
    finalIdeaId = `idea_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  const session = await clarifierAgent.startClarification(
    finalIdeaId,
    validatedIdea
  );

  return successResponse(
    {
      questions: session.questions,
      ideaId: session.ideaId,
      status: session.status,
      confidence: session.confidence,
      requestId: context.requestId,
    },
    200,
    context.rateLimit
  );
}

export const POST = withApiHandler(handlePost, { rateLimit: 'moderate' });
