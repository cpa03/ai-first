/**
 * useFunnelTracking Hook
 *
 * React hook for tracking user progress through conversion funnels.
 * Enables measuring conversion rates and identifying drop-off points.
 *
 * Growth: Essential for understanding user conversion and retention
 */

'use client';

import { useCallback, useRef, useEffect, useMemo } from 'react';
import { trackFunnelStep, trackFunnelDropoff, flush } from '@/lib/analytics';

/**
 * Funnel configuration
 */
export interface FunnelConfig {
  /** Unique name for the funnel */
  name: string;
  /** Total number of steps in the funnel */
  totalSteps: number;
  /** Whether to track automatic drop-off on unmount */
  trackDropoffOnUnmount?: boolean;
}

/**
 * Hook return value
 */
export interface UseFunnelTrackingReturn {
  /** Complete a funnel step */
  completeStep: (step: number) => void;
  /** Mark the funnel as abandoned (dropoff) */
  markDropoff: (atStep: number) => void;
  /** Reset funnel tracking */
  reset: () => void;
  /** Get current step */
  getCurrentStep: () => number;
}

/**
 * Funnel Tracking Hook
 *
 * @param config - Funnel configuration
 *
 * @example
 * const { completeStep, markDropoff, reset } = useFunnelTracking({
 *   name: 'idea_submission',
 *   totalSteps: 3,
 *   trackDropoffOnUnmount: true,
 * });
 *
 * // At each step:
 * completeStep(1); // User reached step 1
 * completeStep(2); // User reached step 2
 * completeStep(3); // User completed the funnel!
 */
export function useFunnelTracking(
  config: FunnelConfig
): UseFunnelTrackingReturn {
  const { name, totalSteps, trackDropoffOnUnmount = true } = config;

  const currentStepRef = useRef<number>(0);
  const stepStartTimeRef = useRef<number>(0);
  const hasCompletedRef = useRef<boolean>(false);

  // Initialize start time on mount
  useEffect(() => {
    stepStartTimeRef.current = Date.now();
  }, []);

  // Reset on config change
  useEffect(() => {
    currentStepRef.current = 0;
    stepStartTimeRef.current = Date.now();
    hasCompletedRef.current = false;
  }, [name, totalSteps]);

  // Track drop-off on unmount if enabled
  useEffect(() => {
    return () => {
      if (
        trackDropoffOnUnmount &&
        !hasCompletedRef.current &&
        currentStepRef.current > 0
      ) {
        // Track that user dropped off
        trackFunnelDropoff(name, currentStepRef.current + 1, totalSteps);
        flush();
      }
    };
  }, [name, totalSteps, trackDropoffOnUnmount]);

  /**
   * Complete a funnel step
   */
  const completeStep = useCallback(
    (step: number) => {
      // Validate step
      if (step < 1 || step > totalSteps) {
        console.warn(
          `[FunnelTracking] Invalid step ${step} for funnel "${name}" with ${totalSteps} steps`
        );
        return;
      }

      // Calculate time to this step from previous step
      const now = Date.now();
      const timeToStep = now - stepStartTimeRef.current;

      // Track the step completion
      trackFunnelStep(name, step, totalSteps, timeToStep);

      // Update state
      currentStepRef.current = step;
      stepStartTimeRef.current = now;

      // Mark as completed if final step
      if (step === totalSteps) {
        hasCompletedRef.current = true;
      }
    },
    [name, totalSteps]
  );

  /**
   * Mark funnel as abandoned (dropoff)
   */
  const markDropoff = useCallback(
    (atStep: number) => {
      // Validate step
      if (atStep < 1 || atStep > totalSteps) {
        console.warn(
          `[FunnelTracking] Invalid dropoff step ${atStep} for funnel "${name}"`
        );
        return;
      }

      // Track the dropoff
      trackFunnelDropoff(name, atStep, totalSteps);

      // Mark as completed to prevent double-tracking
      hasCompletedRef.current = true;
    },
    [name, totalSteps]
  );

  /**
   * Reset funnel tracking
   */
  const reset = useCallback(() => {
    currentStepRef.current = 0;
    stepStartTimeRef.current = Date.now();
    hasCompletedRef.current = false;
  }, []);

  /**
   * Get current step
   */
  const getCurrentStep = useCallback(() => {
    return currentStepRef.current;
  }, []);

  // PERFORMANCE: Memoize return object to ensure referential stability.
  // This prevents unnecessary re-renders in components consuming this hook.
  return useMemo(
    () => ({
      completeStep,
      markDropoff,
      reset,
      getCurrentStep,
    }),
    [completeStep, markDropoff, reset, getCurrentStep]
  );
}

/**
 * Predefined funnels for common user journeys
 */
export const PREDEFINED_FUNNELS = {
  IDEA_SUBMISSION: {
    name: 'idea_submission',
    totalSteps: 4,
    description: 'From landing to completed idea submission',
  },
  ONBOARDING: {
    name: 'onboarding',
    totalSteps: 4,
    description: 'User onboarding tour completion',
  },
  CLARIFICATION: {
    name: 'clarification',
    totalSteps: 3,
    description: 'Idea clarification flow',
  },
} as const;
