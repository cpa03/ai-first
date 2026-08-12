import { renderHook, act } from '@testing-library/react';
import { useCountUp } from '@/hooks/useCountUp';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

// Mock the prefers reduced motion hook
jest.mock('@/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: jest.fn(),
}));

describe('useCountUp Hook', () => {
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
    window.requestAnimationFrame = jest
      .fn()
      .mockImplementation((cb: (time: number) => void) => {
        rafCallbacks.push(cb);
        return nextRafId++;
      });

    window.cancelAnimationFrame = jest.fn().mockImplementation((id: number) => {
      // Clear callbacks or simple mock representation
    });
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

  it('starts with 0 as initial display value on first render', () => {
    const { result } = renderHook(() => useCountUp({ target: 100 }));
    expect(result.current.displayValue).toBe(0);
  });

  it('smoothly animates from current value to target value', () => {
    const { result, rerender } = renderHook(
      ({ target }) => useCountUp({ target, duration: 100, delay: 0 }),
      { initialProps: { target: 10 } }
    );

    expect(result.current.displayValue).toBe(0);

    // Initial frame at t=0
    flushRAF(0);
    expect(result.current.displayValue).toBe(0);

    // Progress at t=50 (50% through duration)
    // eased = 1 - (1 - 0.5)^3 = 1 - 0.125 = 0.875
    // current = 0 + (10 - 0) * 0.875 = 8.75 -> 9
    flushRAF(50);
    expect(result.current.displayValue).toBe(9);

    // Finalize frame at t=100
    flushRAF(100);
    expect(result.current.displayValue).toBe(10);
  });

  it('immediately returns target value when prefers-reduced-motion is active', () => {
    (usePrefersReducedMotion as jest.Mock).mockReturnValue(true);

    const { result, rerender } = renderHook(
      ({ target }) => useCountUp({ target, duration: 100, delay: 0 }),
      { initialProps: { target: 10 } }
    );

    expect(result.current.displayValue).toBe(10);

    // Rerender with new target
    rerender({ target: 50 });

    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
    expect(result.current.displayValue).toBe(50);
  });

  it('skips animation if targetValue is already equal to the display value', () => {
    const { result, rerender } = renderHook(
      ({ target }) => useCountUp({ target, duration: 100, delay: 0 }),
      { initialProps: { target: 10 } }
    );

    expect(result.current.displayValue).toBe(0);

    // Animate to 10
    flushRAF(0);
    flushRAF(100);
    expect(result.current.displayValue).toBe(10);

    // Reset requestAnimationFrame call count
    (window.requestAnimationFrame as jest.Mock).mockClear();

    // Rerender with the same target value (10)
    rerender({ target: 10 });

    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
    expect(result.current.displayValue).toBe(10);
  });
});
