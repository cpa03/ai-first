import { redactPII, redactPIIInObject } from './pii-redaction';

export interface ErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ErrorResponse {
  error: string;
  code: string;
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
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly statusCode: number = 500,
    public readonly details?: ErrorDetail[],
    public readonly retryable: boolean = false,
    public readonly suggestions?: string[]
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): ErrorResponse {
    return {
      error: redactPII(this.message),
      code: this.code,
      details: this.details
        ? (redactPIIInObject(this.details) as ErrorDetail[])
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
      400,
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
    super(
      `Rate limit exceeded. Retry after ${retryAfter} seconds`,
      ErrorCode.RATE_LIMIT_EXCEEDED,
      429,
      undefined,
      true,
      suggestions
    );
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }

  retryAfter: number;

  toJSON(): ErrorResponse {
    return {
      error: redactPII(this.message),
      code: this.code,
      details: redactPIIInObject([
        {
          message: `Limit: ${this.limit}, Remaining: ${this.remaining}`,
        },
      ]) as ErrorDetail[],
      timestamp: new Date().toISOString(),
      retryable: true,
      suggestions: this.suggestions,
    };
  }
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
      502,
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
    super(message, ErrorCode.TIMEOUT_ERROR, 504, undefined, true, suggestions);
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
    super(
      `Circuit breaker open for ${service}. Retry after ${resetTime.toISOString()}`,
      ErrorCode.CIRCUIT_BREAKER_OPEN,
      503,
      undefined,
      true,
      suggestions
    );
    this.name = 'CircuitBreakerError';
    this.service = service;
    this.resetTime = resetTime;
  }

  service: string;
  resetTime: Date;

  toJSON(): ErrorResponse {
    return {
      error: redactPII(this.message),
      code: this.code,
      timestamp: new Date().toISOString(),
      retryable: true,
      suggestions: this.suggestions,
    };
  }
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
      502,
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

export function toErrorResponse(error: unknown, requestId?: string): Response {
  let appError: AppError;
  let statusCode = 500;

  if (error instanceof AppError) {
    appError = error;
    statusCode = appError.statusCode;
  } else if (error instanceof Error) {
    appError = new AppError(
      redactPII(error.message),
      ErrorCode.INTERNAL_ERROR,
      500,
      undefined,
      false
    );
  } else {
    appError = new AppError(
      'Unknown error occurred',
      ErrorCode.INTERNAL_ERROR,
      500,
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
    'X-Retryable': String(appError.retryable),
  };

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
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
  statusCode: number = 500,
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
