/**
 * Shared error types
 */

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
