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
} from '@/lib/rate-limit';

export interface ApiHandlerOptions {
  rateLimit?: keyof typeof rateLimitConfigs;
  validateSize?: boolean;
}

export interface ApiContext {
  requestId: string;
  request: NextRequest;
}

export type ApiHandler = (context: ApiContext) => Promise<Response>;

export function withApiHandler(
  handler: ApiHandler,
  options: ApiHandlerOptions = {}
): (request: NextRequest) => Promise<Response> {
  return async (request: NextRequest) => {
    const requestId = generateRequestId();
    const context: ApiContext = { requestId, request };

    try {
      const rateLimitResult = checkRateLimit(
        request.headers.get('x-forwarded-for') || 'unknown',
        options.rateLimit
          ? rateLimitConfigs[options.rateLimit]
          : rateLimitConfigs.lenient
      );

      if (!rateLimitResult.allowed) {
        return rateLimitResponse(rateLimitResult.resetTime);
      }

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

      return response;
    } catch (error) {
      return toErrorResponse(error, requestId);
    }
  };
}

export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json(data, { status });
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
