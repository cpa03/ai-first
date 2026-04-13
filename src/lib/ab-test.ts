/**
 * A/B Testing Framework
 *
 * Provides a simple, extensible A/B testing system for growth experiments.
 * Enables experimentation with different user experiences to optimize conversion.
 *
 * Features:
 * - Deterministic variant assignment based on user session
 * - Persistent variant assignment across sessions
 * - Easy to disable experiments via configuration
 * - Support for feature flags (on/off experiments)
 *
 * Usage:
 * - Define experiments in AB_TESTS config
 * - Use useABTest hook in components
 * - Track experiment views in analytics
 */

import { createLogger } from '@/lib/logger';
import { generateSecureId } from '@/lib/utils';
import { EnvLoader } from '@/lib/config/environment';

/**
 * Experiment variant definition
 */
export interface ABVariant {
  /** Unique variant identifier */
  id: string;
  /** Human-readable variant name */
  name: string;
  /** Variant weight (0-100) - for weighted experiments */
  weight: number;
  /** Optional: Description for debugging */
  description?: string;
}

/**
 * Experiment definition
 */
export interface ABExperiment {
  /** Unique experiment identifier */
  id: string;
  /** Human-readable experiment name */
  name: string;
  /** Experiment description */
  description: string;
  /** List of variants */
  variants: ABVariant[];
  /** Whether the experiment is active */
  enabled: boolean;
  /** Optional: Override variant assignment (for testing) */
  forceVariant?: string;
}

/**
 * Experiment assignment result
 */
export interface ABAssignment {
  experimentId: string;
  variantId: string;
  variantName: string;
  timestamp: number;
}

/**
 * A/B Test configuration
 */
export const AB_TEST_CONFIG = {
  /**
   * Whether A/B testing is enabled
   * Env: NEXT_PUBLIC_AB_TEST_ENABLED (default: true in development, false in production)
   */
  ENABLED: EnvLoader.boolean(
    'NEXT_PUBLIC_AB_TEST_ENABLED',
    process.env.NODE_ENV !== 'production'
  ),

  /**
   * Debug logging
   * Env: AB_TEST_DEBUG (default: true in development)
   */
  DEBUG: EnvLoader.boolean(
    'AB_TEST_DEBUG',
    process.env.NODE_ENV !== 'production'
  ),

  /**
   * Default variant for disabled experiments
   */
  DEFAULT_VARIANT: 'control',

  /**
   * Storage key prefix
   */
  STORAGE_PREFIX: 'ideaflow_ab_',

  /**
   * Experiment assignments storage key
   */
  ASSIGNMENTS_KEY: 'ideaflow_ab_assignments',
} as const;

/**
 * Logger instance
 */
const logger = createLogger('ABTest');

/**
 * Predefined experiments
 * Add new experiments here in src/lib/ab-test.ts
 *
 * Example:
 * export const AB_TESTS: Record<string, ABExperiment> = {
 *   HOMEPAGE_HERO: {
 *     id: 'homepage_hero',
 *     name: 'Homepage Hero Variation',
 *     description: 'Test different hero section designs',
 *     enabled: true,
 *     variants: [
 *       { id: 'control', name: 'Control', weight: 50 },
 *       { id: 'variant_a', name: 'Variant A', weight: 25 },
 *       { id: 'variant_b', name: 'Variant B', weight: 25 },
 *     ],
 *   },
 * };
 */
export const AB_TESTS: Record<string, ABExperiment> = {
  // Add your experiments here
};

export type ABTestKey = string;

/**
 * Get all experiment assignments from storage
 */
function getAssignments(): Record<string, ABAssignment> {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const stored = localStorage.getItem(AB_TEST_CONFIG.ASSIGNMENTS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    if (AB_TEST_CONFIG.DEBUG) {
      logger.warn('Failed to read assignments from storage');
    }
    return {};
  }
}

/**
 * Save assignments to storage
 */
function saveAssignments(assignments: Record<string, ABAssignment>): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(
      AB_TEST_CONFIG.ASSIGNMENTS_KEY,
      JSON.stringify(assignments)
    );
  } catch {
    if (AB_TEST_CONFIG.DEBUG) {
      logger.warn('Failed to save assignments to storage');
    }
  }
}

/**
 * Get deterministic random value based on user and experiment
 * Uses session ID for consistent assignment
 */
function getDeterministicRandom(experimentId: string): number {
  if (typeof window === 'undefined') {
    return Math.random();
  }

  try {
    // Get or create session ID
    let sessionId = sessionStorage.getItem('ideaflow_session_id');
    if (!sessionId) {
      sessionId = `session_${generateSecureId()}`;
      sessionStorage.setItem('ideaflow_session_id', sessionId);
    }

    // Create deterministic hash
    const str = `${sessionId}_${experimentId}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    // Return normalized value 0-1
    return Math.abs(hash) / 2147483647;
  } catch {
    return Math.random();
  }
}

/**
 * Assign user to a variant
 */
function assignVariant(experiment: ABExperiment): ABVariant {
  // If experiment is disabled, return control
  if (!experiment.enabled) {
    return (
      experiment.variants.find(
        (v) => v.id === AB_TEST_CONFIG.DEFAULT_VARIANT
      ) || experiment.variants[0]
    );
  }

  // Check for forced variant (for testing)
  if (experiment.forceVariant) {
    const forced = experiment.variants.find(
      (v) => v.id === experiment.forceVariant
    );
    if (forced) return forced;
  }

  // Calculate total weight
  const totalWeight = experiment.variants.reduce((sum, v) => sum + v.weight, 0);

  // Get deterministic random value
  const random = getDeterministicRandom(experiment.id);

  // Assign variant based on weight
  let cumulativeWeight = 0;
  for (const variant of experiment.variants) {
    cumulativeWeight += variant.weight / totalWeight;
    if (random < cumulativeWeight) {
      return variant;
    }
  }

  // Fallback to last variant
  return experiment.variants[experiment.variants.length - 1];
}

/**
 * Get experiment assignment
 * Returns cached assignment if exists, otherwise creates new one
 */
export function getAssignment(experimentKey: string): ABAssignment | null {
  // Skip if A/B testing is disabled
  if (!AB_TEST_CONFIG.ENABLED) {
    return null;
  }

  const experiment = AB_TESTS[experimentKey];
  if (!experiment) {
    if (AB_TEST_CONFIG.DEBUG) {
      logger.warn(`Experiment ${experimentKey} not found`);
    }
    return null;
  }

  // Get existing assignments
  const assignments = getAssignments();
  const existingAssignment = assignments[experiment.id];

  // Return existing assignment if valid
  if (existingAssignment) {
    return existingAssignment;
  }

  // Create new assignment
  const variant = assignVariant(experiment);
  const newAssignment: ABAssignment = {
    experimentId: experiment.id,
    variantId: variant.id,
    variantName: variant.name,
    timestamp: Date.now(),
  };

  // Save assignment
  assignments[experiment.id] = newAssignment;
  saveAssignments(assignments);

  if (AB_TEST_CONFIG.DEBUG) {
    logger.debug(`Assigned variant for ${experiment.id}:`, newAssignment);
  }

  return newAssignment;
}

/**
 * Get variant for an experiment
 * Returns variant ID or null if not in experiment
 */
export function getVariant(experimentKey: string): string | null {
  const assignment = getAssignment(experimentKey);
  return assignment?.variantId ?? null;
}

/**
 * Check if user is in a specific variant
 */
export function isInVariant(experimentKey: string, variantId: string): boolean {
  const assignment = getAssignment(experimentKey);
  return assignment?.variantId === variantId;
}

/**
 * Get all active experiments
 */
export function getActiveExperiments(): ABExperiment[] {
  const experiments: ABExperiment[] = [];

  for (const key of Object.keys(AB_TESTS)) {
    const experiment = AB_TESTS[key];
    if (experiment.enabled) {
      experiments.push(experiment);
    }
  }

  return experiments;
}

/**
 * Reset all experiment assignments
 * Useful for testing or when user opts out
 */
export function resetExperiments(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(AB_TEST_CONFIG.ASSIGNMENTS_KEY);
    if (AB_TEST_CONFIG.DEBUG) {
      logger.debug('Reset all experiment assignments');
    }
  } catch {
    if (AB_TEST_CONFIG.DEBUG) {
      logger.warn('Failed to reset experiments');
    }
  }
}

/**
 * A/B Test API for programmatic use
 */
export const abTest = {
  getAssignment,
  getVariant,
  isInVariant,
  getActiveExperiments,
  resetExperiments,
  config: AB_TEST_CONFIG,
};

export default abTest;
