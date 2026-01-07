import { clarifierAgent } from '@/lib/agents/clarifier';
import { validateIdeaId } from '@/lib/validation';
import { ValidationError } from '@/lib/errors';
import { withApiHandler, successResponse, ApiContext } from '@/lib/api-handler';

async function handlePost(context: ApiContext) {
  const { request, rateLimit } = context;
  const { ideaId } = await request.json();

  const idValidation = validateIdeaId(ideaId);
  if (!idValidation.valid) {
    throw new ValidationError(idValidation.errors);
  }

  const result = await clarifierAgent.completeClarification(ideaId.trim());

  return successResponse(
    {
      success: true,
      ...result,
      requestId: context.requestId,
    },
    200,
    rateLimit
  );
}

export const POST = withApiHandler(handlePost);
