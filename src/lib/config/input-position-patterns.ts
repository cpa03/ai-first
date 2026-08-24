/**
 * Input Positioning Patterns Configuration
 *
 * Centralizes hardcoded Tailwind classes for input positioning
 * (absolute positioning, vertical centering). Follows the "Flexy" principle:
 * eliminate hardcoded values and make modular systems.
 *
 * Usage:
 * ```typescript
 * import { INPUT_POSITION_PATTERNS } from '@/lib/config/input-position-patterns';
 *
 * // Instead of hardcoded className:
 * <div className="absolute top-1/2 -translate-y-1/2 pointer-events-none">
 *
 * // Use modular config:
 * <div className={INPUT_POSITION_PATTERNS.VERTICAL_CENTER}>
 * ```
 */

/**
 * Input vertical centering pattern
 * Used in: InputWithValidation.tsx icon positioning
 */
export const INPUT_VERTICAL_CENTER = {
  /** absolute top-1/2 -translate-y-1/2 pointer-events-none */
  BASE: 'absolute top-1/2 -translate-y-1/2 pointer-events-none',
  /** top-1/2 -translate-y-1/2 - vertical center transform */
  TRANSFORM: 'top-1/2 -translate-y-1/2',
} as const;

/**
 * Input absolute positioning pattern
 * Used in: InputWithValidation.tsx icon positioning
 */
export const INPUT_ABSOLUTE = {
  /** absolute - absolute positioning */
  BASE: 'absolute',
  /** pointer-events-none - no pointer events */
  NO_POINTER: 'pointer-events-none',
} as const;

/**
 * Combined patterns object for easy access
 */
export const INPUT_POSITION_PATTERNS = {
  VERTICAL_CENTER: INPUT_VERTICAL_CENTER,
  ABSOLUTE: INPUT_ABSOLUTE,
} as const;
