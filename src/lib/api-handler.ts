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
} from '@/lib/rate-limit';

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  requestId: string;
  timestamp: string;
}

export interface ApiHandlerOptions {
  rateLimit?: keyof typeof rateLimitConfigs;
  validateSize?: boolean;
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
    const rateLimitConfig = options.rateLimit
      ? rateLimitConfigs[options.rateLimit]
      : rateLimitConfigs.lenient;

    try {
      const rateLimitResult = checkRateLimit(
        request.headers.get('x-forwarded-for') || 'unknown',
        rateLimitConfig
      );

      if (!rateLimitResult.allowed) {
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
            413,
            sizeValidation.errors
          );
        }
      }

      const response = await handler(context);

      if (!response.headers.has('X-Request-ID')) {
        response.headers.set('X-Request-ID', requestId);
      }

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

      // Log successful request metrics
      const duration = Date.now() - requestStartTime;
      response.headers.set('X-Response-Time', `${duration}ms`);

      return response;
    } catch (error) {
      // Log error details for monitoring
      const duration = Date.now() - requestStartTime;
      console.error(
        `[API Error] Request ${requestId} failed after ${duration}ms:`,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          path: request.url,
          method: request.method,
        }
      );

      return toErrorResponse(error, requestId);
    }
  };
}

export function successResponse<T>(
  data: T,
  status: number = 200,
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
    { status: 404 }
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
    { status: 400 }
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
  status: number = 200,
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
