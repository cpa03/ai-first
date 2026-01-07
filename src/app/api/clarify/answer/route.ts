import { NextRequest, NextResponse } from 'next/server';
import { clarifierAgent } from '@/lib/agents/clarifier';
import {
  validateIdeaId,
  validateQuestionId,
  validateAnswer,
  validateRequestSize,
} from '@/lib/validation';
import {
  toErrorResponse,
  generateRequestId,
  ValidationError,
} from '@/lib/errors';

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const sizeValidation = validateRequestSize(request);
    if (!sizeValidation.valid) {
      throw new ValidationError(sizeValidation.errors);
    }

    const { ideaId, questionId, answer } = await request.json();

    const idValidation = validateIdeaId(ideaId);
    if (!idValidation.valid) {
      throw new ValidationError(idValidation.errors);
    }

    const questionIdValidation = validateQuestionId(questionId);
    if (!questionIdValidation.valid) {
      throw new ValidationError(questionIdValidation.errors);
    }

    const answerValidation = validateAnswer(answer);
    if (!answerValidation.valid) {
      throw new ValidationError(answerValidation.errors);
    }

    const session = await clarifierAgent.submitAnswer(
      ideaId.trim(),
      questionId.trim(),
      answer.trim()
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
