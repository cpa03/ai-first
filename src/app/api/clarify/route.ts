import { NextRequest } from 'next/server';
import { clarifierAgent } from '@/lib/agents/clarifier';
import {
  validateIdea,
  validateIdeaId,
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

    const { idea, ideaId } = await request.json();

    const ideaValidation = validateIdea(idea);
    if (!ideaValidation.valid) {
      return buildErrorResponse(ideaValidation.errors);
    }

    const validatedIdea = idea.trim();

    let finalIdeaId = ideaId;

    if (finalIdeaId) {
      const idValidation = validateIdeaId(finalIdeaId);
      if (!idValidation.valid) {
        return buildErrorResponse(idValidation.errors);
      }
      finalIdeaId = finalIdeaId.trim();
    } else {
      finalIdeaId = `idea_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }

    const session = await clarifierAgent.startClarification(
      finalIdeaId,
      validatedIdea
    );

    return new Response(
      JSON.stringify({
        questions: session.questions,
        ideaId: session.ideaId,
        status: session.status,
        confidence: session.confidence,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in clarify API:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to generate clarifying questions',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
