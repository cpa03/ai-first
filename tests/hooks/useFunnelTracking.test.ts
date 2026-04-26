import { renderHook } from '@testing-library/react';
import { useFunnelTracking } from '../../src/hooks/useFunnelTracking';

// Mock analytics to prevent actual tracking during tests
jest.mock('../../src/lib/analytics', () => ({
  trackFunnelStep: jest.fn(),
  trackFunnelDropoff: jest.fn(),
  flush: jest.fn(),
}));

describe('useFunnelTracking', () => {
  const mockConfig = {
    name: 'test_funnel',
    totalSteps: 3,
  };

  it('should maintain referential stability of the return object', () => {
    const { result, rerender } = renderHook(() => useFunnelTracking(mockConfig));

    const firstRenderResult = result.current;

    // Rerender with the same config
    rerender();

    expect(result.current).toBe(firstRenderResult);
  });

  it('should maintain referential stability of functions', () => {
    const { result, rerender } = renderHook(() => useFunnelTracking(mockConfig));

    const { completeStep, markDropoff, reset, getCurrentStep } = result.current;

    rerender();

    expect(result.current.completeStep).toBe(completeStep);
    expect(result.current.markDropoff).toBe(markDropoff);
    expect(result.current.reset).toBe(reset);
    expect(result.current.getCurrentStep).toBe(getCurrentStep);
  });

  it('should update referential identity when config changes', () => {
    const { result, rerender } = renderHook(({ config }) => useFunnelTracking(config), {
      initialProps: { config: mockConfig },
    });

    const firstRenderResult = result.current;

    // Rerender with a different config
    rerender({
      config: {
        name: 'different_funnel',
        totalSteps: 5,
      },
    });

    expect(result.current).not.toBe(firstRenderResult);
  });
});
