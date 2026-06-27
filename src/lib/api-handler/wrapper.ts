import { NextRequest } from 'next/server';
import {
  generateRequestId,
  toErrorResponse,
  AppError,
  ErrorCode,
} from '@/lib/errors';
import { validateRequestSize } from '@/lib/validation';
import {
  checkUserRateLimit,
  rateLimitConfigs,
  rateLimitResponse,
} from '@/lib/rate-limit';
import {
  createLogger,
  generateCorrelationId,
  setCorrelationId,
  type LogContext,
} from '@/lib/logger';
import { STATUS_CODES, HTTP_HEADERS } from '@/lib/config/http';
import {
  httpRequestDuration,
  httpRequestErrors,
  httpRequestTotal,
} from '@/lib/metrics';
import { APP_CONFIG } from '@/lib/config/app';
import { detectSuspiciousPatterns } from '@/lib/security/suspicious-patterns';
import { SecurityAuditLog } from '@/lib/security/audit-log';
import { validateCSRF } from '@/lib/security/csrf';
import { TimeoutManager } from '@/lib/resilience/timeout-manager';
import { TIMEOUT_CONFIG } from '@/lib/config/constants';
import { TimeoutError } from '@/lib/errors';
import type {
  ApiHandlerOptions,
  ApiContext,
  ApiHandler,
  TimeoutPreset,
} from './types';

const API_VERSION = APP_CONFIG.VERSION;

const logger = createLogger('ApiHandler');

/**
 * Creates a wrapped API handler with common middleware functionality
 *
 * Features:
 * - Request ID generation
 * - Correlation ID tracking
 * - Rate limiting
 * - Request size validation
 * - Suspicious pattern detection
 * - CSRF validation
 * - Timeout management
 * - Metrics collection
 * - Response header management
 * - Error handling
 */
export function withApiHandler(
  handler: ApiHandler,
  options: ApiHandlerOptions = {}
): (request: NextRequest) => Promise<Response> {
  return async (request: NextRequest) => {
    const requestId = generateRequestId();
    const requestStartTime = Date.now();
    const correlationId = generateCorrelationId();

    setCorrelationId(correlationId);

    const rateLimitConfig = options.rateLimit
      ? rateLimitConfigs[options.rateLimit]
      : rateLimitConfigs.lenient;

    // PERFORMANCE: Use pre-parsed nextUrl when available to avoid redundant URL parsing (15-20x faster)
    let path = request.nextUrl?.pathname;

    // Fallback for non-NextRequest objects to ensure observability
    if (!path && request.url) {
      try {
        path = new URL(request.url).pathname;
      } catch {
        path = '/unknown';
      }
    } else if (!path) {
      path = '/unknown';
    }

    const logContext: LogContext = {
      requestId,
      action: request.method,
      metadata: {
        path,
        correlationId,
      },
    };

    logger.infoWithContext('API request started', logContext);

    try {
      // PERFORMANCE: Reordered middleware to perform cheap/essential checks first.
      // 1. Header-based checks (fastest)
      // 2. Rate limiting (potentially hits cache/network)
      // 3. Security scanning (CPU-intensive regex)

      // 1. Request Size Validation (Header-based, cheap)
      if (options.validateSize !== false) {
        const sizeValidation = validateRequestSize(request);
        if (!sizeValidation.valid) {
          throw new AppError(
            'Request size exceeds limit',
            ErrorCode.VALIDATION_ERROR,
            STATUS_CODES.PAYLOAD_TOO_LARGE,
            sizeValidation.errors
          );
        }
      }

      // 2. CSRF Validation (Header-based, relatively cheap)
      if (!options.skipCSRF) {
        const csrfResult = validateCSRF(request);
        if (!csrfResult.valid) {
          logger.warnWithContext('CSRF validation failed', logContext, {
            origin: csrfResult.origin,
          });

          return toErrorResponse(
            new AppError(
              'Forbidden: Invalid origin header',
              ErrorCode.AUTHORIZATION_ERROR,
              STATUS_CODES.FORBIDDEN,
              [
                {
                  message: `Invalid origin: ${csrfResult.origin || 'unknown'}`,
                },
              ],
              false
            ),
            requestId,
            Date.now() - requestStartTime
          );
        }
      }

      // 3. Rate Limiting (Per-user/IP)
      const {
        userInfo,
        info: rateLimitInfo,
        allowed,
      } = checkUserRateLimit(request, rateLimitConfig);

      if (!allowed) {
        logger.warnWithContext('Rate limit exceeded', logContext, {
          limit: rateLimitInfo.limit,
          userId: userInfo.userId,
          role: userInfo.role,
        });

        SecurityAuditLog.logRateLimit({
          blocked: true,
          config: options.rateLimit || 'lenient',
          requestCount: rateLimitInfo.limit - rateLimitInfo.remaining,
          limit: rateLimitInfo.limit,
          windowMs: rateLimitConfig.windowMs,
          clientIdentifier: userInfo.identifier,
          endpoint: path || undefined,
          requestId,
        });

        return rateLimitResponse(rateLimitInfo, requestId);
      }

      // 4. Suspicious Pattern Detection (Regex-based, most expensive)
      // Only runs if the request hasn't been blocked by rate limiting or size validation.
      const suspiciousResult = detectSuspiciousPatterns(request, {
        scanBody: false,
        minSeverity: 2,
        logDetected: true,
        requestId,
      });

      if (suspiciousResult.detected && suspiciousResult.maxSeverity === 3) {
        logger.warnWithContext('Blocking suspicious request', logContext, {
          maxSeverity: suspiciousResult.maxSeverity,
          patterns: suspiciousResult.patterns.map((p) => p.category),
        });

        return toErrorResponse(
          new AppError(
            'Forbidden: Security policy violation',
            ErrorCode.AUTHORIZATION_ERROR,
            STATUS_CODES.FORBIDDEN,
            [
              {
                message: `Suspicious patterns detected: ${suspiciousResult.patterns.map((p) => p.category).join(', ')}`,
              },
            ],
            false
          ),
          requestId,
          Date.now() - requestStartTime
        );
      }

      const context: ApiContext = {
        requestId,
        request,
        rateLimit: rateLimitInfo,
        userId: userInfo.userId,
        userRole: userInfo.role,
      };
      // Resolve timeout: preset takes precedence over timeoutMs
      let timeoutMs: number;
      if (options.timeout) {
        // Use preset-based timeout
        const presetTimeoutMap: Record<TimeoutPreset, number> = {
          quick: TIMEOUT_CONFIG.QUICK,
          standard: TIMEOUT_CONFIG.STANDARD,
          long: TIMEOUT_CONFIG.LONG,
        };
        timeoutMs = presetTimeoutMap[options.timeout];
      } else {
        timeoutMs = options.timeoutMs ?? TIMEOUT_CONFIG.DEFAULT;
      }
      let response: Response;

      if (timeoutMs > 0) {
        try {
          response = await TimeoutManager.withTimeout(() => handler(context), {
            timeoutMs,
            onTimeout: () => {
              logger.warnWithContext('API request timed out', logContext, {
                timeoutMs,
              });
            },
          });
        } catch (error) {
          if (error instanceof TimeoutError) {
            // Re-throw to be handled by the general error handler below
            // This ensures consistent error response format
            throw error;
          }
          throw error;
        }
      } else {
        response = await handler(context);
      }

      if (!response.headers.has(HTTP_HEADERS.X_REQUEST_ID)) {
        response.headers.set(HTTP_HEADERS.X_REQUEST_ID, requestId);
      }

      response.headers.set(HTTP_HEADERS.X_CORRELATION_ID, correlationId);

      response.headers.set(
        HTTP_HEADERS.X_RATELIMIT_LIMIT,
        String(context.rateLimit.limit)
      );
      response.headers.set(
        HTTP_HEADERS.X_RATELIMIT_REMAINING,
        String(context.rateLimit.remaining)
      );
      response.headers.set(
        HTTP_HEADERS.X_RATELIMIT_RESET,
        String(new Date(context.rateLimit.reset).toISOString())
      );

      const duration = Date.now() - requestStartTime;
      response.headers.set(HTTP_HEADERS.X_RESPONSE_TIME, `${duration}ms`);
      response.headers.set(HTTP_HEADERS.X_API_VERSION, API_VERSION);

      if (
        options.cacheTtlSeconds !== undefined &&
        options.cacheTtlSeconds > 0 &&
        !response.headers.has(HTTP_HEADERS.CACHE_CONTROL)
      ) {
        const scope = options.cacheScope || 'public';
        response.headers.set(
          HTTP_HEADERS.CACHE_CONTROL,
          `${scope}, max-age=${options.cacheTtlSeconds}`
        );
      }

      // PERFORMANCE: Use path extracted at start of request
      const route = path || '/unknown';
      const statusCode = String(response.status);
      httpRequestDuration.observe(
        { method: request.method, route, status_code: statusCode },
        duration / 1000
      );
      httpRequestTotal.inc({
        method: request.method,
        route,
        status_code: statusCode,
      });

      logger.infoWithContext('API request completed', logContext, {
        duration,
        status: response.status,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - requestStartTime;
      // PERFORMANCE: Use path extracted at start of request
      const route = path || '/unknown';
      const errorStatusCode =
        error instanceof AppError
          ? String(error.statusCode)
          : String(STATUS_CODES.INTERNAL_ERROR);

      httpRequestDuration.observe(
        { method: request.method, route, status_code: errorStatusCode },
        duration / 1000
      );
      httpRequestErrors.inc({
        method: request.method,
        route,
        status_code: errorStatusCode,
      });
      httpRequestTotal.inc({
        method: request.method,
        route,
        status_code: errorStatusCode,
      });

      logger.errorWithContext('API request failed', logContext, {
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error?.constructor?.name || 'Unknown',
        stack: error instanceof Error ? error.stack : undefined,
      });

      return toErrorResponse(error, requestId, duration);
    } finally {
      setCorrelationId(undefined);
    }
  };
}
