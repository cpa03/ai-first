/**
 * Error utility functions
 */

import { redactPII } from '../pii-redaction';
import { ERROR_CONFIG, STATUS_CODES } from '../config/constants';
import { APP_CONFIG } from '../config/app';
import { HTTP_HEADERS } from '../config/http';
import { generateId } from '../security/crypto';
import {
  RETRYABLE_PATTERNS,
  matchesPattern,
} from '../config/error-classification';
import { ErrorCode, ERROR_SUGGESTIONS } from './codes';
import { AppError, RateLimitError, type ErrorDetail } from './classes';

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
      false
    );
  } else {
    appError = new AppError(
      'Unknown error occurred',
      ErrorCode.INTERNAL_ERROR,
      STATUS_CODES.INTERNAL_ERROR,
      undefined,
      false
    );
  }

  const errorResponse = appError.toJSON();
  errorResponse.requestId = requestId || generateRequestId();

  const headers: Record<string, string> = {
    [HTTP_HEADERS.CONTENT_TYPE]: HTTP_HEADERS.APPLICATION_JSON,
    'X-Request-ID': errorResponse.requestId || '',
    'X-Error-Code': appError.code,
    'X-Error-Fingerprint': appError.fingerprint,
    'X-Retryable': String(appError.retryable),
    'X-API-Version': API_VERSION,
  };

  if (responseTimeMs !== undefined) {
    headers['X-Response-Time'] = `${responseTimeMs}ms`;
  }

  if (appError instanceof RateLimitError) {
    headers['Retry-After'] = String(appError.retryAfter);
    headers['X-RateLimit-Limit'] = String(appError.limit);
    headers['X-RateLimit-Remaining'] = String(appError.remaining);
    headers['X-RateLimit-Reset'] = String(
      Math.ceil(Date.now() / 1000) + appError.retryAfter
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
    const message = error.message;
    return (
      matchesPattern(message, RETRYABLE_PATTERNS.TIMEOUT) ||
      matchesPattern(message, RETRYABLE_PATTERNS.RATE_LIMIT) ||
      matchesPattern(message, RETRYABLE_PATTERNS.ECONNRESET) ||
      matchesPattern(message, RETRYABLE_PATTERNS.ECONNREFUSED) ||
      matchesPattern(message, RETRYABLE_PATTERNS.ETIMEDOUT) ||
      matchesPattern(message, RETRYABLE_PATTERNS.ENOTFOUND)
    );
  }

  return false;
}
