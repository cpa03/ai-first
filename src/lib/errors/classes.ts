/**
 * Error classes
 */

import { redactPII, redactPIIInObject } from '../pii-redaction';
import { STATUS_CODES } from '../config/constants';
import { API_ROUTES } from '../config/api-routes';
import { ErrorCode } from './codes';
import { generateErrorFingerprint } from './fingerprint';
import { ErrorDetail, ErrorResponse } from './types';

// Re-export types for backward compatibility
export type { ErrorDetail, ErrorResponse };

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
    public readonly originalError?: Error | null
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
    public readonly originalError?: Error | null
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
      suggestions
    );
    this.name = 'RetryExhaustedError';
    this.service = service;
    this.attempts = attempts;
  }

  service: string;
  attempts: number;
}
