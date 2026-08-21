/**
 * Motion Reduce Patterns Configuration
 *
 * Centralizes all hardcoded Tailwind motion-reduce class patterns used throughout components.
 * This eliminates scattered motion-reduce class strings and provides a single source of truth.
 *
 * ## Usage
 *
 * ```typescript
 * import { MOTION_REDUCE_PATTERNS } from '@/lib/config/motion-reduce';
 *
 * // Instead of hardcoded motion-reduce classes:
 * className="motion-reduce:transition-none"
 *
 * // Use centralized config:
 * className={MOTION_REDUCE_PATTERNS.TRANSITION_NONE}
 * ```
 *
 * ## Migration Guide
 *
 * Replace hardcoded motion-reduce classes with imports from this module:
 * ```typescript
 * // BEFORE (hardcoded)
 * className="motion-reduce:transition-none motion-reduce:hover:transform-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
 *
 * // AFTER (modular)
 * import { MOTION_REDUCE_PATTERNS } from '@/lib/config/motion-reduce';
 * className={MOTION_REDUCE_PATTERNS.TRANSFORM_AND_SCALE}
 * ```
 *
 * ## Adding New Motion Reduce Patterns
 *
 * 1. Add the motion-reduce class constant with descriptive name
 * 2. Group related patterns together
 * 3. Add documentation with description
 * 4. Update this header with the new pattern
 */

/**
 * Base Motion Reduce Patterns
 * Core motion-reduce classes used across the application
 */
export const MOTION_REDUCE_PATTERNS = {
  /** Disable all transitions */
  TRANSITION_NONE: 'motion-reduce:transition-none',

  /** Disable hover transform effects */
  HOVER_TRANSFORM_NONE: 'motion-reduce:hover:transform-none',

  /** Disable hover scale effects */
  HOVER_SCALE_NONE: 'motion-reduce:hover:scale-100',

  /** Disable active scale effects */
  ACTIVE_SCALE_NONE: 'motion-reduce:active:scale-100',

  /** Disable active translate effects */
  ACTIVE_TRANSLATE_NONE: 'motion-reduce:active:translate-y-0',

  /** Disable hover translate effects */
  HOVER_TRANSLATE_NONE: 'motion-reduce:hover:translate-y-0',
} as const;

/**
 * Combined Motion Reduce Patterns
 * Pre-composed patterns for common use cases
 */
export const MOTION_REDUCE_COMBINED = {
  /** Disable all transitions and transforms */
  TRANSITION_AND_TRANSFORM:
    'motion-reduce:transition-none motion-reduce:hover:transform-none',

  /** Disable all transitions, hover scale, and active scale */
  TRANSITION_SCALE:
    'motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100',

  /** Full motion reduction - disable all transitions, transforms, and scales */
  FULL_REDUCTION:
    'motion-reduce:transition-none motion-reduce:hover:transform-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100',

  /** Disable transitions and hover/active translate */
  TRANSITION_TRANSLATE:
    'motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0',

  /** Full reduction with translate support */
  FULL_REDUCTION_WITH_TRANSLATE:
    'motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100 motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0',

  /** Disable only hover group scale effects */
  GROUP_HOVER_SCALE: 'motion-reduce:group-hover:scale-100',

  /** Disable transitions and group hover scale */
  TRANSITION_GROUP_HOVER:
    'motion-reduce:transition-none motion-reduce:group-hover:scale-100',
} as const;

// Type for motion reduce patterns
export type MotionReducePatterns = typeof MOTION_REDUCE_PATTERNS;
export type MotionReduceCombined = typeof MOTION_REDUCE_COMBINED;

// Quick access exports
export const TRANSITION_NONE = MOTION_REDUCE_PATTERNS.TRANSITION_NONE;
export const HOVER_TRANSFORM_NONE = MOTION_REDUCE_PATTERNS.HOVER_TRANSFORM_NONE;
export const HOVER_SCALE_NONE = MOTION_REDUCE_PATTERNS.HOVER_SCALE_NONE;
export const ACTIVE_SCALE_NONE = MOTION_REDUCE_PATTERNS.ACTIVE_SCALE_NONE;

// Combined pattern quick access
export const TRANSITION_AND_TRANSFORM =
  MOTION_REDUCE_COMBINED.TRANSITION_AND_TRANSFORM;
export const TRANSITION_SCALE = MOTION_REDUCE_COMBINED.TRANSITION_SCALE;
export const FULL_REDUCTION = MOTION_REDUCE_COMBINED.FULL_REDUCTION;
export const TRANSITION_TRANSLATE = MOTION_REDUCE_COMBINED.TRANSITION_TRANSLATE;
export const FULL_REDUCTION_WITH_TRANSLATE =
  MOTION_REDUCE_COMBINED.FULL_REDUCTION_WITH_TRANSLATE;
export const GROUP_HOVER_SCALE = MOTION_REDUCE_COMBINED.GROUP_HOVER_SCALE;
export const TRANSITION_GROUP_HOVER =
  MOTION_REDUCE_COMBINED.TRANSITION_GROUP_HOVER;
