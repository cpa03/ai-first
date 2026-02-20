import { withApiHandler, ApiContext } from '@/lib/api-handler';
import { AppError, ErrorCode } from '@/lib/errors';
import { STATUS_CODES } from '@/lib/config';
import { createLogger } from '@/lib/logger';
import { register } from '@/lib/metrics';

const logger = createLogger('MetricsAPI');

async function handleGet(context: ApiContext) {
  const metrics = await register.metrics();

  logger.debug('Metrics requested', {
    requestId: context.requestId,
    contentType: register.contentType,
  });

  if (!metrics) {
    throw new AppError(
      'Failed to generate metrics',
      ErrorCode.INTERNAL_ERROR,
      STATUS_CODES.INTERNAL_ERROR,
      undefined,
      false
    );
  }

  return new Response(metrics, {
    status: STATUS_CODES.OK,
    headers: {
      'Content-Type': register.contentType,
      'X-Request-ID': context.requestId,
      'X-RateLimit-Limit': String(context.rateLimit.limit),
      'X-RateLimit-Remaining': String(context.rateLimit.remaining),
      'X-RateLimit-Reset': String(
        new Date(context.rateLimit.reset).toISOString()
      ),
    },
  });
}

export const GET = withApiHandler(handleGet, {
  validateSize: false,
  rateLimit: 'strict',
});
