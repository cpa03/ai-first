import { dbService } from '@/lib/db';
import { successResponse, ApiContext, withApiHandler } from '@/lib/api-handler';

async function handleGet(context: ApiContext) {
  const healthCheck = await dbService.healthCheck();

  const healthData = {
    ...healthCheck,
    service: 'database',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  };

  return successResponse({
    success: true,
    data: healthData,
    requestId: context.requestId,
  });
}

export const GET = withApiHandler(handleGet, { validateSize: false });
