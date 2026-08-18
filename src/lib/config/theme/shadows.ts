/**
 * Theme Shadows Module
 * Centralizes all shadow-related theme constants
 */

/**
 * State shadow utilities for form inputs (non-focus states)
 */
export const STATE_SHADOWS = {
  SUCCESS: 'shadow-[0_0_0_3px_rgba(34,197,94,0.2)]',
  PRIMARY: 'shadow-[0_0_0_3px_rgba(59,130,246,0.2)]',
  ERROR: 'shadow-[0_0_0_3px_rgba(239,68,68,0.2)]',
} as const;

/**
 * Focus ring shadow utilities for form inputs
 */
export const FOCUS_SHADOWS = {
  PRIMARY: 'focus-visible:shadow-[0_0_0_3px_rgba(59,130,246,0.2)]',
  ERROR: 'focus-visible:shadow-[0_0_0_3px_rgba(239,68,68,0.2)]',
  SUCCESS: 'focus-visible:shadow-[0_0_0_3px_rgba(34,197,94,0.2)]',
  WARNING: 'focus-visible:shadow-[0_0_0_3px_rgba(245,158,11,0.2)]',
} as const;

/**
 * Shadow Utility Classes
 */
export const SHADOW_CLASSES = {
  SMALL: 'shadow-sm',
  DEFAULT: 'shadow-md',
  LARGE: 'shadow-lg',
  EXTRA_LARGE: 'shadow-xl',
  NONE: 'shadow-none',
} as const;

export type FocusShadows = typeof FOCUS_SHADOWS;
export type ShadowClasses = typeof SHADOW_CLASSES;
