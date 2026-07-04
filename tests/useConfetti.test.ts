import { renderHook, act } from '@testing-library/react';
import { useConfetti } from '@/hooks/useConfetti';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

// Mock the prefers reduced motion hook
jest.mock('@/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: jest.fn(),
}));

describe('useConfetti', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePrefersReducedMotion as jest.Mock).mockReturnValue(false);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts with an empty particles array', () => {
    const { result } = renderHook(() => useConfetti());
    expect(result.current.particles).toEqual([]);
  });

  it('generates particles when fire() is called', () => {
    const { result } = renderHook(() => useConfetti());

    act(() => {
      result.current.fire();
    });

    expect(result.current.particles.length).toBeGreaterThan(0);
    expect(result.current.particles[0]).toHaveProperty('id');
    expect(result.current.particles[0]).toHaveProperty('x');
    expect(result.current.particles[0]).toHaveProperty('y');
  });

  it('cleans up particles after duration', () => {
    const { result } = renderHook(() => useConfetti());

    act(() => {
      result.current.fire();
    });

    expect(result.current.particles.length).toBeGreaterThan(0);

    act(() => {
      jest.advanceTimersByTime(5000); // Default cleanup is 3000ms
    });

    expect(result.current.particles).toEqual([]);
  });

  it('does not generate particles if prefers-reduced-motion is true', () => {
    (usePrefersReducedMotion as jest.Mock).mockReturnValue(true);
    const { result } = renderHook(() => useConfetti());

    act(() => {
      result.current.fire();
    });

    expect(result.current.particles).toEqual([]);
  });
});
