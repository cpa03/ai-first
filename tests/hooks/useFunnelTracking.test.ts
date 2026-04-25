import { renderHook } from '@testing-library/react';
import { useFunnelTracking } from '../../src/hooks/useFunnelTracking';

// Mock analytics to avoid side effects
jest.mock('../../src/lib/analytics', () => ({
  trackFunnelStep: jest.fn(),
  trackFunnelDropoff: jest.fn(),
  flush: jest.fn(),
}));

describe('useFunnelTracking stability', () => {
  it('should return a stable object when config does not change', () => {
    const config = { name: 'test_funnel', totalSteps: 5 };
    const { result, rerender } = renderHook(
      ({ cfg }) => useFunnelTracking(cfg),
      {
        initialProps: { cfg: config },
      }
    );

    const firstResult = result.current;

    // Rerender with the SAME config object reference
    rerender({ cfg: config });

    expect(result.current).toBe(firstResult);
  });

  it('should return a new object when config changes', () => {
    const config1 = { name: 'test_funnel_1', totalSteps: 5 };
    const config2 = { name: 'test_funnel_2', totalSteps: 5 };

    const { result, rerender } = renderHook(
      ({ cfg }) => useFunnelTracking(cfg),
      {
        initialProps: { cfg: config1 },
      }
    );

    const firstResult = result.current;

    // Rerender with a DIFFERENT config
    rerender({ cfg: config2 });

    expect(result.current).not.toBe(firstResult);
  });
});
