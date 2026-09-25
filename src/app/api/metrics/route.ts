import { register } from '@/lib/metrics';
import { withApiHandler, ApiContext } from '@/lib/api-handler';
import { STATUS_CODES, HTTP_HEADERS } from '@/lib/config/http';
import { createLogger } from '@/lib/logger';
import { requireAdminAuth } from '@/lib/auth';

const logger = createLogger('MetricsAPI');

// Minimal valid Prometheus exposition payload returned when the registry is a
// no-op/empty (Edge runtime has no prom-client registry). Returning 200 with
// `#` comment lines keeps scrapes from failing closed; never throw 500 here.
const EMPTY_REGISTRY_PAYLOAD =
  '# Metrics registry unavailable in this runtime (Edge/no-op register).\n' +
  '# Full prom-client metrics are only collected in the Node.js runtime.\n' +
  '# HELP app_up Application scrape target reachability.\n' +
  '# TYPE app_up gauge\n' +
  'app_up 1\n';

async function handleGet(context: ApiContext) {
  // SECURITY: Always require admin authentication.
  // This ensures a "fail-closed" behavior if ADMIN_API_KEY is not configured.
  await requireAdminAuth(context.request);

  const metrics = await register.metrics();

  logger.debug('Metrics requested', {
    requestId: context.requestId,
    contentType: register.contentType,
  });

  if (!metrics || metrics.trim().length === 0) {
    return new Response(EMPTY_REGISTRY_PAYLOAD, {
      status: STATUS_CODES.OK,
      headers: {
        [HTTP_HEADERS.CONTENT_TYPE]: register.contentType,
        [HTTP_HEADERS.X_REQUEST_ID]: context.requestId,
        [HTTP_HEADERS.X_RATELIMIT_LIMIT]: String(context.rateLimit.limit),
        [HTTP_HEADERS.X_RATELIMIT_REMAINING]: String(
          context.rateLimit.remaining
        ),
        [HTTP_HEADERS.X_RATELIMIT_RESET]: String(
          new Date(context.rateLimit.reset).toISOString()
        ),
      },
    });
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
