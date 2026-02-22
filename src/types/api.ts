export type {
  ErrorResponse,
  ErrorDetail,
  ErrorContext,
  ErrorClassification,
} from '@/lib/errors';
export { ErrorCode } from '@/lib/errors';

export type { ApiResponse, ApiContext, ApiHandlerOptions } from '@/lib/api-handler';

export type HttpStatus = 200 | 201 | 204 | 400 | 401 | 403 | 404 | 409 | 429 | 500 | 502 | 503 | 504;

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  requestId: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
  fingerprint?: string;
  details?: Array<{ field?: string; message: string; code?: string }>;
  timestamp: string;
  requestId?: string;
  retryable?: boolean;
  suggestions?: string[];
}

export type ApiResult<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
  cursor?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    nextCursor?: string;
  };
}

export interface ApiRequestHeaders {
  'Content-Type': 'application/json';
  Authorization?: string;
  'X-Request-ID'?: string;
  'X-Correlation-ID'?: string;
}
