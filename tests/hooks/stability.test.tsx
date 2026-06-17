import { renderHook } from '@testing-library/react';
import { useSessionDuration } from '@/hooks/useSessionDuration';
import { useNotificationPermission } from '@/hooks/useNotificationPermission';
import { useClarificationSession } from '@/hooks/useClarificationSession';

// Mock api-client
jest.mock('@/lib/api-client', () => ({
  fetchWithTimeout: jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      success: true,
      data: { questions: [] },
    }),
  }),
}));

// Mock analytics to prevent errors
jest.mock('@/lib/analytics', () => ({
  trackFunnelStep: jest.fn(),
  trackFunnelDropoff: jest.fn(),
  flush: jest.fn(),
}));

// Mock session-analytics to prevent errors
jest.mock('@/lib/session-analytics', () => ({
  trackSessionStart: jest.fn(),
  trackSessionEnd: jest.fn(),
  trackPageTime: jest.fn(),
  flush: jest.fn(),
}));

// Mock logger
jest.mock('@/lib/logger', () => ({
  createLogger: jest.fn(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    warnWithContext: jest.fn(),
    errorWithContext: jest.fn(),
  })),
}));

// Mock db
jest.mock('@/lib/db', () => ({
  supabaseClient: {
    auth: {
      getSession: jest
        .fn()
        .mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest
        .fn()
        .mockReturnValue({
          data: { subscription: { unsubscribe: jest.fn() } },
        }),
    },
  },
}));

describe('Referential Stability', () => {
  describe('useSessionDuration', () => {
    it('maintains referential stability of returned object and functions', () => {
      const { result, rerender } = renderHook(() => useSessionDuration());

      const firstRenderResult = result.current;

      rerender();

      expect(result.current).toBe(firstRenderResult);
      expect(result.current.getSessionDuration).toBe(
        firstRenderResult.getSessionDuration
      );
      expect(result.current.getPageDuration).toBe(
        firstRenderResult.getPageDuration
      );
    });
  });

  describe('useNotificationPermission', () => {
    it('maintains referential stability of returned object and functions', () => {
      const { result, rerender } = renderHook(() =>
        useNotificationPermission()
      );

      const firstRenderResult = result.current;

      rerender();

      expect(result.current).toBe(firstRenderResult);
      expect(result.current.requestPermission).toBe(
        firstRenderResult.requestPermission
      );
      expect(result.current.checkPermission).toBe(
        firstRenderResult.checkPermission
      );
    });
  });

  describe('useClarificationSession', () => {
    it('maintains referential stability of returned object and functions', () => {
      const mockOnComplete = jest.fn().mockResolvedValue(undefined);
      const { result, rerender } = renderHook(() =>
        useClarificationSession('Idea', 'id-123', mockOnComplete)
      );

      const firstRenderResult = result.current;

      rerender();

      expect(result.current).toBe(firstRenderResult);
      expect(result.current.handleNext).toBe(firstRenderResult.handleNext);
      expect(result.current.handlePrevious).toBe(
        firstRenderResult.handlePrevious
      );
      expect(result.current.handleKeyDown).toBe(
        firstRenderResult.handleKeyDown
      );
      expect(result.current.setCurrentAnswer).toBe(
        firstRenderResult.setCurrentAnswer
      );
    });
  });
});
