import { dbService } from '@/lib/db';
import {
  standardSuccessResponse,
  ApiContext,
  withApiHandler,
} from '@/lib/api-handler';

async function handleGet(context: ApiContext) {
  const { rateLimit: _rateLimit } = context;
  const healthCheck = await dbService.healthCheck();

  const response = {
    ...healthCheck,
    service: 'database',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  };

  return standardSuccessResponse(response, context.requestId, 200, _rateLimit);
}

export const GET = withApiHandler(handleGet, {
  validateSize: false,
  rateLimit: 'strict',
});
