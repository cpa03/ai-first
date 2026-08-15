/**
 * Focus Ring Offsets Configuration
 * Centralizes all hardcoded ring-offset-* values used throughout components
 * Follows the "Flexy" principle: eliminate hardcoded values and make modular systems
 */

/**
 * Ring offset classes for focus states
 * Replaces hardcoded ring-offset-* classes throughout components
 */
export const RING_OFFSET_CLASSES = {
  /** ring-offset-1 = 1px offset */
  XS: 'ring-offset-1',
  /** ring-offset-2 = 2px offset */
  SM: 'ring-offset-2',
  /** ring-offset-4 = 4px offset */
  MD: 'ring-offset-4',
  /** ring-offset-8 = 8px offset */
  LG: 'ring-offset-8',
} as const;

/**
 * Complete focus ring patterns combining ring, offset, and color
 * Replaces hardcoded focus-visible:ring-* focus-visible:ring-offset-* patterns
 */
export const FOCUS_RING_OFFSET_PATTERNS = {
  /** Standard focus ring with 2px offset (focus-visible) */
  DEFAULT:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',

  /** Standard focus ring with 2px offset (focus - for elements that need focus on click) */
  FOCUS:
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',

  /** Focus ring with 1px offset for compact elements */
  COMPACT:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1',

  /** Focus ring with white offset for dark backgrounds */
  ON_DARK:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white',

  /** Large focus ring with 4px offset */
  LARGE:
    'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2',

  /** Error focus ring */
  ERROR:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',

  /** Success focus ring */
  SUCCESS:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2',

  /** Focus ring for buttons */
  BUTTON:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white',

  /** Focus ring for checkboxes and small elements */
  CHECKBOX:
    'peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 peer-focus-visible:ring-offset-2',

  /** Subtle focus ring with ring-current color */
  SUBTLE: 'focus:outline-none focus:ring-1 focus:ring-current',

  /** Focus ring with border-transparent for inputs */
  INPUT:
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',

  /** Focus ring with primary-400 color and 1px offset for focused task items */
  TASK_FOCUSED: 'ring-2 ring-primary-400 ring-offset-1',

  /** Focus ring with primary-500 color and 1px offset for active filter buttons */
  FILTER_ACTIVE: 'ring-2 ring-primary-500 ring-offset-1',

  /** Programmatic focus ring with primary-500 color and 2px offset for keyboard navigation */
  NAVIGATION_FOCUSED: 'ring-2 ring-primary-500 ring-offset-2',
} as const;

/**
 * Border width classes
 * Replaces hardcoded border-* classes throughout components
 */
export const BORDER_WIDTH_CLASSES = {
  /** border = 1px */
  THIN: 'border',
  /** border-2 = 2px */
  MEDIUM: 'border-2',
  /** border-4 = 4px */
  THICK: 'border-4',
  /** border-8 = 8px */
  EXTRA_THICK: 'border-8',
} as const;

/**
 * Border radius classes
 * Replaces hardcoded rounded-* classes throughout components
 */
export const BORDER_RADIUS_CLASSES = {
  /** rounded = 4px */
  SM: 'rounded',
  /** rounded-md = 6px */
  MD: 'rounded-md',
  /** rounded-lg = 8px */
  LG: 'rounded-lg',
  /** rounded-xl = 12px */
  XL: 'rounded-xl',
  /** rounded-2xl = 16px */
  XXL: 'rounded-2xl',
  /** rounded-full = 9999px */
  FULL: 'rounded-full',
} as const;

export type RingOffsetClass =
  (typeof RING_OFFSET_CLASSES)[keyof typeof RING_OFFSET_CLASSES];
export type FocusRingOffsetPattern =
  (typeof FOCUS_RING_OFFSET_PATTERNS)[keyof typeof FOCUS_RING_OFFSET_PATTERNS];
export type BorderWidthClass =
  (typeof BORDER_WIDTH_CLASSES)[keyof typeof BORDER_WIDTH_CLASSES];
export type BorderRadiusClass =
  (typeof BORDER_RADIUS_CLASSES)[keyof typeof BORDER_RADIUS_CLASSES];
