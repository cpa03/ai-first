/**
 * Error utility functions
 */

import { redactPII } from '../pii-redaction';
import { ERROR_CONFIG, STATUS_CODES } from '../config/constants';
import { SECURITY_CONFIG } from '../config/environment';
import { APP_CONFIG } from '../config/app';
import { HTTP_HEADERS } from '../config/http';
import { generateId } from '../security/crypto';
import {
  RETRYABLE_PATTERNS,
  matchesAnyPattern,
} from '../config/error-classification';
import { ErrorCode, ERROR_SUGGESTIONS } from './codes';
import { AppError, RateLimitError, type ErrorDetail } from './classes';
import { TIME_CONVERSIONS } from '../config/modular-constants';

const API_VERSION = APP_CONFIG.VERSION;

export function toErrorResponse(
  error: unknown,
  requestId?: string,
  responseTimeMs?: number
): Response {
  let appError: AppError;
  let statusCode: number = STATUS_CODES.INTERNAL_ERROR;

  if (error instanceof AppError) {
    appError = error;
    statusCode = appError.statusCode;
  } else if (error instanceof Error) {
    appError = new AppError(
      redactPII(error.message),
      ErrorCode.INTERNAL_ERROR,
      STATUS_CODES.INTERNAL_ERROR,
      undefined,
      false,
      undefined,
      requestId
    );
  } else {
    appError = new AppError(
      'Unknown error occurred',
      ErrorCode.INTERNAL_ERROR,
      STATUS_CODES.INTERNAL_ERROR,
      undefined,
      false,
      undefined,
      requestId
    );
  }

  if (requestId && !appError.requestId) {
    appError.setRequestId(requestId);
  }

  const errorResponse = appError.toJSON();
  if (!errorResponse.requestId) {
    errorResponse.requestId = requestId || generateRequestId();
  }

  const headers: Record<string, string> = {
    [HTTP_HEADERS.CONTENT_TYPE]: HTTP_HEADERS.APPLICATION_JSON,
    'X-Content-Type-Options': SECURITY_CONFIG.X_CONTENT_TYPE_OPTIONS,
    'X-Frame-Options': SECURITY_CONFIG.X_FRAME_OPTIONS,
    'Referrer-Policy': SECURITY_CONFIG.REFERRER_POLICY,
    [HTTP_HEADERS.X_REQUEST_ID]: errorResponse.requestId || '',
    'X-Error-Code': appError.code,
    'X-Error-Fingerprint': appError.fingerprint,
    [HTTP_HEADERS.X_RETRYABLE]: String(appError.retryable),
    [HTTP_HEADERS.X_API_VERSION]: API_VERSION,
  };

  if (responseTimeMs !== undefined) {
    headers[HTTP_HEADERS.X_RESPONSE_TIME] = `${responseTimeMs}ms`;
  }

  if (appError instanceof RateLimitError) {
    headers[HTTP_HEADERS.RETRY_AFTER] = String(appError.retryAfter);
    headers[HTTP_HEADERS.X_RATELIMIT_LIMIT] = String(appError.limit);
    headers[HTTP_HEADERS.X_RATELIMIT_REMAINING] = String(appError.remaining);
    headers[HTTP_HEADERS.X_RATELIMIT_RESET] = String(
      Math.ceil(Date.now() / TIME_CONVERSIONS.MS_PER_SECOND) +
        appError.retryAfter
    );
  }

  return new Response(JSON.stringify(errorResponse), {
    status: statusCode,
    headers,
  });
}

export function generateRequestId(): string {
  return `${ERROR_CONFIG.REQUEST_ID.PREFIX}${generateId()}`;
}

export function createErrorWithSuggestions(
  code: ErrorCode,
  message: string,
  statusCode: number = STATUS_CODES.INTERNAL_ERROR,
  details?: ErrorDetail[],
  retryable: boolean = false
): AppError {
  return new AppError(
    message,
    code,
    statusCode,
    details,
    retryable,
    ERROR_SUGGESTIONS[code]
  );
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.retryable;
  }

  if (error instanceof Error) {
    // PERFORMANCE: Use optimized matchesAnyPattern for faster classification
    return matchesAnyPattern(error.message, RETRYABLE_PATTERNS);
  }

  return false;
}
