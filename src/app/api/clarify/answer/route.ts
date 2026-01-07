import { NextRequest, NextResponse } from 'next/server';
import { clarifierAgent } from '@/lib/agents/clarifier';

export async function POST(request: NextRequest) {
  try {
    const { ideaId, questionId, answer } = await request.json();

    if (!ideaId || !questionId || !answer) {
      return NextResponse.json(
        { error: 'ideaId, questionId, and answer are required' },
        { status: 400 }
      );
    }

    // Submit answer
    const session = await clarifierAgent.submitAnswer(
      ideaId,
      questionId,
      answer
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
