import { register } from '@/lib/metrics';
import { withApiHandler, ApiContext } from '@/lib/api-handler';
import { AppError, ErrorCode } from '@/lib/errors';
import { STATUS_CODES, HTTP_HEADERS } from '@/lib/config/http';
import { createLogger } from '@/lib/logger';
import { requireAdminAuth } from '@/lib/auth';
import { API_ERROR_MESSAGES } from '@/lib/config/error-messages';

const logger = createLogger('MetricsAPI');

async function handleGet(context: ApiContext) {
  // SECURITY: Always require admin authentication.
  // This ensures a "fail-closed" behavior if ADMIN_API_KEY is not configured.
  await requireAdminAuth(context.request);

  const metrics = await register.metrics();

  logger.debug('Metrics requested', {
    requestId: context.requestId,
    contentType: register.contentType,
  });

  if (!metrics) {
    throw new AppError(
      API_ERROR_MESSAGES.METRICS.FAILED_TO_GENERATE,
      ErrorCode.INTERNAL_ERROR,
      STATUS_CODES.INTERNAL_ERROR,
      undefined,
      false
    );
  }

  return new Response(metrics, {
    status: STATUS_CODES.OK,
    headers: {
      [HTTP_HEADERS.CONTENT_TYPE]: register.contentType,
      [HTTP_HEADERS.X_REQUEST_ID]: context.requestId,
      [HTTP_HEADERS.X_RATELIMIT_LIMIT]: String(context.rateLimit.limit),
      [HTTP_HEADERS.X_RATELIMIT_REMAINING]: String(context.rateLimit.remaining),
      [HTTP_HEADERS.X_RATELIMIT_RESET]: String(
        new Date(context.rateLimit.reset).toISOString()
      ),
    },
  });
}

export const GET = withApiHandler(handleGet, {
  validateSize: false,
  rateLimit: 'strict',
});
