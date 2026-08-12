'use client';

import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';
import { COMPONENT_CONFIG } from '@/lib/config';

interface UseCountUpOptions {
  target: number;
  duration?: number;
  delay?: number;
  decimals?: number;
}

/**
 * Animates a number smoothly from its previous value to the target value.
 *
 * PERFORMANCE OPTIMIZATION (⚡ Bolt):
 * - Skips scheduling requestAnimationFrame loops if target is already equal to the current display value,
 *   completely avoiding redundant timer registrations and render cycles.
 * - Handles prefers-reduced-motion immediately to avoid any transition overhead for users with sensitivities.
 */
export function useCountUp({
  target,
  duration = COMPONENT_CONFIG.COUNT_UP.DEFAULT_DURATION_MS,
  delay = COMPONENT_CONFIG.COUNT_UP.DEFAULT_DELAY_MS,
  decimals = COMPONENT_CONFIG.COUNT_UP.DEFAULT_DECIMALS,
}: UseCountUpOptions) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [displayValue, setDisplayValue] = useState(0);
  const animationFrameRef = useRef<number | null>(null);
  const startValueRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const displayValueRef = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(target);
      displayValueRef.current = target;
      return;
    }

    // Skip animation if target value is already reached, preventing redundant RAF loop scheduling
    if (target === displayValueRef.current) {
      return;
    }

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    startValueRef.current = displayValueRef.current;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp + delay;
      }

      const elapsed = timestamp - startTimeRef.current;

      if (elapsed < 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current =
        startValueRef.current + (target - startValueRef.current) * eased;
      const rounded = Number(current.toFixed(decimals));

      displayValueRef.current = rounded;
      setDisplayValue(rounded);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        displayValueRef.current = target;
        setDisplayValue(target);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [target, duration, delay, decimals, prefersReducedMotion]);

  return { displayValue };
}
