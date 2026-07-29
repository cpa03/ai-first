import { renderHook, act } from '@testing-library/react';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

// Mock the prefers reduced motion hook
jest.mock('@/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: jest.fn(),
}));

describe('useAnimatedCounter', () => {
  let originalRAF: typeof window.requestAnimationFrame;
  let originalCAF: typeof window.cancelAnimationFrame;
  let rafCallbacks: Array<(time: number) => void> = [];
  let nextRafId = 1;

  beforeEach(() => {
    jest.clearAllMocks();
    (usePrefersReducedMotion as jest.Mock).mockReturnValue(false);

    // Save originals
    originalRAF = window.requestAnimationFrame;
    originalCAF = window.cancelAnimationFrame;

    rafCallbacks = [];
    nextRafId = 1;

    // Mock requestAnimationFrame to capture callbacks and run them on-demand
    window.requestAnimationFrame = jest.fn().mockImplementation((cb: (time: number) => void) => {
      rafCallbacks.push(cb);
      return nextRafId++;
    });

    window.cancelAnimationFrame = jest.fn().mockImplementation((id: number) => {
      // Clear callbacks or simple mock representation
    });

    jest.spyOn(performance, 'now').mockReturnValue(0);
  });

  afterEach(() => {
    window.requestAnimationFrame = originalRAF;
    window.cancelAnimationFrame = originalCAF;
    jest.restoreAllMocks();
  });

  function flushRAF(timestamp: number) {
    const currentCallbacks = [...rafCallbacks];
    rafCallbacks = [];
    act(() => {
      currentCallbacks.forEach((cb) => cb(timestamp));
    });
  }

  it('starts with the target value as initial display value on first render', () => {
    const { result } = renderHook(() => useAnimatedCounter(10));
    expect(result.current).toBe(10);
  });

  it('smoothly animates when target value increases', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useAnimatedCounter(value, { duration: 100 }),
      { initialProps: { value: 10 } }
    );

    expect(result.current).toBe(10);

    // Trigger an increase to 100
    rerender({ value: 100 });

    // Should schedule animation
    expect(window.requestAnimationFrame).toHaveBeenCalled();

    // Advance mock time and flush RAF
    jest.spyOn(performance, 'now').mockReturnValue(50); // 50% through duration
    flushRAF(50);

    // Eased value at 50% is: 10 + (90 * eased(0.5))
    // eased = 1 - (1 - 0.5)^3 = 1 - 0.125 = 0.875
    // Value = 10 + 90 * 0.875 = 10 + 78.75 = 89 rounded
    expect(result.current).toBe(89);

    // Finalize the animation
    jest.spyOn(performance, 'now').mockReturnValue(100);
    flushRAF(100);

    expect(result.current).toBe(100);
  });

  it('immediately returns target value when prefers-reduced-motion is active', () => {
    (usePrefersReducedMotion as jest.Mock).mockReturnValue(true);

    const { result, rerender } = renderHook(
      ({ value }) => useAnimatedCounter(value, { duration: 100 }),
      { initialProps: { value: 10 } }
    );

    expect(result.current).toBe(10);

    rerender({ value: 100 });

    // Should NOT schedule any animation frame
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
    // Display value should immediately be 100
    expect(result.current).toBe(100);
  });

  it('skips animation if targetValue remains unchanged', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useAnimatedCounter(value, { duration: 100 }),
      { initialProps: { value: 10 } }
    );

    expect(result.current).toBe(10);

    // Rerender with the same value
    rerender({ value: 10 });

    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
    expect(result.current).toBe(10);
  });
});
