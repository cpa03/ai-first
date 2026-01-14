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
  success: boolean;
  data?: T;
  error?: string;
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
    const rateLimitConfig = options.rateLimit
      ? rateLimitConfigs[options.rateLimit]
      : rateLimitConfigs.lenient;

    try {
      const rateLimitResult = checkRateLimit(
        request.headers.get('x-forwarded-for') || 'unknown',
        rateLimitConfig
      );

      if (!rateLimitResult.allowed) {
        return rateLimitResponse(rateLimitResult.info);
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

      return response;
    } catch (error) {
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

export function standardSuccessResponse<T>(
  data: T,
  requestId: string,
  status: number = 200,
  rateLimit?: RateLimitInfo
): NextResponse {
  const response = NextResponse.json(data, { status });

  response.headers.set('X-Request-ID', requestId);

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
