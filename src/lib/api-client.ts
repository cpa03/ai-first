import { ApiResponse } from '@/lib/api-handler';
import { TIMEOUT_CONFIG } from '@/lib/config/constants';
import { API_ERROR_MESSAGES } from '@/lib/config';
import { createLogger } from '@/lib/logger';

const apiClientLogger = createLogger('ApiClient');

/** Maximum retry attempts for the lightweight retry helper (initial + 2 retries). */
export const API_CLIENT_MAX_RETRIES = 2;
/** Base delay in ms for exponential backoff between retries. */
export const API_CLIENT_RETRY_BASE_DELAY_MS = 300;

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
    throw new Error(API_ERROR_MESSAGES.API_CLIENT.INVALID_RESPONSE_SUCCESS);
  }
  if (response.data === undefined) {
    throw new Error(API_ERROR_MESSAGES.API_CLIENT.INVALID_RESPONSE_DATA);
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
    externalSignal.addEventListener(
      'abort',
      () => {
        controller.abort();
        clearTimeout(timeoutId);
      },
      { once: true }
    );
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
        throw new Error(
          `${API_ERROR_MESSAGES.API_CLIENT.REQUEST_TIMEOUT} to ${url} after ${timeoutMs}ms`
        );
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
   * Number of retries for retryable failures (default: 0 = no retry).
   * Only retryable errors are retried: ApiRequestError with retryable=true,
   * HTTP 429/5xx, timeouts, and network failures. User aborts are never retried.
   * Capped at API_CLIENT_MAX_RETRIES to keep behavior bounded.
   */
  retries?: number;
  /** Base delay in ms for exponential backoff (default: API_CLIENT_RETRY_BASE_DELAY_MS) */
  retryDelayMs?: number;
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
 * Determine whether a failed request is safe to retry.
 * User-initiated aborts (AbortError) are never retryable.
 */
export function isRetryableRequestError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return false;
  }
  if (error instanceof ApiRequestError) {
    if (error.retryable) return true;
    return error.statusCode === 429 || error.statusCode >= 500;
  }
  if (error instanceof TypeError) {
    // fetch() network failures surface as TypeError
    return true;
  }
  if (
    error instanceof Error &&
    error.message.includes(API_ERROR_MESSAGES.API_CLIENT.REQUEST_TIMEOUT)
  ) {
    return true;
  }
  return false;
}

function getRetryDelayMs(attempt: number, baseDelayMs: number): number {
  const exponential = baseDelayMs * 2 ** attempt;
  const jitter = Math.random() * baseDelayMs;
  return exponential + jitter;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parse a Response body as JSON with an explicit, actionable error
 * instead of a raw SyntaxError on malformed payloads.
 */
async function parseJsonResponse(response: Response, url: string): Promise<unknown> {
  const rawText = await response.text();
  if (!rawText) {
    throw new ApiRequestError(
      `Empty response body from ${url} (status ${response.status})`,
      response.status,
      {
        requestId: response.headers.get('X-Request-ID') || undefined,
        retryable: response.status >= 500,
      }
    );
  }
  try {
    return JSON.parse(rawText);
  } catch {
    throw new ApiRequestError(
      `Invalid JSON response from ${url} (status ${response.status})`,
      response.status,
      {
        requestId: response.headers.get('X-Request-ID') || undefined,
        retryable: response.status >= 500,
      }
    );
  }
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
  const {
    body,
    timeoutMs,
    unwrap = true,
    signal,
    retries = 0,
    retryDelayMs = API_CLIENT_RETRY_BASE_DELAY_MS,
    ...fetchOptions
  } = options;
  const maxRetries = Math.min(Math.max(retries, 0), API_CLIENT_MAX_RETRIES);

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

  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await executeApiRequest<T>(url, fetchOptions, {
        headers,
        requestBody,
        timeoutMs,
        signal,
        unwrap,
      });
    } catch (error) {
      lastError = error;
      const canRetry =
        attempt < maxRetries && isRetryableRequestError(error) && !signal?.aborted;
      if (!canRetry) {
        throw error;
      }
      const delayMs = getRetryDelayMs(attempt, retryDelayMs);
      apiClientLogger.warnWithContext(
        `Retrying API request (attempt ${attempt + 2}/${maxRetries + 1})`,
        {
          component: 'ApiClient',
          action: 'apiRequest.retry',
          metadata: { url, delayMs },
        },
        error
      );
      await sleep(delayMs);
    }
  }
  throw lastError;
}

/**
 * Convenience wrapper around apiRequest with lightweight retry enabled
 * (max API_CLIENT_MAX_RETRIES retries, exponential backoff + jitter).
 * Only retryable failures are retried; user aborts are never retried.
 */
export async function apiRequestWithRetry<T = unknown>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<ApiRequestResult<T>> {
  return apiRequest<T>(url, {
    ...options,
    retries: options.retries ?? API_CLIENT_MAX_RETRIES,
  });
}

interface ExecutableRequestConfig {
  headers: Headers;
  requestBody: string | undefined;
  timeoutMs: number | undefined;
  signal: AbortSignal | undefined;
  unwrap: boolean;
}

async function executeApiRequest<T>(
  url: string,
  fetchOptions: Omit<ApiRequestOptions, 'body' | 'timeoutMs' | 'unwrap' | 'signal' | 'retries' | 'retryDelayMs'>,
  config: ExecutableRequestConfig
): Promise<ApiRequestResult<T>> {
  const response = await fetchWithTimeout(
    url,
    {
      ...fetchOptions,
      headers: config.headers,
      body: config.requestBody,
    },
    config.timeoutMs,
    config.signal
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
      errorBody = (await response.json()) as typeof errorBody;
    } catch {
      // Non-JSON error body - fall through to use status text
    }

    throw new ApiRequestError(
      errorBody.error ||
        response.statusText ||
        API_ERROR_MESSAGES.FALLBACK.REQUEST_FAILED,
      response.status,
      {
        code: errorBody.code,
        requestId: errorBody.requestId || requestId || undefined,
        retryable:
          errorBody.retryable ?? (response.status === 429 || response.status >= 500),
        details: errorBody.details,
      }
    );
  }

  const responseData = await parseJsonResponse(response, url);

  if (
    config.unwrap &&
    typeof responseData === 'object' &&
    responseData !== null &&
    (responseData as { success?: unknown }).success === true &&
    'data' in responseData
  ) {
    return {
      data: (responseData as { data: T }).data,
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
