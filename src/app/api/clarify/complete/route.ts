import { clarifierAgent } from '@/lib/agents/clarifier';
import { validateIdeaId } from '@/lib/validation';
import { ValidationError } from '@/lib/errors';
import {
  withApiHandler,
  standardSuccessResponse,
  ApiContext,
} from '@/lib/api-handler';

async function handlePost(context: ApiContext) {
  const { request } = context;
  const { ideaId } = await request.json();

  const idValidation = validateIdeaId(ideaId);
  if (!idValidation.valid) {
    throw new ValidationError(idValidation.errors);
  }

  const result = await clarifierAgent.completeClarification(ideaId.trim());

  return standardSuccessResponse(result, context.requestId);
}

export const POST = withApiHandler(handlePost);
