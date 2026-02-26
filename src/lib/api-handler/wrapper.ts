import { NextRequest, NextResponse } from 'next/server';
import {
  generateRequestId,
  toErrorResponse,
  AppError,
  ErrorCode,
} from '@/lib/errors';
import { validateRequestSize } from '@/lib/validation';
import {
  checkRateLimit,
  rateLimitConfigs,
  rateLimitResponse,
  getClientIdentifier,
} from '@/lib/rate-limit';
import {
  createLogger,
  generateCorrelationId,
  setCorrelationId,
  type LogContext,
} from '@/lib/logger';
import { STATUS_CODES } from '@/lib/config';
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
import type { ApiHandlerOptions, ApiContext, ApiHandler } from './types';

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

    const logContext: LogContext = {
      requestId,
      action: request.method,
      metadata: {
        path: request.url ? new URL(request.url).pathname : '/unknown',
        correlationId,
      },
    };

    logger.infoWithContext('API request started', logContext);
    const suspiciousResult = detectSuspiciousPatterns(request, {
      scanBody: false,
      minSeverity: 2,
      logDetected: true,
    });

    if (suspiciousResult.detected && suspiciousResult.maxSeverity === 3) {
      logger.warnWithContext('Blocking suspicious request', logContext, {
        maxSeverity: suspiciousResult.maxSeverity,
        patterns: suspiciousResult.patterns.map((p) => p.category),
      });

      return NextResponse.json(
        {
          error: 'Forbidden: Security policy violation',
          code: 'SECURITY_BLOCK',
          timestamp: new Date().toISOString(),
          requestId,
        },
        {
          status: 403,
          headers: {
            'X-Request-ID': requestId,
          },
        }
      );
    }

    if (!options.skipCSRF) {
      const csrfResult = validateCSRF(request);
      if (!csrfResult.valid) {
        logger.warnWithContext('CSRF validation failed', logContext, {
          origin: csrfResult.origin,
        });

        return NextResponse.json(
          {
            error: 'Forbidden: Invalid origin header',
            code: 'CSRF_VALIDATION_FAILED',
            timestamp: new Date().toISOString(),
            requestId,
          },
          {
            status: 403,
            headers: {
              'X-Request-ID': requestId,
            },
          }
        );
      }
    }

    try {
      const rateLimitResult = checkRateLimit(
        getClientIdentifier(request),
        rateLimitConfig
      );

      if (!rateLimitResult.allowed) {
        logger.warnWithContext('Rate limit exceeded', logContext, {
          limit: rateLimitResult.info.limit,
        });

        SecurityAuditLog.logRateLimit({
          blocked: true,
          config: options.rateLimit || 'lenient',
          requestCount:
            rateLimitResult.info.limit - rateLimitResult.info.remaining,
          limit: rateLimitResult.info.limit,
          windowMs: rateLimitConfig.windowMs,
          clientIdentifier: getClientIdentifier(request),
          endpoint: request.url ? new URL(request.url).pathname : undefined,
          requestId,
        });

        return rateLimitResponse(rateLimitResult.info, requestId);
      }

      const context: ApiContext = {
        requestId,
        request,
        rateLimit: rateLimitResult.info,
      };

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

      const timeoutMs = options.timeoutMs ?? TIMEOUT_CONFIG.DEFAULT;
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
            const duration = Date.now() - requestStartTime;
            const route = request.url
              ? new URL(request.url).pathname
              : '/unknown';

            httpRequestDuration.observe(
              { method: request.method, route, status_code: '504' },
              duration / 1000
            );
            httpRequestErrors.inc({
              method: request.method,
              route,
              status_code: '504',
            });
            httpRequestTotal.inc({
              method: request.method,
              route,
              status_code: '504',
            });

            return NextResponse.json(
              {
                error: 'Gateway Timeout',
                code: 'TIMEOUT',
                message: 'Request timed out after ' + timeoutMs + 'ms',
                timestamp: new Date().toISOString(),
                requestId,
              },
              {
                status: 504,
                headers: {
                  'X-Request-ID': requestId,
                  'X-Response-Time': duration + 'ms',
                },
              }
            );
          }
          throw error;
        }
      } else {
        response = await handler(context);
      }

      if (!response.headers.has('X-Request-ID')) {
        response.headers.set('X-Request-ID', requestId);
      }

      response.headers.set('X-Correlation-ID', correlationId);

      response.headers.set(
        'X-RateLimit-Limit',
        String(context.rateLimit.limit)
      );
      response.headers.set(
        'X-RateLimit-Remaining',
        String(context.rateLimit.remaining)
      );
      response.headers.set(
        'X-RateLimit-Reset',
        String(new Date(context.rateLimit.reset).toISOString())
      );

      const duration = Date.now() - requestStartTime;
      response.headers.set('X-Response-Time', `${duration}ms`);
      response.headers.set('X-API-Version', API_VERSION);

      if (
        options.cacheTtlSeconds !== undefined &&
        options.cacheTtlSeconds > 0 &&
        !response.headers.has('Cache-Control')
      ) {
        const scope = options.cacheScope || 'public';
        response.headers.set(
          'Cache-Control',
          `${scope}, max-age=${options.cacheTtlSeconds}`
        );
      }

      const route = request.url ? new URL(request.url).pathname : '/unknown';
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
      const route = request.url ? new URL(request.url).pathname : '/unknown';
      const errorStatusCode =
        error instanceof AppError ? String(error.statusCode) : '500';

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
