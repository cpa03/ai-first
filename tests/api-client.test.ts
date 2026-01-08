import type { ApiResponse } from '@/lib/api-handler';
import { unwrapApiResponse, unwrapApiResponseSafe } from '@/lib/api-client';

interface TestData {
  message: string;
  count: number;
}

describe('api-client utilities', () => {
  describe('unwrapApiResponse', () => {
    it('should unwrap valid API response', () => {
      const response = {
        success: true,
        data: { message: 'test', count: 42 },
        requestId: 'req_123',
        timestamp: '2024-01-08T00:00:00Z',
      } as ApiResponse<TestData>;
      const result = unwrapApiResponse<TestData>(response);
      expect(result).toEqual({ message: 'test', count: 42 });
    });

    it('should throw error when success is false', () => {
      const response = {
        success: false,
        data: { message: 'test', count: 42 },
        requestId: 'req_123',
        timestamp: '2024-01-08T00:00:00Z',
      } as unknown as ApiResponse<TestData>;
      expect(() => unwrapApiResponse<TestData>(response)).toThrow(
        'Invalid API response: success must be true'
      );
    });

    it('should throw error when data is undefined', () => {
      const response = {
        success: true,
        data: undefined,
        requestId: 'req_123',
        timestamp: '2024-01-08T00:00:00Z',
      } as unknown as ApiResponse<TestData>;
      expect(() => unwrapApiResponse<TestData>(response)).toThrow(
        'Invalid API response: data is undefined'
      );
    });
  });

  describe('unwrapApiResponseSafe', () => {
    it('should unwrap valid API response', () => {
      const response = {
        success: true,
        data: { message: 'test', count: 42 },
        requestId: 'req_123',
        timestamp: '2024-01-08T00:00:00Z',
      } as ApiResponse<TestData>;
      const result = unwrapApiResponseSafe<TestData>(response, {
        message: '',
        count: 0,
      });
      expect(result).toEqual({ message: 'test', count: 42 });
    });

    it('should return default value when response is null', () => {
      const defaultValue = { message: 'default', count: 0 };
      const result = unwrapApiResponseSafe<TestData>(null, defaultValue);
      expect(result).toEqual(defaultValue);
    });

    it('should return default value when response is undefined', () => {
      const defaultValue = { message: 'default', count: 0 };
      const result = unwrapApiResponseSafe<TestData>(undefined, defaultValue);
      expect(result).toEqual(defaultValue);
    });

    it('should return default value when success is false', () => {
      const response = {
        success: false,
        data: { message: 'test', count: 42 },
        requestId: 'req_123',
        timestamp: '2024-01-08T00:00:00Z',
      } as unknown as ApiResponse<TestData>;
      const defaultValue = { message: 'default', count: 0 };
      const result = unwrapApiResponseSafe<TestData>(response, defaultValue);
      expect(result).toEqual(defaultValue);
    });

    it('should return default value when data is undefined', () => {
      const response = {
        success: true,
        data: undefined,
        requestId: 'req_123',
        timestamp: '2024-01-08T00:00:00Z',
      } as unknown as ApiResponse<TestData>;
      const defaultValue = { message: 'default', count: 0 };
      const result = unwrapApiResponseSafe<TestData>(response, defaultValue);
      expect(result).toEqual(defaultValue);
    });
  });
});
