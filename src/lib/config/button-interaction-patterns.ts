/**
 * Button Interaction Patterns Configuration
 *
 * Centralizes hardcoded Tailwind classes for button interactive states
 * (hover, focus, disabled). Follows the "Flexy" principle:
 * eliminate hardcoded values and make modular systems.
 *
 * Usage:
 * ```typescript
 * import { BUTTON_INTERACTION_PATTERNS } from '@/lib/config/button-interaction-patterns';
 *
 * // Instead of hardcoded className:
 * <button className="hover:opacity-75 transition-opacity">
 *
 * // Use modular config:
 * <button className={BUTTON_INTERACTION_PATTERNS.HOVER_OPACITY}>
 * ```
 */

/**
 * Button hover opacity patterns
 * Used in: ToastContainer, various button components
 */
export const BUTTON_HOVER_OPACITY = {
  /** hover:opacity-75 - subtle hover opacity decrease */
  SUBTLE: 'hover:opacity-75',
  /** hover:opacity-100 - full opacity on hover */
  FULL: 'hover:opacity-100',
} as const;

/**
 * Button transition patterns
 * Used in: ToastContainer, various button components
 */
export const BUTTON_TRANSITIONS = {
  /** transition-opacity - smooth opacity transitions */
  OPACITY: 'transition-opacity',
  /** transition-all - all property transitions */
  ALL: 'transition-all',
  /** transition-transform - transform transitions */
  TRANSFORM: 'transition-transform',
} as const;

/**
 * Button rounded corners
 * Used in: ToastContainer, various button components
 */
export const BUTTON_ROUNDED = {
  /** rounded-md - medium rounded corners */
  MD: 'rounded-md',
  /** rounded-lg - large rounded corners */
  LG: 'rounded-lg',
  /** rounded-full - fully rounded */
  FULL: 'rounded-full',
} as const;

/**
 * Button cursor patterns
 * Used in: ProgressStepper, various button components
 */
export const BUTTON_CURSORS = {
  /** cursor-pointer - clickable */
  POINTER: 'cursor-pointer',
  /** cursor-not-allowed - disabled */
  NOT_ALLOWED: 'cursor-not-allowed',
  /** cursor-default - default cursor */
  DEFAULT: 'cursor-default',
} as const;

/**
 * Combined patterns object for easy access
 */
export const BUTTON_INTERACTION_PATTERNS = {
  HOVER_OPACITY: BUTTON_HOVER_OPACITY,
  TRANSITIONS: BUTTON_TRANSITIONS,
  ROUNDED: BUTTON_ROUNDED,
  CURSORS: BUTTON_CURSORS,
} as const;
