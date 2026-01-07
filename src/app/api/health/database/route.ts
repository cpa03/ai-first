import { dbService } from '@/lib/db';
import { successResponse, ApiContext, withApiHandler } from '@/lib/api-handler';

async function handleGet(context: ApiContext) {
  const { rateLimit } = context;
  const healthCheck = await dbService.healthCheck();

  const response = {
    ...healthCheck,
    service: 'database',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    requestId: context.requestId,
  };

  return successResponse(response, 200, rateLimit);
}

export const GET = withApiHandler(handleGet, { validateSize: false });
