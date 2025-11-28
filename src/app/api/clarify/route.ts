import { NextRequest } from 'next/server';
import { clarifierAgent } from '@/lib/clarifier';
import { dbService } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { idea, ideaId } = await request.json();

    if (!idea) {
      return new Response(JSON.stringify({ error: 'Idea is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate clarifying questions using the clarifier agent
    const response = await clarifierAgent.generateClarifyingQuestions(idea);

    // If ideaId is provided, store the questions in the session
    if (ideaId) {
      const sessionData = {
        idea_id: ideaId,
        state: {
          questions: response.questions,
          status: 'clarifying',
        },
        last_agent: 'clarifier',
        metadata: {
          agent: 'clarifier',
          timestamp: new Date().toISOString(),
          question_count: response.questions.length,
        },
      };

      await dbService.upsertIdeaSession(sessionData);
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
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
