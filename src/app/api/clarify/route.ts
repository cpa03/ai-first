import { NextRequest, NextResponse } from 'next/server';
import { clarifierAgent } from '@/lib/agents/clarifier';
import {
  validateIdea,
  validateIdeaId,
  validateRequestSize,
} from '@/lib/validation';
import {
  checkRateLimit,
  rateLimitConfigs,
  rateLimitResponse,
} from '@/lib/rate-limit';
import {
  toErrorResponse,
  generateRequestId,
  ValidationError,
} from '@/lib/errors';

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

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
      throw new ValidationError(sizeValidation.errors);
    }

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

    return NextResponse.json(
      {
        questions: session.questions,
        ideaId: session.ideaId,
        status: session.status,
        confidence: session.confidence,
        requestId,
      },
      {
        headers: { 'X-Request-ID': requestId },
      }
    );
  } catch (error) {
    return toErrorResponse(error, requestId);
  }
}
