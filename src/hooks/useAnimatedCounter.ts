'use client';

import { useEffect, useRef, useState } from 'react';

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
 * @param targetValue - The value to animate towards
 * @param options - Configuration options
 * @returns The animated value
 */
export function useAnimatedCounter(
  targetValue: number,
  options: UseAnimatedCounterOptions = {}
): number {
  const { duration = 150, respectReducedMotion = true } = options;
  const [displayValue, setDisplayValue] = useState(targetValue);
  const animationRef = useRef<number | null>(null);
  const previousValueRef = useRef(targetValue);
  const prefersReducedMotionRef = useRef(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotionRef.current = mediaQuery.matches;

    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    // Skip animation if reduced motion is preferred
    if (respectReducedMotion && prefersReducedMotionRef.current) {
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
  }, [targetValue, duration, respectReducedMotion]);

  return displayValue;
}
