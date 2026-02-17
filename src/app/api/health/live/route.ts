import {
  standardSuccessResponse,
  ApiContext,
  withApiHandler,
} from '@/lib/api-handler';

/**
 * Liveness probe endpoint for container orchestration (Kubernetes, Docker)
 *
 * Purpose: Should the container be restarted?
 * Returns: 200 OK if the application process is running
 *
 * This is a simple check that the Node.js process is alive.
 * If this endpoint fails, the orchestrator will restart the container.
 */
async function handleGet(context: ApiContext) {
  const { rateLimit: _rateLimit } = context;

  const response = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'liveness',
    environment: process.env.NODE_ENV || 'development',
  };

  return standardSuccessResponse(response, context.requestId, 200, _rateLimit);
}

export const GET = withApiHandler(handleGet, {
  validateSize: false,
  rateLimit: 'strict',
});
