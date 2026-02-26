import { NextResponse } from 'next/server';
import { STATUS_CODES } from '@/lib/config/http';
import type { RateLimitInfo } from '@/lib/rate-limit';
import type { ApiResponse } from './types';

/**
 * Creates a successful JSON response with optional rate limit headers
 */
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
 * Creates a 404 Not Found response
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
 * Creates a 400 Bad Request response with optional details
 */
export function badRequestResponse(
  message: string,
  details?: Array<{ field: string; message: string }>,
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

/**
 * Creates a standardized success response with requestId and timestamp
 */
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
