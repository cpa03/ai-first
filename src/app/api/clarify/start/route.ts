import { NextRequest, NextResponse } from 'next/server';
import { clarifierAgent } from '@/lib/agents/clarifier';
import {
  validateIdea,
  validateIdeaId,
  validateRequestSize,
} from '@/lib/validation';
import {
  toErrorResponse,
  generateRequestId,
  ValidationError,
  AppError,
  ErrorCode,
} from '@/lib/errors';

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const sizeValidation = validateRequestSize(request);
    if (!sizeValidation.valid) {
      throw new ValidationError(sizeValidation.errors);
    }

    const { ideaId, ideaText } = await request.json();

    const idValidation = validateIdeaId(ideaId);
    if (!idValidation.valid) {
      throw new ValidationError(idValidation.errors);
    }

    const ideaValidation = validateIdea(ideaText);
    if (!ideaValidation.valid) {
      throw new ValidationError(ideaValidation.errors);
    }

    await clarifierAgent.initialize();

    const session = await clarifierAgent.startClarification(
      ideaId.trim(),
      ideaText.trim()
    );

    return NextResponse.json(
      { success: true, session, requestId },
      {
        headers: { 'X-Request-ID': requestId },
      }
    );
  } catch (error) {
    return toErrorResponse(error, requestId);
  }
}

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const { searchParams } = new URL(request.url);
    const ideaId = searchParams.get('ideaId');

    if (!ideaId) {
      throw new ValidationError([
        { field: 'ideaId', message: 'ideaId is required' },
      ]);
    }

    const idValidation = validateIdeaId(ideaId);
    if (!idValidation.valid) {
      throw new ValidationError(idValidation.errors);
    }

    const session = await clarifierAgent.getSession(ideaId.trim());

    if (!session) {
      const error = new AppError(
        'Clarification session not found',
        ErrorCode.NOT_FOUND,
        404
      );
      return toErrorResponse(error, requestId);
    }

    return NextResponse.json(
      { success: true, session, requestId },
      {
        headers: { 'X-Request-ID': requestId },
      }
    );
  } catch (error) {
    return toErrorResponse(error, requestId);
  }
}
