'use client';

import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

interface UseCountUpOptions {
  target: number;
  duration?: number;
  delay?: number;
  decimals?: number;
}

/**
 * Smoothly animates a number from 0 to a target value.
 * Respects prefers-reduced-motion by instantly setting the value.
 */
export function useCountUp({
  target,
  duration = 600,
  delay = 0,
  decimals = 0,
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
