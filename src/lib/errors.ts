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
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): ErrorResponse {
    return {
      error: this.message,
      code: this.code,
      details: this.details,
      timestamp: new Date().toISOString(),
      retryable: this.retryable,
    };
  }
}

export class ValidationError extends AppError {
  constructor(details: ErrorDetail[]) {
    super(
      'Request validation failed',
      ErrorCode.VALIDATION_ERROR,
      400,
      details
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
    super(
      `Rate limit exceeded. Retry after ${retryAfter} seconds`,
      ErrorCode.RATE_LIMIT_EXCEEDED,
      429,
      undefined,
      true
    );
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }

  retryAfter: number;

  toJSON(): ErrorResponse {
    return {
      error: this.message,
      code: this.code,
      details: [
        {
          message: `Limit: ${this.limit}, Remaining: ${this.remaining}`,
        },
      ],
      timestamp: new Date().toISOString(),
      retryable: true,
    };
  }
}

export class ExternalServiceError extends AppError {
  constructor(
    message: string,
    service: string,
    public readonly originalError?: Error
  ) {
    super(
      `External service error: ${service} - ${message}`,
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      502,
      undefined,
      true
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
    super(message, ErrorCode.TIMEOUT_ERROR, 504, undefined, true);
    this.name = 'TimeoutError';
  }
}

export class CircuitBreakerError extends AppError {
  constructor(service: string, resetTime: Date) {
    super(
      `Circuit breaker open for ${service}. Retry after ${resetTime.toISOString()}`,
      ErrorCode.CIRCUIT_BREAKER_OPEN,
      503,
      undefined,
      true
    );
    this.name = 'CircuitBreakerError';
    this.service = service;
    this.resetTime = resetTime;
  }

  service: string;
  resetTime: Date;

  toJSON(): ErrorResponse {
    return {
      error: this.message,
      code: this.code,
      timestamp: new Date().toISOString(),
      retryable: true,
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
    super(
      `${message} after ${attempts} attempts`,
      ErrorCode.RETRY_EXHAUSTED,
      502,
      undefined,
      true
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
      error.message,
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
