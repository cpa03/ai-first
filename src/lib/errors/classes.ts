/**
 * Error classes
 */

import { redactPII, redactPIIInObject } from '../pii-redaction';
import { STATUS_CODES, ERROR_CONFIG } from '../config/constants';
import { API_ROUTES } from '../config/api-routes';
import { generateId } from '../security/crypto';
import { ErrorCode } from './codes';
import { generateErrorFingerprint } from './fingerprint';

function generateRequestId(): string {
  return `${ERROR_CONFIG.REQUEST_ID.PREFIX}${generateId()}`;
}

export interface ErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

/**
 * Standardized API error response format.
 *
 * This is the canonical error response interface used across all API routes.
 * All error responses MUST conform to this shape to ensure consistent client-side handling.
 *
 * @example
 * ```json
 * {
 *   "success": false,
 *   "error": "Request validation failed",
 *   "code": "VALIDATION_ERROR",
 *   "fingerprint": "VkO8qJ3x...",
 *   "details": [
 *     { "field": "title", "message": "Title is required" }
 *   ],
 *   "timestamp": "2026-08-06T12:00:00.000Z",
 *   "requestId": "req_abc123",
 *   "retryable": false,
 *   "suggestions": [
 *     "Check that all required fields are present in your request"
 *   ]
 * }
 * ```
 *
 * @see {@link StandardErrorResponse} in api-handler/response.ts for the canonical definition
 */
export interface ErrorResponse {
  /** Always false for error responses */
  success: false;
  /** Human-readable error message */
  error: string;
  /** Machine-readable error code (e.g., VALIDATION_ERROR, NOT_FOUND) */
  code: string;
  /** Error fingerprint for deduplication and tracking (base64-encoded, 32 chars) */
  fingerprint: string;
  /** Optional field-level validation errors */
  details?: ErrorDetail[];
  /** ISO 8601 timestamp of when the error occurred */
  timestamp: string;
  /** Unique request identifier for tracing and support */
  requestId: string;
  /** Whether the operation can be safely retried */
  retryable: boolean;
  /** Optional suggestions for resolving the error */
  suggestions?: string[];
}

export class AppError extends Error {
  private _fingerprint?: string;
  private _requestId?: string;

  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly statusCode: number = STATUS_CODES.INTERNAL_ERROR,
    public readonly details?: ErrorDetail[],
    public readonly retryable: boolean = false,
    public readonly suggestions?: string[],
    requestId?: string
  ) {
    super(message);
    this.name = 'AppError';
    this._requestId = requestId;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
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
      success: false,
      error: redactPII(this.message),
      code: this.code,
      fingerprint: this.fingerprint,
      details: this.details
        ? (redactPIIInObject(this.details) as unknown as ErrorDetail[])
        : undefined,
      timestamp: new Date().toISOString(),
      requestId: this._requestId || generateRequestId(),
      retryable: this.retryable,
      suggestions: this.suggestions,
    };
  }

  get requestId(): string | undefined {
    return this._requestId;
  }

  setRequestId(requestId: string): this {
    this._requestId = requestId;
    return this;
  }
}

export class ValidationError extends AppError {
  constructor(details: ErrorDetail[], requestId?: string) {
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
      suggestions,
      requestId
    );
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends AppError {
  constructor(
    retryAfter: number,
    public readonly limit: number,
    public readonly remaining: number,
    requestId?: string
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
      suggestions,
      requestId
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
    public readonly originalError?: Error | null,
    requestId?: string
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
      suggestions,
      requestId
    );
    this.name = 'ExternalServiceError';
    this.service = service;
  }

  service: string;
}

export class TimeoutError extends AppError {
  constructor(
    message: string,
    public readonly timeoutMs: number,
    requestId?: string
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
      suggestions,
      requestId
    );
    this.name = 'TimeoutError';
  }
}

export class CircuitBreakerError extends AppError {
  constructor(service: string, resetTime: Date, requestId?: string) {
    const suggestions = [
      `Wait until ${resetTime.toISOString()} before retrying`,
      `The ${service} service is currently experiencing issues`,
      'System will automatically test service recovery',
      `Use ${API_ROUTES.HEALTH_DETAILED} to monitor service status`,
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
      suggestions,
      requestId
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
    public readonly originalError?: Error | null,
    requestId?: string
  ) {
    const suggestions = [
      `The operation failed after ${attempts} retry attempts`,
      `Check ${API_ROUTES.HEALTH_DETAILED} for service status`,
      `Verify your ${service} API credentials and quotas`,
      'Contact support with the requestId if this persists',
    ];
    super(
      `${message} after ${attempts} attempts`,
      ErrorCode.RETRY_EXHAUSTED,
      STATUS_CODES.BAD_GATEWAY,
      undefined,
      true,
      suggestions,
      requestId
    );
    this.name = 'RetryExhaustedError';
    this.service = service;
    this.attempts = attempts;
  }

  service: string;
  attempts: number;
}

/**
 * NotFoundError - Thrown when a requested resource does not exist.
 *
 * Use for: missing records, expired sessions, invalid IDs.
 * Status: 404
 * Retryable: No
 */
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string, requestId?: string) {
    const message = identifier
      ? `${resource} not found: ${identifier}`
      : `${resource} not found`;
    const details: ErrorDetail[] | undefined = identifier
      ? [
          {
            field: 'id',
            message: `${resource} with id '${identifier}' does not exist`,
          },
        ]
      : undefined;
    const suggestions = [
      `Verify the ${resource.toLowerCase()} ID is correct`,
      'Check if the resource has been deleted',
      'Ensure you are using the correct endpoint',
    ];
    super(
      message,
      ErrorCode.NOT_FOUND,
      STATUS_CODES.NOT_FOUND,
      details,
      false,
      suggestions,
      requestId
    );
    this.name = 'NotFoundError';
    this.resource = resource;
  }

  resource: string;
}

/**
 * AuthenticationError - Thrown when user is not authenticated.
 *
 * Use for: missing/invalid/expired tokens, unauthenticated access.
 * Status: 401
 * Retryable: No
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', requestId?: string) {
    const suggestions = [
      'Provide a valid authorization token in the Authorization header',
      'Check that your token has not expired',
      'Verify you have valid API credentials',
    ];
    super(
      message,
      ErrorCode.AUTHENTICATION_ERROR,
      STATUS_CODES.UNAUTHORIZED,
      undefined,
      false,
      suggestions,
      requestId
    );
    this.name = 'AuthenticationError';
  }
}

/**
 * AuthorizationError - Thrown when user lacks permission.
 *
 * Use for: insufficient permissions, ownership violations, role-based access.
 * Status: 403
 * Retryable: No
 */
export class AuthorizationError extends AppError {
  constructor(
    message: string = 'Insufficient permissions',
    details?: ErrorDetail[],
    requestId?: string
  ) {
    const suggestions = [
      'Verify you have the appropriate role or permissions',
      'Contact the resource owner for access',
      'Check that you are accessing your own data',
    ];
    super(
      message,
      ErrorCode.AUTHORIZATION_ERROR,
      STATUS_CODES.FORBIDDEN,
      details,
      false,
      suggestions,
      requestId
    );
    this.name = 'AuthorizationError';
  }
}

/**
 * ConflictError - Thrown when operation conflicts with current state.
 *
 * Use for: duplicate resources, concurrent modification, state conflicts.
 * Status: 409
 * Retryable: Sometimes (depends on conflict type)
 */
export class ConflictError extends AppError {
  constructor(
    message: string,
    details?: ErrorDetail[],
    retryable: boolean = false,
    requestId?: string
  ) {
    const suggestions = [
      'Check if a resource with this identifier already exists',
      'Resolve any concurrent modification conflicts',
      'Retry the operation with updated data',
    ];
    super(
      message,
      ErrorCode.CONFLICT,
      STATUS_CODES.CONFLICT,
      details,
      retryable,
      suggestions,
      requestId
    );
    this.name = 'ConflictError';
  }
}
