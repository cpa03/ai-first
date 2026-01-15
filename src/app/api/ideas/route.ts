import { dbService } from '@/lib/db';
import { validateIdea } from '@/lib/validation';
import { ValidationError } from '@/lib/errors';
import {
  withApiHandler,
  standardSuccessResponse,
  ApiContext,
} from '@/lib/api-handler';

async function handlePost(context: ApiContext) {
  const { request } = context;
  const { idea } = await request.json();

  const ideaValidation = validateIdea(idea);
  if (!ideaValidation.valid) {
    throw new ValidationError(ideaValidation.errors);
  }

  const validatedIdea = idea.trim();

  const newIdea = {
    user_id: 'default_user',
    title:
      validatedIdea.substring(0, 50) + (validatedIdea.length > 50 ? '...' : ''),
    raw_text: validatedIdea,
    status: 'draft' as const,
    deleted_at: null,
  };

  const savedIdea = await dbService.createIdea(newIdea);

  return standardSuccessResponse(
    {
      id: savedIdea.id,
      title: savedIdea.title,
      status: savedIdea.status,
      createdAt: savedIdea.created_at,
    },
    context.requestId,
    201
  );
}

export const POST = withApiHandler(handlePost, { rateLimit: 'moderate' });
