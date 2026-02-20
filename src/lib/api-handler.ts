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

/**
 * API Version for all responses
 * Follows semantic versioning (MAJOR.MINOR.PATCH)
 * Increment MAJOR for breaking changes, MINOR for new features, PATCH for bug fixes
 */
const API_VERSION = '1.0.0';

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

    try {
      const rateLimitResult = checkRateLimit(
        getClientIdentifier(request),
        rateLimitConfig
      );

      if (!rateLimitResult.allowed) {
        logger.warnWithContext('Rate limit exceeded', logContext, {
          limit: rateLimitResult.info.limit,
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

      const response = await handler(context);

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

      logger.infoWithContext('API request completed', logContext, {
        duration,
        status: response.status,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - requestStartTime;
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
