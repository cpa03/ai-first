import { renderHook } from '@testing-library/react';
import { useFunnelTracking } from '@/hooks/useFunnelTracking';
import { useSessionDuration } from '@/hooks/useSessionDuration';
import { useNotificationPermission } from '@/hooks/useNotificationPermission';

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
  })),
}));

// Mock db
jest.mock('@/lib/db', () => ({
  supabaseClient: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    },
  },
}));

describe('Referential Stability', () => {
  describe('useFunnelTracking', () => {
    it('maintains referential stability of returned object and functions', () => {
      const config = { name: 'test-funnel', totalSteps: 3 };
      const { result, rerender } = renderHook(() => useFunnelTracking(config));

      const firstRenderResult = result.current;

      rerender();

      expect(result.current).toBe(firstRenderResult);
      expect(result.current.completeStep).toBe(firstRenderResult.completeStep);
      expect(result.current.markDropoff).toBe(firstRenderResult.markDropoff);
      expect(result.current.reset).toBe(firstRenderResult.reset);
      expect(result.current.getCurrentStep).toBe(firstRenderResult.getCurrentStep);
    });
  });

  describe('useSessionDuration', () => {
    it('maintains referential stability of returned object and functions', () => {
      const { result, rerender } = renderHook(() => useSessionDuration());

      const firstRenderResult = result.current;

      rerender();

      expect(result.current).toBe(firstRenderResult);
      expect(result.current.getSessionDuration).toBe(firstRenderResult.getSessionDuration);
      expect(result.current.getPageDuration).toBe(firstRenderResult.getPageDuration);
    });
  });

  describe('useNotificationPermission', () => {
    it('maintains referential stability of returned object and functions', () => {
      const { result, rerender } = renderHook(() => useNotificationPermission());

      const firstRenderResult = result.current;

      rerender();

      expect(result.current).toBe(firstRenderResult);
      expect(result.current.requestPermission).toBe(firstRenderResult.requestPermission);
      expect(result.current.checkPermission).toBe(firstRenderResult.checkPermission);
    });
  });
});
