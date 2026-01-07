import { NextRequest } from 'next/server';
import { breakdownEngine } from '@/lib/agents/breakdown-engine';
import {
  validateIdea,
  validateIdeaId,
  validateUserResponses,
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
  ErrorCode,
  AppError,
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

    const { ideaId, refinedIdea, userResponses, options } =
      await request.json();

    const idValidation = validateIdeaId(ideaId);
    if (!idValidation.valid) {
      throw new ValidationError(idValidation.errors);
    }

    const ideaValidation = validateIdea(refinedIdea);
    if (!ideaValidation.valid) {
      throw new ValidationError(ideaValidation.errors);
    }

    const responsesValidation = validateUserResponses(userResponses);
    if (!responsesValidation.valid) {
      throw new ValidationError(responsesValidation.errors);
    }

    await breakdownEngine.initialize();

    const session = await breakdownEngine.startBreakdown(
      ideaId.trim(),
      refinedIdea.trim(),
      userResponses || {},
      options || {}
    );

    return new Response(
      JSON.stringify({
        success: true,
        session,
        requestId,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
      }
    );
  } catch (error) {
    return toErrorResponse(error, requestId);
  }
}

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();

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
      throw new ValidationError([
        { field: 'ideaId', message: 'ideaId parameter is required' },
      ]);
    }

    const idValidation = validateIdeaId(ideaId);
    if (!idValidation.valid) {
      throw new ValidationError(idValidation.errors);
    }

    const session = await breakdownEngine.getBreakdownSession(ideaId.trim());

    if (!session) {
      const error = new AppError(
        'No breakdown session found for this idea',
        ErrorCode.NOT_FOUND,
        404
      );
      return toErrorResponse(error, requestId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        session,
        requestId,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
      }
    );
  } catch (error) {
    return toErrorResponse(error, requestId);
  }
}
