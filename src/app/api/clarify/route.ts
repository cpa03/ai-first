import { NextRequest } from 'next/server';
import { clarifierAgent } from '@/lib/agents/clarifier';

export async function POST(request: NextRequest) {
  try {
    const { idea, ideaId } = await request.json();

    if (!idea) {
      return new Response(JSON.stringify({ error: 'Idea is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate ideaId if not provided
    const finalIdeaId =
      ideaId || `idea_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Start clarification session using the clarifier agent
    const session = await clarifierAgent.startClarification(finalIdeaId, idea);

    return new Response(
      JSON.stringify({
        questions: session.questions,
        ideaId: session.ideaId,
        status: session.status,
        confidence: session.confidence,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in clarify API:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to generate clarifying questions',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
