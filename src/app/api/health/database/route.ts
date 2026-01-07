import { dbService } from '@/lib/db';
import {
  standardSuccessResponse,
  ApiContext,
  withApiHandler,
} from '@/lib/api-handler';

async function handleGet(context: ApiContext) {
  const healthCheck = await dbService.healthCheck();

  const response = {
    ...healthCheck,
    service: 'database',
    environment: process.env.NODE_ENV || 'development',
  };

  return standardSuccessResponse(response, context.requestId);
}

export const GET = withApiHandler(handleGet, { validateSize: false });
