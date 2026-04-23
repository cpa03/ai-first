import { renderHook } from '@testing-library/react';
import { useFunnelTracking } from '@/hooks/useFunnelTracking';

// Mock analytics to avoid side effects
jest.mock('@/lib/analytics', () => ({
  trackFunnelStep: jest.fn(),
  trackFunnelDropoff: jest.fn(),
  flush: jest.fn(),
}));

describe('useFunnelTracking', () => {
  const defaultConfig = {
    name: 'test_funnel',
    totalSteps: 3,
  };

  it('should maintain stable identity across re-renders with same config', () => {
    const { result, rerender } = renderHook(
      ({ config }) => useFunnelTracking(config),
      {
        initialProps: { config: defaultConfig },
      }
    );

    const firstRenderResult = result.current;

    // Rerender with same config object (identity change of config prop, but same values)
    rerender({ config: { ...defaultConfig } });

    // Note: because name and totalSteps are in dependencies of useCallback,
    // and we passed a new config object, but name and totalSteps are the same values.
    // wait, if we pass a new config object, name and totalSteps are destructuring from it:
    // const { name, totalSteps, trackDropoffOnUnmount = true } = config;
    // They are used in dependency arrays of useCallbacks.

    expect(result.current).toBe(firstRenderResult);
  });

  it('should change identity when config name changes', () => {
    const { result, rerender } = renderHook(
      ({ config }) => useFunnelTracking(config),
      {
        initialProps: { config: defaultConfig },
      }
    );

    const firstRenderResult = result.current;

    rerender({ config: { ...defaultConfig, name: 'new_funnel' } });

    expect(result.current).not.toBe(firstRenderResult);
  });

  it('should change identity when totalSteps changes', () => {
    const { result, rerender } = renderHook(
      ({ config }) => useFunnelTracking(config),
      {
        initialProps: { config: defaultConfig },
      }
    );

    const firstRenderResult = result.current;

    rerender({ config: { ...defaultConfig, totalSteps: 5 } });

    expect(result.current).not.toBe(firstRenderResult);
  });

  it('should return all expected functions', () => {
    const { result } = renderHook(() => useFunnelTracking(defaultConfig));

    expect(typeof result.current.completeStep).toBe('function');
    expect(typeof result.current.markDropoff).toBe('function');
    expect(typeof result.current.reset).toBe('function');
    expect(typeof result.current.getCurrentStep).toBe('function');
  });
});
