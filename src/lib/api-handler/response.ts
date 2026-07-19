import { NextResponse } from 'next/server';
import { STATUS_CODES } from '@/lib/config/http';
import { APP_CONFIG } from '@/lib/config/app';
import type { RateLimitInfo } from '@/lib/rate-limit';
import type { ApiResponse } from './types';
import { generateRequestId } from '@/lib/errors';
import type { ErrorCode } from '@/lib/errors';

const API_VERSION = APP_CONFIG.VERSION;

/**
 * Standard error response format matching ApiErrorResponse interface
 */
export interface StandardErrorResponse {
  success: false;
  error: string;
  code: string;
  fingerprint: string;
  details?: Array<{ field?: string; message: string; code?: string }>;
  timestamp: string;
  requestId: string;
  retryable: boolean;
  suggestions?: string[];
}

/**
 * Creates a standardized error response with all required fields
 * This ensures consistent error format across all API routes
 */
export function standardErrorResponse(
  message: string,
  code: ErrorCode,
  statusCode: number = STATUS_CODES.INTERNAL_ERROR,
  options: {
    details?: Array<{ field?: string; message: string; code?: string }>;
    retryable?: boolean;
    suggestions?: string[];
    requestId?: string;
    rateLimit?: RateLimitInfo;
  } = {}
): NextResponse {
  const requestId = options.requestId || generateRequestId();

  const fingerprint = Buffer.from(`${code}:${message}`)
    .toString('base64')
    .slice(0, 32);

  const errorResponse: StandardErrorResponse = {
    success: false,
    error: message,
    code,
    fingerprint,
    timestamp: new Date().toISOString(),
    requestId,
    retryable: options.retryable ?? false,
  };

  if (options.details) {
    errorResponse.details = options.details;
  }

  if (options.suggestions) {
    errorResponse.suggestions = options.suggestions;
  }

  const response = NextResponse.json(errorResponse, { status: statusCode });

  response.headers.set('X-Request-ID', requestId);
  response.headers.set('X-Error-Code', code);
  response.headers.set('X-Error-Fingerprint', fingerprint);
  response.headers.set('X-Retryable', String(errorResponse.retryable));
  response.headers.set('X-API-Version', API_VERSION);

  if (options.rateLimit) {
    response.headers.set('X-RateLimit-Limit', String(options.rateLimit.limit));
    response.headers.set(
      'X-RateLimit-Remaining',
      String(options.rateLimit.remaining)
    );
    response.headers.set(
      'X-RateLimit-Reset',
      String(new Date(options.rateLimit.reset).toISOString())
    );
  }

  return response;
}

/**
 * Creates a successful JSON response with optional rate limit headers
 * This is a simple wrapper that returns raw data for backward compatibility.
 * For standardized responses with requestId/timestamp, use standardSuccessResponse.
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

export function notFoundResponse(
  message: string = 'Resource not found',
  rateLimit?: RateLimitInfo
): NextResponse {
  return standardErrorResponse(
    message,
    'NOT_FOUND' as ErrorCode,
    STATUS_CODES.NOT_FOUND,
    { rateLimit }
  );
}

export function badRequestResponse(
  message: string,
  details?: Array<{ field: string; message: string }>,
  rateLimit?: RateLimitInfo
): NextResponse {
  return standardErrorResponse(
    message,
    'BAD_REQUEST' as ErrorCode,
    STATUS_CODES.BAD_REQUEST,
    {
      details: details?.map((d) => ({ field: d.field, message: d.message })),
      rateLimit,
    }
  );
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
