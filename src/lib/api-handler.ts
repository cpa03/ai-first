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
  addRateLimitHeaders,
  RateLimitInfo,
} from '@/lib/rate-limit';

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

    try {
      const rateLimitResult = checkRateLimit(
        request.headers.get('x-forwarded-for') || 'unknown',
        options.rateLimit
          ? rateLimitConfigs[options.rateLimit]
          : rateLimitConfigs.lenient
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

      return addRateLimitHeaders(response, rateLimitResult.info);
    } catch (error) {
      const errorResponse = toErrorResponse(error, requestId);
      const rateLimitResult = checkRateLimit(
        request.headers.get('x-forwarded-for') || 'unknown',
        options.rateLimit
          ? rateLimitConfigs[options.rateLimit]
          : rateLimitConfigs.lenient
      );
      return addRateLimitHeaders(errorResponse, rateLimitResult.info);
    }
  };
}

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  requestId: string;
  timestamp: string;
}

export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json(data, { status });
}

export function standardSuccessResponse<T>(
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

export function notFoundResponse(
  message: string = 'Resource not found'
): NextResponse {
  return NextResponse.json(
    { error: message, code: 'NOT_FOUND' },
    { status: 404 }
  );
}

export function badRequestResponse(
  message: string,
  details?: ErrorDetail[]
): NextResponse {
  return NextResponse.json(
    { error: message, code: 'BAD_REQUEST', details },
    { status: 400 }
  );
}
