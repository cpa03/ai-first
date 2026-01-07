import { NextRequest, NextResponse } from 'next/server';
import { clarifierAgent } from '@/lib/agents/clarifier';
import {
  validateIdeaId,
  validateRequestSize,
  buildErrorResponse,
} from '@/lib/validation';

const MAX_ANSWER_LENGTH = 5000;

export async function POST(request: NextRequest) {
  try {
    const sizeValidation = validateRequestSize(request);
    if (!sizeValidation.valid) {
      return buildErrorResponse(sizeValidation.errors);
    }

    const { ideaId, questionId, answer } = await request.json();

    const idValidation = validateIdeaId(ideaId);
    if (!idValidation.valid) {
      return buildErrorResponse(idValidation.errors);
    }

    if (
      !questionId ||
      typeof questionId !== 'string' ||
      questionId.trim().length === 0
    ) {
      return buildErrorResponse([
        {
          field: 'questionId',
          message: 'questionId is required and must be a non-empty string',
        },
      ]);
    }

    if (!answer || typeof answer !== 'string') {
      return buildErrorResponse([
        { field: 'answer', message: 'answer is required and must be a string' },
      ]);
    }

    const trimmedAnswer = answer.trim();
    if (trimmedAnswer.length > MAX_ANSWER_LENGTH) {
      return buildErrorResponse([
        {
          field: 'answer',
          message: `answer must not exceed ${MAX_ANSWER_LENGTH} characters`,
        },
      ]);
    }

    const session = await clarifierAgent.submitAnswer(
      ideaId.trim(),
      questionId.trim(),
      trimmedAnswer
    );

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json(
      {
        error: 'Failed to submit answer',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
