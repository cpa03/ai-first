/**
 * Progress Stepper Patterns Configuration
 *
 * Centralizes hardcoded Tailwind classes for progress stepper components
 * (step indicators, connectors). Follows the "Flexy" principle:
 * eliminate hardcoded values and make modular systems.
 *
 * Usage:
 * ```typescript
 * import { PROGRESS_STEPPER_PATTERNS } from '@/lib/config/progress-stepper-patterns';
 *
 * // Instead of hardcoded className:
 * <div className="flex-1 flex items-center w-full rounded-full transition-all duration-200">
 *
 * // Use modular config:
 * <div className={PROGRESS_STEPPER_PATTERNS.CONNECTOR}>
 * ```
 */

/**
 * Progress stepper connector pattern
 * Used in: ProgressStepper.tsx step connector
 */
export const PROGRESS_STEPPER_CONNECTOR = {
  /** flex-1 - flex grow */
  FLEX_GROW: 'flex-1',
  /** flex items-center - centered flex */
  FLEX_CENTER: 'flex items-center',
  /** w-full rounded-full transition-all duration-200 */
  BASE: 'w-full rounded-full transition-all duration-200',
} as const;

/**
 * Progress stepper cursor patterns
 * Used in: ProgressStepper.tsx clickable steps
 */
export const PROGRESS_STEPPER_CURSORS = {
  /** cursor-pointer group - clickable step with group hover */
  CLICKABLE: 'cursor-pointer group',
  /** cursor-default - non-clickable step */
  DEFAULT: 'cursor-default',
} as const;

/**
 * Progress stepper step pattern
 * Used in: ProgressStepper.tsx step indicator
 */
export const PROGRESS_STEPPER_STEP = {
  /** flex items-center w-full rounded-full transition-all duration-200 */
  BASE: 'flex items-center w-full rounded-full transition-all duration-200',
} as const;

/**
 * Combined patterns object for easy access
 */
export const PROGRESS_STEPPER_PATTERNS = {
  CONNECTOR: PROGRESS_STEPPER_CONNECTOR,
  CURSORS: PROGRESS_STEPPER_CURSORS,
  STEP: PROGRESS_STEPPER_STEP,
} as const;
