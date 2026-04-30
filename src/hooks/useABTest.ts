/**
 * useABTest Hook
 *
 * React hook for accessing A/B test assignments in components.
 * Provides easy access to variant assignments.
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getAssignment, ABAssignment, AB_TEST_CONFIG } from '@/lib/ab-test';

/**
 * Hook options
 */
export interface UseABTestOptions {
  /** Whether to enable the experiment */
  enabled?: boolean;
}

/**
 * Return value from useABTest
 */
export interface UseABTestResult {
  /** The assigned variant ID (or null if not in experiment) */
  variant: string | null;
  /** Whether the variant is 'control' */
  isControl: boolean;
  /** Whether the user is in a specific variant */
  isInVariant: (variantId: string) => boolean;
  /** Whether the experiment is enabled */
  isEnabled: boolean;
  /** Whether the assignment has been loaded (false on server) */
  isLoaded: boolean;
  /** The full assignment object */
  assignment: ABAssignment | null;
}

/**
 * A/B Test Hook
 *
 * @param experimentKey - The experiment key from AB_TESTS
 * @param options - Hook options
 */
export function useABTest(
  experimentKey: string,
  options: UseABTestOptions = {}
): UseABTestResult {
  const { enabled = true } = options;

  const [variant, setVariant] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<ABAssignment | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!enabled || !AB_TEST_CONFIG.ENABLED) {
      setIsLoaded(true);
      return;
    }

    const currentAssignment = getAssignment(experimentKey);
    const currentVariant = currentAssignment?.variantId ?? null;

    setAssignment(currentAssignment);
    setVariant(currentVariant);
    setIsLoaded(true);
  }, [experimentKey, enabled]);

  const isInVariant = useCallback(
    (variantId: string): boolean => {
      return variant === variantId;
    },
    [variant]
  );

  // PERFORMANCE: Memoize the return object to prevent unnecessary re-renders of consumers
  return useMemo(
    () => ({
      variant,
      isControl: variant === 'control',
      isInVariant,
      isEnabled: enabled,
      isLoaded,
      assignment,
    }),
    [variant, isInVariant, enabled, isLoaded, assignment]
  );
}

/**
 * Simplified hook for just getting variant ID
 */
export function useABTestVariant(experimentKey: string): string | null {
  const { variant, isLoaded } = useABTest(experimentKey);
  return isLoaded ? variant : null;
}

/**
 * Hook for simple on/off feature flags
 */
export function useABTestFeatureFlag(
  flagKey: string,
  defaultValue = false
): boolean {
  const [isEnabled, setIsEnabled] = useState(defaultValue);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsEnabled(defaultValue);
      return;
    }

    try {
      const stored = localStorage.getItem(`ideaflow_ff_${flagKey}`);
      if (stored !== null) {
        setIsEnabled(stored === 'true');
      } else {
        setIsEnabled(defaultValue);
      }
    } catch {
      setIsEnabled(defaultValue);
    }
  }, [flagKey, defaultValue]);

  return isEnabled;
}

export default useABTest;
