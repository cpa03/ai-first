import { ApiResponse } from '@/lib/api-handler';
import { TIMEOUT_CONFIG } from '@/lib/config/constants';

/**
 * Error class for API request failures
 * Provides structured error information from API responses
 */
export class ApiRequestError extends Error {
  public readonly code?: string;
  public readonly statusCode: number;
  public readonly requestId?: string;
  public readonly retryable: boolean;
  public readonly details?: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    statusCode: number,
    options?: {
      code?: string;
      requestId?: string;
      retryable?: boolean;
      details?: Array<{ field: string; message: string }>;
    }
  ) {
    super(message);
    this.name = 'ApiRequestError';
    this.statusCode = statusCode;
    this.code = options?.code;
    this.requestId = options?.requestId;
    this.retryable = options?.retryable ?? false;
    this.details = options?.details;
  }
}

export function unwrapApiResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error('Invalid API response: success must be true');
  }
  if (response.data === undefined) {
    throw new Error('Invalid API response: data is undefined');
  }
  return response.data;
}

export function unwrapApiResponseSafe<T>(
  response: ApiResponse<T> | null | undefined,
  defaultValue: T
): T {
  if (!response?.success || response.data === undefined) {
    return defaultValue;
  }
  return response.data;
}

/**
 * Fetch with timeout using AbortController
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param timeoutMs - Timeout in milliseconds (default: STANDARD timeout)
 * @param externalSignal - Optional external AbortSignal to combine with timeout
 * @returns Promise<Response>
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = TIMEOUT_CONFIG.STANDARD,
  externalSignal?: AbortSignal
): Promise<Response> {
  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  // Combine external signal with timeout signal if provided
  if (externalSignal) {
    if (externalSignal.aborted) {
      clearTimeout(timeoutId);
      throw new DOMException('The user aborted a request.', 'AbortError');
    }
    externalSignal.addEventListener('abort', () => {
      controller.abort();
      clearTimeout(timeoutId);
    });
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      if (timedOut) {
        throw new Error(`Request to ${url} timed out after ${timeoutMs}ms`);
      }
      throw new DOMException('The user aborted a request.', 'AbortError');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Options for apiRequest helper
 */
export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  /** Request body - will be JSON stringified if object */
  body?: unknown;
  /** Timeout in milliseconds (default: from TIMEOUT_CONFIG.STANDARD) */
  timeoutMs?: number;
  /** Whether to automatically unwrap the response (default: true) */
  unwrap?: boolean;
  /**
   * AbortSignal for request cancellation
   * Allows cancelling in-flight requests
   * @example
   * const controller = new AbortController();
   * apiRequest('/api/ideas', { signal: controller.signal });
   * // Later: controller.abort();
   */
  signal?: AbortSignal;
}

/**
 * Response from apiRequest helper
 */
export interface ApiRequestResult<T> {
  /** The response data (unwrapped if unwrap=true) */
  data: T;
  /** The raw response object */
  response: Response;
  /** Request ID from X-Request-ID header */
  requestId: string | null;
}

/**
 * High-level API request helper with automatic timeout, JSON handling, and error handling.
 *
 * @example
 * // Simple GET request with typed response
 * const { data } = await apiRequest<Idea[]>('/api/ideas');
 *
 * @example
 * // POST request with body
 * const { data, requestId } = await apiRequest<Idea>('/api/ideas', {
 *   method: 'POST',
 *   body: { idea: 'My new idea' }
 * });
 *
 * @example
 * // Without automatic unwrapping
 * const { data, response } = await apiRequest<ApiResponse<Idea>>('/api/ideas/123', {
 *   unwrap: false
 * });
 */
export async function apiRequest<T = unknown>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<ApiRequestResult<T>> {
  const { body, timeoutMs, unwrap = true, signal, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);

  if (body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const requestBody =
    body !== undefined
      ? typeof body === 'string'
        ? body
        : JSON.stringify(body)
      : undefined;

  const response = await fetchWithTimeout(
    url,
    {
      ...fetchOptions,
      headers,
      body: requestBody,
    },
    timeoutMs,
    signal
  );

  const requestId = response.headers.get('X-Request-ID');

  if (!response.ok) {
    let errorBody: {
      error?: string;
      code?: string;
      requestId?: string;
      retryable?: boolean;
      details?: Array<{ field: string; message: string }>;
    } = {};

    try {
      errorBody = await response.json();
    } catch {
      // Fall through to use status text
    }

    throw new ApiRequestError(
      errorBody.error || response.statusText || 'Request failed',
      response.status,
      {
        code: errorBody.code,
        requestId: errorBody.requestId || requestId || undefined,
        retryable: errorBody.retryable,
        details: errorBody.details,
      }
    );
  }

  const responseData = await response.json();

  if (unwrap && responseData.success === true && 'data' in responseData) {
    return {
      data: responseData.data as T,
      response,
      requestId,
    };
  }

  return {
    data: responseData as T,
    response,
    requestId,
  };
}
