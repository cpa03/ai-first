import { ApiResponse } from '@/lib/api-handler';
import { TIMEOUT_CONFIG } from '@/lib/config/constants';

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
 * @returns Promise<Response>
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = TIMEOUT_CONFIG.STANDARD
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request to ${url} timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
