import { NextRequest } from 'next/server';
import { breakdownEngine } from '@/lib/agents/breakdown-engine';

export async function POST(request: NextRequest) {
  try {
    const { ideaId, refinedIdea, userResponses, options } =
      await request.json();

    if (!ideaId || !refinedIdea) {
      return new Response(
        JSON.stringify({ error: 'ideaId and refinedIdea are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize breakdown engine
    await breakdownEngine.initialize();

    // Start the breakdown process
    const session = await breakdownEngine.startBreakdown(
      ideaId,
      refinedIdea,
      userResponses || {},
      options || {}
    );

    return new Response(JSON.stringify({ session }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in breakdown API:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to start breakdown process',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ideaId = searchParams.get('ideaId');

    if (!ideaId) {
      return new Response(
        JSON.stringify({ error: 'ideaId parameter is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get existing breakdown session
    const session = await breakdownEngine.getBreakdownSession(ideaId);

    if (!session) {
      return new Response(
        JSON.stringify({ error: 'No breakdown session found for this idea' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify({ session }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error getting breakdown session:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to retrieve breakdown session',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
