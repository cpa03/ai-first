import { NextRequest, NextResponse } from 'next/server';
import { clarifierAgent } from '@/lib/agents/clarifier';

export async function POST(request: NextRequest) {
  try {
    const { ideaId, ideaText } = await request.json();

    if (!ideaId || !ideaText) {
      return NextResponse.json(
        { error: 'ideaId and ideaText are required' },
        { status: 400 }
      );
    }

    // Initialize clarifier agent
    await clarifierAgent.initialize();

    // Start clarification session
    const session = await clarifierAgent.startClarification(ideaId, ideaText);

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error('Error starting clarification:', error);
    return NextResponse.json(
      {
        error: 'Failed to start clarification',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ideaId = searchParams.get('ideaId');

    if (!ideaId) {
      return NextResponse.json(
        { error: 'ideaId is required' },
        { status: 400 }
      );
    }

    // Get clarification session
    const session = await clarifierAgent.getSession(ideaId);

    if (!session) {
      return NextResponse.json(
        { error: 'Clarification session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error('Error getting clarification session:', error);
    return NextResponse.json(
      {
        error: 'Failed to get clarification session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
