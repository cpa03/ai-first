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

const PROMETHEUS_CONTENT_TYPE_FALLBACK =
  'text/plain; version=0.0.4; charset=utf-8';

function expositionContentType(): string {
  try {
    const ct =
      typeof register?.contentType === 'string' &&
      register.contentType.length > 0
        ? register.contentType
        : PROMETHEUS_CONTENT_TYPE_FALLBACK;
    // Guard against a generic bare "text/plain" without exposition version.
    if (ct === 'text/plain') return PROMETHEUS_CONTENT_TYPE_FALLBACK;
    return ct;
  } catch {
    return PROMETHEUS_CONTENT_TYPE_FALLBACK;
  }
}

async function handleGet(context: ApiContext) {
  // SECURITY: Always require admin authentication.
  // This ensures a "fail-closed" behavior if ADMIN_API_KEY is not configured.
  await requireAdminAuth(context.request);

  let metrics: string;
  try {
    metrics = await register.metrics();
  } catch (err) {
    logger.warn('Metrics registry threw; returning stub payload', {
      requestId: context.requestId,
      error: err instanceof Error ? err.message : String(err),
    });
    return new Response(EMPTY_REGISTRY_PAYLOAD, {
      status: STATUS_CODES.OK,
      headers: {
        [HTTP_HEADERS.CONTENT_TYPE]: expositionContentType(),
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

  logger.debug('Metrics requested', {
    requestId: context.requestId,
    contentType: expositionContentType(),
  });

  if (!metrics || metrics.trim().length === 0) {
    return new Response(EMPTY_REGISTRY_PAYLOAD, {
      status: STATUS_CODES.OK,
      headers: {
        [HTTP_HEADERS.CONTENT_TYPE]: expositionContentType(),
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
      [HTTP_HEADERS.CONTENT_TYPE]: expositionContentType(),
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
