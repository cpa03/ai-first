import { NextRequest, NextResponse } from 'next/server';
import { clarifierAgent } from '@/lib/agents/clarifier';
import {
  validateIdeaId,
  validateRequestSize,
  buildErrorResponse,
} from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const sizeValidation = validateRequestSize(request);
    if (!sizeValidation.valid) {
      return buildErrorResponse(sizeValidation.errors);
    }

    const { ideaId } = await request.json();

    const idValidation = validateIdeaId(ideaId);
    if (!idValidation.valid) {
      return buildErrorResponse(idValidation.errors);
    }

    const result = await clarifierAgent.completeClarification(ideaId.trim());

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error completing clarification:', error);
    return NextResponse.json(
      {
        error: 'Failed to complete clarification',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
