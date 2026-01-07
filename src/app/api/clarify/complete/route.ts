import { NextRequest, NextResponse } from 'next/server';
import { clarifierAgent } from '@/lib/agents/clarifier';

export async function POST(request: NextRequest) {
  try {
    const { ideaId } = await request.json();

    if (!ideaId) {
      return NextResponse.json(
        { error: 'ideaId is required' },
        { status: 400 }
      );
    }

    // Complete clarification and generate refined idea
    const result = await clarifierAgent.completeClarification(ideaId);

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
