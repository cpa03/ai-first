import { ApiResponse } from '@/lib/api-handler';

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
