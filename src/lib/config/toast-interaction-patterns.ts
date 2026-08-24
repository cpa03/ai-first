/**
 * Toast Interaction Patterns Configuration
 *
 * Centralizes hardcoded Tailwind classes for toast interactive elements
 * (dismiss button, hover states). Follows the "Flexy" principle:
 * eliminate hardcoded values and make modular systems.
 *
 * Usage:
 * ```typescript
 * import { TOAST_DISMISS_PATTERN } from '@/lib/config/toast-interaction-patterns';
 *
 * // Instead of hardcoded className:
 * <button className="flex-shrink-0 ml-2 hover:opacity-75 transition-opacity rounded-md p-1.5">
 *
 * // Use modular config:
 * <button className={TOAST_DISMISS_PATTERN.BASE}>
 * ```
 */

/**
 * Toast dismiss button pattern
 * Used in: ToastContainer.tsx dismiss button
 */
export const TOAST_DISMISS_PATTERN = {
  /** flex-shrink-0 ml-2 hover:opacity-75 transition-opacity rounded-md p-1.5 */
  BASE: 'flex-shrink-0 hover:opacity-75 transition-opacity rounded-md',
} as const;

/**
 * Toast container patterns
 * Used in: ToastContainer.tsx
 */
export const TOAST_CONTAINER_PATTERNS = {
  /** flex-shrink-0 - prevent shrinking */
  FLEX_SHRINK_0: 'flex-shrink-0',
  /** hover:opacity-75 - subtle hover effect */
  HOVER_OPACITY: 'hover:opacity-75',
  /** transition-opacity - smooth opacity transition */
  TRANSITION_OPACITY: 'transition-opacity',
} as const;

/**
 * Combined patterns object for easy access
 */
export const TOAST_INTERACTION_PATTERNS = {
  DISMISS: TOAST_DISMISS_PATTERN,
  CONTAINER: TOAST_CONTAINER_PATTERNS,
} as const;
