'use client';

import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';
import { COMPONENT_CONFIG } from '@/lib/config';

interface UseCountUpOptions {
  target: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  /**
   * Value displayed on first render (no animation on mount).
   * Defaults to 0 (count-up from zero). Pass the current target to
   * start at the target and only animate on subsequent changes
   * (previous `useAnimatedCounter` behavior).
   */
  initialValue?: number;
  /**
   * Whether to skip animation when the user prefers reduced motion.
   * Defaults to true. Set to false to force animation.
   */
  respectReducedMotion?: boolean;
}

interface UseCountUpReturn {
  displayValue: number;
  isAnimating: boolean;
}

/**
 * Canonical counting hook (Wave 2C unification).
 *
 * Supports two call signatures for backward compatibility:
 *   1. useCountUp(target, options?) — legacy useAnimatedCounter style
 *   2. useCountUp({ target, ...options }) — object options style
 *
 * Returns { displayValue, isAnimating }.
 *
 * PERFORMANCE OPTIMIZATION (⚡ Bolt):
 * - Skips scheduling requestAnimationFrame loops if target is already equal to the current display value,
 *   completely avoiding redundant timer registrations and render cycles.
 * - Handles prefers-reduced-motion immediately to avoid any transition overhead for users with sensitivities.
 */
export function useCountUp(
  target: number,
  options?: UseCountUpOptions
): UseCountUpReturn;

export function useCountUp(
  options: UseCountUpOptions
): UseCountUpReturn;

export function useCountUp(
  targetOrOptions: number | UseCountUpOptions,
  options?: UseCountUpOptions
): UseCountUpReturn {
  // Normalize arguments to support both call signatures
  const isObject = typeof targetOrOptions === 'object';
  const target = isObject ? targetOrOptions.target : targetOrOptions;
  const mergedOptions = isObject ? targetOrOptions : (options ?? {});

  const {
    duration = COMPONENT_CONFIG.COUNT_UP.DEFAULT_DURATION_MS,
    delay = COMPONENT_CONFIG.COUNT_UP.DEFAULT_DELAY_MS,
    decimals = COMPONENT_CONFIG.COUNT_UP.DEFAULT_DECIMALS,
    initialValue = 0,
    respectReducedMotion = true,
  } = mergedOptions;

  const prefersReducedMotion = usePrefersReducedMotion();
  const reduceMotion = respectReducedMotion && prefersReducedMotion;
  const [displayValue, setDisplayValue] = useState(initialValue);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const startValueRef = useRef(initialValue);
  const startTimeRef = useRef<number | null>(null);
  const displayValueRef = useRef(initialValue);

  useEffect(() => {
    if (reduceMotion) {
      setDisplayValue(target);
      displayValueRef.current = target;
      setIsAnimating(false);
      return;
    }

    // Skip animation if target value is already reached, preventing redundant RAF loop scheduling
    if (target === displayValueRef.current) {
      setIsAnimating(false);
      return;
    }

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    startValueRef.current = displayValueRef.current;
    startTimeRef.current = null;
    setIsAnimating(true);

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
        setIsAnimating(false);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setIsAnimating(false);
    };
  }, [target, duration, delay, decimals, reduceMotion]);

  return { displayValue, isAnimating };
}
