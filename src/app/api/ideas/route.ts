import { dbService } from '@/lib/db';
import { validateIdea } from '@/lib/validation';
import { ValidationError } from '@/lib/errors';
import {
  withApiHandler,
  standardSuccessResponse,
  ApiContext,
} from '@/lib/api-handler';
import { VALIDATION_CONFIG } from '@/lib/config/constants';

async function handleGet(context: ApiContext) {
  const { request, rateLimit } = context;
  const url = new URL(request.url);

  const status = url.searchParams.get('status');
  const limit = parseInt(
    url.searchParams.get('limit') ||
      String(VALIDATION_CONFIG.DEFAULT_PAGINATION_LIMIT),
    10
  );
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);

  const userId = 'default_user';

  let ideas = await dbService.getUserIdeas(userId);

  if (status && status !== 'all') {
    ideas = ideas.filter((idea) => idea.status === status);
  }

  ideas = ideas.filter((idea) => !idea.deleted_at);

  ideas.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const total = ideas.length;
  const paginatedIdeas = ideas.slice(offset, offset + limit);

  const formattedIdeas = paginatedIdeas.map((idea) => ({
    id: idea.id,
    title: idea.title,
    status: idea.status,
    createdAt: idea.created_at,
    updatedAt: idea.updated_at,
  }));

  return standardSuccessResponse(
    {
      ideas: formattedIdeas,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    },
    context.requestId,
    200,
    rateLimit
  );
}

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

export const GET = withApiHandler(handleGet, { rateLimit: 'lenient' });
export const POST = withApiHandler(handlePost, { rateLimit: 'moderate' });
