'use client';

import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';
import { UI_CONFIG } from '@/lib/config';

interface UseAnimatedCounterOptions {
  /** Duration of the animation in milliseconds */
  duration?: number;
  /** Whether to respect prefers-reduced-motion */
  respectReducedMotion?: boolean;
}

/**
 * Animates a number value smoothly from its previous value to the new value.
 * Useful for scroll percentages, progress indicators, and counters.
 *
 * PERFORMANCE OPTIMIZATION (⚡ Bolt):
 * - Reuses the globally-cached matchMedia listener from `usePrefersReducedMotion` (via useSyncExternalStore).
 * - Avoids allocating and deallocating matchMedia change listeners and callbacks per component instance.
 * - Drastically lowers garbage collection overhead and memory footprints when multiple counters co-exist.
 *
 * @param targetValue - The value to animate towards
 * @param options - Configuration options
 * @returns The animated value
 */
export function useAnimatedCounter(
  targetValue: number,
  options: UseAnimatedCounterOptions = {}
): number {
  const {
    duration = UI_CONFIG.ANIMATION.DURATION.FAST,
    respectReducedMotion = true,
  } = options;

  // Use the shared, high-performance usePrefersReducedMotion hook
  const prefersReducedMotion = usePrefersReducedMotion();

  const [displayValue, setDisplayValue] = useState(targetValue);
  const animationRef = useRef<number | null>(null);
  const previousValueRef = useRef(targetValue);

  useEffect(() => {
    // Skip animation if reduced motion is preferred
    if (respectReducedMotion && prefersReducedMotion) {
      setDisplayValue(targetValue);
      previousValueRef.current = targetValue;
      return;
    }

    // Skip animation if value hasn't changed
    if (targetValue === previousValueRef.current) {
      return;
    }

    const startValue = previousValueRef.current;
    const startTime = performance.now();
    const difference = targetValue - startValue;

    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);

      const currentValue = Math.round(startValue + difference * eased);
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        previousValueRef.current = targetValue;
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, duration, respectReducedMotion, prefersReducedMotion]);

  return displayValue;
}
