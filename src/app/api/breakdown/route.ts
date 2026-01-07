import { NextRequest } from 'next/server';
import { breakdownEngine } from '@/lib/agents/breakdown-engine';
import {
  validateIdea,
  validateIdeaId,
  validateUserResponses,
  validateRequestSize,
  buildErrorResponse,
} from '@/lib/validation';
import {
  checkRateLimit,
  rateLimitConfigs,
  rateLimitResponse,
} from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = checkRateLimit(
      request.headers.get('x-forwarded-for') || 'unknown',
      rateLimitConfigs.moderate
    );

    if (!rateLimitResult.allowed) {
      return rateLimitResponse(rateLimitResult.resetTime);
    }

    const sizeValidation = validateRequestSize(request);
    if (!sizeValidation.valid) {
      return buildErrorResponse(sizeValidation.errors);
    }

    const { ideaId, refinedIdea, userResponses, options } =
      await request.json();

    const idValidation = validateIdeaId(ideaId);
    if (!idValidation.valid) {
      return buildErrorResponse(idValidation.errors);
    }

    const ideaValidation = validateIdea(refinedIdea);
    if (!ideaValidation.valid) {
      return buildErrorResponse(ideaValidation.errors);
    }

    const responsesValidation = validateUserResponses(userResponses);
    if (!responsesValidation.valid) {
      return buildErrorResponse(responsesValidation.errors);
    }

    await breakdownEngine.initialize();

    const session = await breakdownEngine.startBreakdown(
      ideaId.trim(),
      refinedIdea.trim(),
      userResponses || {},
      options || {}
    );

    return new Response(JSON.stringify({ session }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in breakdown API:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to start breakdown process',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const rateLimitResult = checkRateLimit(
      request.headers.get('x-forwarded-for') || 'unknown',
      rateLimitConfigs.lenient
    );

    if (!rateLimitResult.allowed) {
      return rateLimitResponse(rateLimitResult.resetTime);
    }

    const { searchParams } = new URL(request.url);
    const ideaId = searchParams.get('ideaId');

    if (!ideaId) {
      return buildErrorResponse([
        { field: 'ideaId', message: 'ideaId parameter is required' },
      ]);
    }

    const idValidation = validateIdeaId(ideaId);
    if (!idValidation.valid) {
      return buildErrorResponse(idValidation.errors);
    }

    const session = await breakdownEngine.getBreakdownSession(ideaId.trim());

    if (!session) {
      return new Response(
        JSON.stringify({ error: 'No breakdown session found for this idea' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify({ session }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error getting breakdown session:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to retrieve breakdown session',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
