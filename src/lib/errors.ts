import { redactPII, redactPIIInObject } from './pii-redaction';
import { ERROR_CONFIG, STATUS_CODES } from './config/constants';
import { APP_CONFIG } from './config/app';
import * as crypto from 'crypto';

const API_VERSION = APP_CONFIG.VERSION;

const LONG_NUMBER_PATTERN = /\d{4,}/g;
const UUID_PATTERN =
  /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi;
const IP_ADDRESS_PATTERN = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
const FINGERPRINT_HASH_LENGTH = 12;

export function generateErrorFingerprint(
  code: ErrorCode | string,
  message: string,
  stackFirstLine?: string
): string {
  const normalizedMessage = message
    .replace(UUID_PATTERN, 'UUID')
    .replace(IP_ADDRESS_PATTERN, 'IP')
    .replace(LONG_NUMBER_PATTERN, 'N')
    .toLowerCase()
    .trim();

  const fingerprintInput = stackFirstLine
    ? `${code}:${normalizedMessage}:${stackFirstLine}`
    : `${code}:${normalizedMessage}`;

  const hash = crypto
    .createHash('sha256')
    .update(fingerprintInput)
    .digest('hex')
    .substring(0, FINGERPRINT_HASH_LENGTH);

  return `fp_${hash}`;
}

export interface ErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ErrorResponse {
  error: string;
  code: string;
  fingerprint?: string;
  details?: ErrorDetail[];
  timestamp: string;
  requestId?: string;
  retryable?: boolean;
  suggestions?: string[];
}

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  CIRCUIT_BREAKER_OPEN = 'CIRCUIT_BREAKER_OPEN',
  RETRY_EXHAUSTED = 'RETRY_EXHAUSTED',
}

export class AppError extends Error {
  private _fingerprint?: string;

  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly statusCode: number = STATUS_CODES.INTERNAL_ERROR,
    public readonly details?: ErrorDetail[],
    public readonly retryable: boolean = false,
    public readonly suggestions?: string[]
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }

  get fingerprint(): string {
    if (!this._fingerprint) {
      const stackFirstLine = this.stack?.split('\n')[1]?.trim();
      this._fingerprint = generateErrorFingerprint(
        this.code,
        this.message,
        stackFirstLine
      );
    }
    return this._fingerprint;
  }

  toJSON(): ErrorResponse {
    return {
      error: redactPII(this.message),
      code: this.code,
      fingerprint: this.fingerprint,
      details: this.details
        ? (redactPIIInObject(this.details) as unknown as ErrorDetail[])
        : undefined,
      timestamp: new Date().toISOString(),
      retryable: this.retryable,
      suggestions: this.suggestions,
    };
  }
}

export class ValidationError extends AppError {
  constructor(details: ErrorDetail[]) {
    const suggestions = [
      'Check that all required fields are present in your request',
      'Ensure field values match the expected format',
      'Verify that string lengths are within allowed limits',
    ];
    super(
      'Request validation failed',
      ErrorCode.VALIDATION_ERROR,
      STATUS_CODES.BAD_REQUEST,
      details,
      false,
      suggestions
    );
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends AppError {
  constructor(
    retryAfter: number,
    public readonly limit: number,
    public readonly remaining: number
  ) {
    const suggestions = [
      `Wait ${retryAfter} seconds before making another request`,
      'Implement client-side rate limiting to avoid this error',
      'Reduce request frequency or upgrade your plan for higher limits',
    ];
    const details: ErrorDetail[] = [
      {
        message: `Limit: ${limit}, Remaining: ${remaining}`,
      },
    ];
    super(
      `Rate limit exceeded. Retry after ${retryAfter} seconds`,
      ErrorCode.RATE_LIMIT_EXCEEDED,
      STATUS_CODES.RATE_LIMITED,
      details,
      true,
      suggestions
    );
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }

  retryAfter: number;
}

export class ExternalServiceError extends AppError {
  constructor(
    message: string,
    service: string,
    public readonly originalError?: Error
  ) {
    const suggestions = [
      'The system will automatically retry this operation',
      'Check your API credentials for the external service',
      `Verify ${service} service status for outages or maintenance`,
      'Consider reducing the complexity of your request',
    ];
    super(
      `External service error: ${service} - ${message}`,
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      STATUS_CODES.BAD_GATEWAY,
      undefined,
      true,
      suggestions
    );
    this.name = 'ExternalServiceError';
    this.service = service;
  }

  service: string;
}

export class TimeoutError extends AppError {
  constructor(
    message: string,
    public readonly timeoutMs: number
  ) {
    const suggestions = [
      'The operation took too long to complete and was terminated',
      'Try again with a simpler or smaller request',
      'The system will automatically retry this operation',
      'Check if external services are experiencing high latency',
    ];
    super(
      message,
      ErrorCode.TIMEOUT_ERROR,
      STATUS_CODES.GATEWAY_TIMEOUT,
      undefined,
      true,
      suggestions
    );
    this.name = 'TimeoutError';
  }
}

export class CircuitBreakerError extends AppError {
  constructor(service: string, resetTime: Date) {
    const suggestions = [
      `Wait until ${resetTime.toISOString()} before retrying`,
      `The ${service} service is currently experiencing issues`,
      'System will automatically test service recovery',
      'Use /api/health/detailed to monitor service status',
    ];
    const details: ErrorDetail[] = [
      {
        message: `Reset time: ${resetTime.toISOString()}`,
      },
    ];
    super(
      `Circuit breaker open for ${service}. Retry after ${resetTime.toISOString()}`,
      ErrorCode.CIRCUIT_BREAKER_OPEN,
      STATUS_CODES.SERVICE_UNAVAILABLE,
      details,
      true,
      suggestions
    );
    this.name = 'CircuitBreakerError';
    this.service = service;
    this.resetTime = resetTime;
  }

  service: string;
  resetTime: Date;
}

export class RetryExhaustedError extends AppError {
  constructor(
    message: string,
    service: string,
    attempts: number,
    public readonly originalError?: Error
  ) {
    const suggestions = [
      `The operation failed after ${attempts} retry attempts`,
      'Check /api/health/detailed for service status',
      `Verify your ${service} API credentials and quotas`,
      'Contact support with the requestId if this persists',
    ];
    super(
      `${message} after ${attempts} attempts`,
      ErrorCode.RETRY_EXHAUSTED,
      STATUS_CODES.BAD_GATEWAY,
      undefined,
      true,
      suggestions
    );
    this.name = 'RetryExhaustedError';
    this.service = service;
    this.attempts = attempts;
  }

  service: string;
  attempts: number;
}

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
    'Content-Type': 'application/json',
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
  // Use crypto.randomUUID() for cryptographically secure, collision-resistant IDs
  // This ensures request IDs are unique and cannot be predicted for security tracing
  return `${ERROR_CONFIG.REQUEST_ID.PREFIX}${crypto.randomUUID()}`;
}

export const ERROR_SUGGESTIONS: Record<ErrorCode, string[]> = {
  VALIDATION_ERROR: [
    'Check that all required fields are present in your request',
    'Ensure field values match the expected format',
    'Verify that string lengths are within the allowed limits',
    'Check that UUIDs are properly formatted',
  ],
  RATE_LIMIT_EXCEEDED: [
    'Wait for the specified number of seconds before retrying',
    'Implement client-side rate limiting to avoid this error',
    'Reduce your request frequency',
    'Contact support for higher rate limits if needed',
  ],
  INTERNAL_ERROR: [
    'An unexpected error occurred on the server',
    'Check /api/health/detailed for system status',
    'Contact support with the requestId for assistance',
  ],
  EXTERNAL_SERVICE_ERROR: [
    'An external service (AI provider, database, etc.) returned an error',
    'The system will automatically retry this operation',
    'Check your API credentials for external services',
    'Monitor /api/health/detailed for service status',
  ],
  TIMEOUT_ERROR: [
    'The operation exceeded the time limit and was terminated',
    'Try again with a simpler or smaller request',
    'The system will automatically retry this operation',
    'Check if external services are experiencing high latency',
  ],
  AUTHENTICATION_ERROR: [
    'Authentication is required to access this resource',
    'Provide a valid authorization token in the Authorization header',
    'Check that your token has not expired',
    'Verify you have valid API credentials',
  ],
  AUTHORIZATION_ERROR: [
    'You do not have permission to access this resource',
    'Verify you have the appropriate role or permissions',
    'Contact the resource owner for access',
    'Check that you are accessing your own data',
  ],
  NOT_FOUND: [
    'The requested resource was not found',
    'Verify that the resource ID is correct',
    'Check if the session has expired',
    'Ensure you are using the correct endpoint',
  ],
  CONFLICT: [
    'A conflict occurred with the current state of the resource',
    'Check if a session already exists for this idea',
    'Resolve any concurrent modification conflicts',
    'Retry the operation with updated data',
  ],
  SERVICE_UNAVAILABLE: [
    'The service is temporarily unavailable',
    'Wait and retry with exponential backoff',
    'Check /api/health/detailed for system status and ETA',
    'Monitor for service recovery announcements',
  ],
  CIRCUIT_BREAKER_OPEN: [
    'The circuit breaker is open due to repeated failures',
    'Wait until the reset time specified in the error message',
    'The system will automatically test service recovery',
    'Use /api/health/detailed to monitor circuit breaker status',
  ],
  RETRY_EXHAUSTED: [
    'All retry attempts for the operation failed',
    'Check /api/health/detailed for service status',
    'Verify your API credentials and quotas for external services',
    'Contact support with the requestId if this persists',
  ],
};

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
    const message = error.message.toLowerCase();
    return (
      message.includes('timeout') ||
      message.includes('rate limit') ||
      message.includes('econnreset') ||
      message.includes('econnrefused') ||
      message.includes('etimedout') ||
      message.includes('enotfound')
    );
  }

  return false;
}

/**
 * Error context information extracted from an error
 * Used for structured logging and debugging
 */
export interface ErrorContext {
  /** Error name/type */
  name: string;
  /** Error message (redacted for PII) */
  message: string;
  /** Error code if available */
  code?: string;
  /** HTTP status code if available */
  statusCode?: number;
  /** Whether the error is retryable */
  retryable: boolean;
  /** Error fingerprint for deduplication */
  fingerprint?: string;
  /** Stack trace (first 3 lines, redacted) */
  stackPreview?: string;
  /** Original error type classification */
  classification: ErrorClassification;
  /** Timestamp when context was extracted */
  timestamp: string;
}

/**
 * Classification of error types for debugging and monitoring
 */
export type ErrorClassification =
  | 'app_error'
  | 'validation_error'
  | 'rate_limit_error'
  | 'external_service_error'
  | 'timeout_error'
  | 'network_error'
  | 'database_error'
  | 'auth_error'
  | 'unknown_error';

/**
 * Extract structured context from any error for logging and debugging
 * Safely handles unknown error types and redacts PII
 *
 * @param error - The error to extract context from
 * @param includeStack - Whether to include stack trace preview (default: true in dev, false in prod)
 * @returns Structured error context safe for logging
 *
 * @example
 * ```typescript
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   const context = extractErrorContext(error);
 *   logger.error('Operation failed', context);
 *   // Logs: { name: 'AppError', code: 'VALIDATION_ERROR', classification: 'app_error', ... }
 * }
 * ```
 */
export function extractErrorContext(
  error: unknown,
  includeStack?: boolean
): ErrorContext {
  const timestamp = new Date().toISOString();
  const shouldIncludeStack =
    includeStack ?? process.env.NODE_ENV !== 'production';

  // Handle AppError and subclasses
  if (error instanceof AppError) {
    const classification = classifyAppError(error);

    return {
      name: error.name,
      message: redactPII(error.message),
      code: error.code,
      statusCode: error.statusCode,
      retryable: error.retryable,
      fingerprint: error.fingerprint,
      stackPreview: shouldIncludeStack
        ? getStackPreview(error.stack)
        : undefined,
      classification,
      timestamp,
    };
  }

  // Handle standard Error
  if (error instanceof Error) {
    const classification = classifyStandardError(error);

    return {
      name: error.name,
      message: redactPII(error.message),
      retryable: isRetryableError(error),
      stackPreview: shouldIncludeStack
        ? getStackPreview(error.stack)
        : undefined,
      classification,
      timestamp,
    };
  }

  // Handle unknown error types
  return {
    name: 'UnknownError',
    message: 'An unknown error occurred',
    retryable: false,
    classification: 'unknown_error',
    timestamp,
  };
}

/**
 * Classify an AppError into a specific category
 */
function classifyAppError(error: AppError): ErrorClassification {
  if (error instanceof ValidationError) return 'validation_error';
  if (error instanceof RateLimitError) return 'rate_limit_error';
  if (error instanceof ExternalServiceError) return 'external_service_error';
  if (error instanceof TimeoutError) return 'timeout_error';
  if (error instanceof CircuitBreakerError) return 'external_service_error';
  if (error instanceof RetryExhaustedError) return 'external_service_error';

  // Classify by error code
  switch (error.code) {
    case ErrorCode.VALIDATION_ERROR:
      return 'validation_error';
    case ErrorCode.RATE_LIMIT_EXCEEDED:
      return 'rate_limit_error';
    case ErrorCode.EXTERNAL_SERVICE_ERROR:
      return 'external_service_error';
    case ErrorCode.TIMEOUT_ERROR:
      return 'timeout_error';
    case ErrorCode.AUTHENTICATION_ERROR:
    case ErrorCode.AUTHORIZATION_ERROR:
      return 'auth_error';
    case ErrorCode.INTERNAL_ERROR:
      return 'app_error';
    default:
      return 'app_error';
  }
}

/**
 * Classify a standard Error by analyzing its properties
 */
function classifyStandardError(error: Error): ErrorClassification {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  // Network errors
  if (
    message.includes('econnreset') ||
    message.includes('econnrefused') ||
    message.includes('enotfound') ||
    message.includes('network')
  ) {
    return 'network_error';
  }

  // Timeout errors
  if (message.includes('timeout') || name.includes('timeout')) {
    return 'timeout_error';
  }

  // Database errors (PostgreSQL/Supabase patterns)
  if (
    message.includes('database') ||
    message.includes('sql') ||
    message.includes('relation') ||
    message.includes('column') ||
    name.includes('database') ||
    name.includes('postgres')
  ) {
    return 'database_error';
  }

  // Auth errors
  if (
    message.includes('unauthorized') ||
    message.includes('unauthenticated') ||
    message.includes('forbidden') ||
    message.includes('invalid token') ||
    message.includes('jwt')
  ) {
    return 'auth_error';
  }

  // Rate limit errors
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'rate_limit_error';
  }

  // Validation errors
  if (
    message.includes('validation') ||
    message.includes('invalid') ||
    message.includes('required') ||
    name.includes('validation')
  ) {
    return 'validation_error';
  }

  return 'unknown_error';
}

/**
 * Get a preview of the stack trace (first 3 lines, redacted)
 */
function getStackPreview(stack?: string): string | undefined {
  if (!stack) return undefined;

  const lines = stack.split('\n').slice(0, 3);
  return lines.map((line) => redactPII(line.trim())).join('\n');
}

/**
 * Safely serialize an error for logging or API responses
 * Handles circular references and redacts PII
 *
 * @param error - The error to serialize
 * @returns A safe, serializable error object
 *
 * @example
 * ```typescript
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   // Safe to log or send to monitoring service
 *   console.log(JSON.stringify(serializeError(error)));
 * }
 * ```
 */
export function serializeError(error: unknown): Record<string, unknown> {
  const context = extractErrorContext(error, false);

  const serialized: Record<string, unknown> = {
    name: context.name,
    message: context.message,
    classification: context.classification,
    retryable: context.retryable,
    timestamp: context.timestamp,
  };

  if (context.code) serialized.code = context.code;
  if (context.statusCode) serialized.statusCode = context.statusCode;
  if (context.fingerprint) serialized.fingerprint = context.fingerprint;

  return serialized;
}

/**
 * Create a summary string from an error for quick logging
 *
 * @param error - The error to summarize
 * @returns A concise error summary string
 *
 * @example
 * ```typescript
 * logger.error(summarizeError(error));
 * // Output: "[AppError:VALIDATION_ERROR] Request validation failed (retryable: false)"
 * ```
 */
export function summarizeError(error: unknown): string {
  const context = extractErrorContext(error, false);

  const parts = [`${context.name}`];

  if (context.code) {
    parts.push(`:${context.code}`);
  }

  parts.push(`] ${context.message}`);

  if (context.statusCode) {
    parts.push(` (status: ${context.statusCode})`);
  }

  parts.push(` (retryable: ${context.retryable})`);

  return `[${parts.join('')}`;
}
