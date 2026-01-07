import { NextRequest, NextResponse } from 'next/server';
import { clarifierAgent } from '@/lib/agents/clarifier';
import { validateIdeaId, validateRequestSize } from '@/lib/validation';
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

    const { ideaId } = await request.json();

    const idValidation = validateIdeaId(ideaId);
    if (!idValidation.valid) {
      throw new ValidationError(idValidation.errors);
    }

    const result = await clarifierAgent.completeClarification(ideaId.trim());

    return NextResponse.json(
      { success: true, ...result, requestId },
      {
        headers: { 'X-Request-ID': requestId },
      }
    );
  } catch (error) {
    return toErrorResponse(error, requestId);
  }
}
