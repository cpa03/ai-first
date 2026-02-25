import { NextRequest, NextResponse } from 'next/server';
import {
  generateRequestId,
  toErrorResponse,
  AppError,
  ErrorCode,
  ErrorDetail,
} from '@/lib/errors';
import { validateRequestSize } from '@/lib/validation';
import {
  checkRateLimit,
  rateLimitConfigs,
  rateLimitResponse,
  RateLimitInfo,
  getClientIdentifier,
} from '@/lib/rate-limit';
import {
  createLogger,
  generateCorrelationId,
  setCorrelationId,
  LogContext,
} from '@/lib/logger';
import { STATUS_CODES } from '@/lib/config';
import {
  httpRequestDuration,
  httpRequestErrors,
  httpRequestTotal,
} from '@/app/api/metrics/route';
import { APP_CONFIG } from '@/lib/config/app';
import { detectSuspiciousPatterns } from '@/lib/security/suspicious-patterns';
import { SecurityAuditLog } from '@/lib/security/audit-log';
import { TimeoutManager } from '@/lib/resilience/timeout-manager';
import { TIMEOUT_CONFIG } from '@/lib/config/constants';
import { TimeoutError } from '@/lib/errors';

/**
 * API Version for all responses
 * Uses centralized APP_CONFIG.VERSION for single source of truth
 * Follows semantic versioning (MAJOR.MINOR.PATCH)
 * Increment MAJOR for breaking changes, MINOR for new features, PATCH for bug fixes
 */
const API_VERSION = APP_CONFIG.VERSION;

const logger = createLogger('ApiHandler');

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  requestId: string;
  timestamp: string;
}

export interface ApiHandlerOptions {
  rateLimit?: keyof typeof rateLimitConfigs;
  validateSize?: boolean;
  cacheTtlSeconds?: number;
  cacheScope?: 'public' | 'private';
  /** Timeout in milliseconds for the API request. Uses TIMEOUT_CONFIG.DEFAULT if not specified. */
  timeoutMs?: number;
}

export interface ApiContext {
  requestId: string;
  request: NextRequest;
  rateLimit: RateLimitInfo;
}

export type ApiHandler = (context: ApiContext) => Promise<Response>;

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
    // SECURITY: Detect suspicious patterns in the request for security monitoring
    // This integrates the suspicious-patterns module that was previously unused
    // Patterns are logged via SecurityAuditLog for incident response
    const suspiciousResult = detectSuspiciousPatterns(request, {
      scanBody: false, // Performance: skip body scanning by default
      minSeverity: 2, // Only log medium+ severity patterns (avoid noise)
      logDetected: true,
    });

    // SECURITY: Actively block high-severity suspicious patterns (Severity 3)
    // This provides active protection against SQLi, XSS, and other common attacks.
    // We return 403 Forbidden with a generic message to avoid leaking detection logic.
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

    try {
      const rateLimitResult = checkRateLimit(
        getClientIdentifier(request),
        rateLimitConfig
      );

      if (!rateLimitResult.allowed) {
        logger.warnWithContext('Rate limit exceeded', logContext, {
          limit: rateLimitResult.info.limit,
        });

        // SECURITY: Log rate limit violation to security audit for incident response
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

      // Apply timeout if specified
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

export function successResponse<T>(
  data: T,
  status: number = STATUS_CODES.OK,
  rateLimit?: RateLimitInfo
): NextResponse {
  const response = NextResponse.json(data, { status });

  if (rateLimit) {
    response.headers.set('X-RateLimit-Limit', String(rateLimit.limit));
    response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
    response.headers.set(
      'X-RateLimit-Reset',
      String(new Date(rateLimit.reset).toISOString())
    );
  }

  return response;
}

/**
 * Creates a 404 Not Found response.
 *
 * @deprecated Use `throw new AppError(message, ErrorCode.NOT_FOUND, STATUS_CODES.NOT_FOUND)` instead.
 * Throwing AppError ensures consistent error response format with `error`, `code`, `fingerprint`,
 * `details`, `timestamp`, `requestId`, `retryable`, and `suggestions` fields.
 *
 * @example
 * // Instead of:
 * // return notFoundResponse('Task not found');
 *
 * // Use:
 * throw new AppError('Task not found', ErrorCode.NOT_FOUND, STATUS_CODES.NOT_FOUND);
 *
 * @param message - Error message to include
 * @param rateLimit - Rate limit info for headers
 * @returns NextResponse with 404 status
 */
export function notFoundResponse(
  message: string = 'Resource not found',
  rateLimit?: RateLimitInfo
): NextResponse {
  const response = NextResponse.json(
    { error: message, code: 'NOT_FOUND' },
    { status: STATUS_CODES.NOT_FOUND }
  );

  if (rateLimit) {
    response.headers.set('X-RateLimit-Limit', String(rateLimit.limit));
    response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
    response.headers.set(
      'X-RateLimit-Reset',
      String(new Date(rateLimit.reset).toISOString())
    );
  }

  return response;
}

/**
 * Creates a 400 Bad Request response.
 *
 * @deprecated Use `throw new ValidationError(details)` instead.
 * Throwing ValidationError ensures consistent error response format with `error`, `code`,
 * `fingerprint`, `details`, `timestamp`, `requestId`, `retryable`, and `suggestions` fields.
 *
 * @example
 * // Instead of:
 * // return badRequestResponse('Invalid input', [{ field: 'name', message: 'Name is required' }]);
 *
 * // Use:
 * throw new ValidationError([{ field: 'name', message: 'Name is required' }]);
 *
 * @param message - Error message to include
 * @param details - Array of validation error details
 * @param rateLimit - Rate limit info for headers
 * @returns NextResponse with 400 status
 */
export function badRequestResponse(
  message: string,
  details?: ErrorDetail[],
  rateLimit?: RateLimitInfo
): NextResponse {
  const response = NextResponse.json(
    { error: message, code: 'BAD_REQUEST', details },
    { status: STATUS_CODES.BAD_REQUEST }
  );

  if (rateLimit) {
    response.headers.set('X-RateLimit-Limit', String(rateLimit.limit));
    response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
    response.headers.set(
      'X-RateLimit-Reset',
      String(new Date(rateLimit.reset).toISOString())
    );
  }

  return response;
}

export function standardSuccessResponse<T = unknown>(
  data: T,
  requestId: string,
  status: number = STATUS_CODES.OK,
  rateLimit?: RateLimitInfo
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    requestId,
    timestamp: new Date().toISOString(),
  };

  const nextResponse = NextResponse.json(response, { status });

  nextResponse.headers.set('X-Request-ID', requestId);

  if (rateLimit) {
    nextResponse.headers.set('X-RateLimit-Limit', String(rateLimit.limit));
    nextResponse.headers.set(
      'X-RateLimit-Remaining',
      String(rateLimit.remaining)
    );
    nextResponse.headers.set(
      'X-RateLimit-Reset',
      String(new Date(rateLimit.reset).toISOString())
    );
  }

  return nextResponse;
}
