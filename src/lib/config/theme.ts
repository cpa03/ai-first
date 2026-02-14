/**
 * Theme Configuration
 * Centralizes Tailwind-compatible styling values, colors, and shadow utilities
 * Eliminates hardcoded CSS values in component files
 */

/**
 * Focus ring shadow utilities for form inputs
 * Pre-defined shadow classes for consistent focus states
 */
export const FOCUS_SHADOWS = {
  /**
   * Blue focus shadow - primary/default focus state
   * Equivalent to: shadow-[0_0_0_3px_rgba(59,130,246,0.2)]
   */
  PRIMARY: 'focus-visible:shadow-[0_0_0_3px_rgba(59,130,246,0.2)]',

  /**
   * Red focus shadow - error state focus
   * Equivalent to: shadow-[0_0_0_3px_rgba(239,68,68,0.2)]
   */
  ERROR: 'focus-visible:shadow-[0_0_0_3px_rgba(239,68,68,0.2)]',

  /**
   * Green focus shadow - success state focus
   * Equivalent to: shadow-[0_0_0_3px_rgba(34,197,94,0.2)]
   */
  SUCCESS: 'focus-visible:shadow-[0_0_0_3px_rgba(34,197,94,0.2)]',

  /**
   * Amber/Yellow focus shadow - warning state focus
   * Equivalent to: shadow-[0_0_0_3px_rgba(245,158,11,0.2)]
   */
  WARNING: 'focus-visible:shadow-[0_0_0_3px_rgba(245,158,11,0.2)]',
} as const;

/**
 * Border color utilities for form states
 */
export const BORDER_COLORS = {
  /** Default border */
  DEFAULT: 'border-gray-300',

  /** Primary/brand border */
  PRIMARY: 'border-primary-500',

  /** Error state border */
  ERROR: 'border-red-300',
  ERROR_FOCUS: 'focus-visible:border-red-500',

  /** Success state border */
  SUCCESS: 'border-green-500',

  /** Warning state border */
  WARNING: 'border-amber-500',
} as const;

/**
 * Ring color utilities for focus states
 */
export const RING_COLORS = {
  /** Primary ring color */
  PRIMARY: 'focus-visible:ring-primary-500',

  /** Error ring color */
  ERROR: 'focus-visible:ring-red-500',

  /** Success ring color */
  SUCCESS: 'focus-visible:ring-green-500',
} as const;

/**
 * Text color utilities
 */
export const TEXT_COLORS = {
  /** Primary text */
  PRIMARY: 'text-gray-900',

  /** Secondary/muted text */
  SECONDARY: 'text-gray-600',

  /** Error text */
  ERROR: 'text-red-600',

  /** Success text */
  SUCCESS: 'text-green-600',

  /** Warning text */
  WARNING: 'text-amber-600',

  /** Brand primary text */
  BRAND: 'text-primary-600',
} as const;

/**
 * Background color utilities
 */
export const BG_COLORS = {
  /** Default background */
  DEFAULT: 'bg-white',

  /** Success background */
  SUCCESS: 'bg-green-500',

  /** Warning background */
  WARNING: 'bg-amber-500',

  /** Error background */
  ERROR: 'bg-red-500',

  /** Progress bar neutral */
  PROGRESS_NEUTRAL: 'bg-gray-200',
} as const;

/**
 * Complete input styling configurations by state
 * Combines all relevant utilities for each state
 */
export const INPUT_STYLES = {
  /** Base input classes (always applied) */
  BASE: [
    'w-full px-4 py-3 border rounded-md shadow-sm',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
    'transition-all duration-200',
  ].join(' '),

  /** Normal/default state */
  NORMAL: [
    BORDER_COLORS.DEFAULT,
    RING_COLORS.PRIMARY,
    FOCUS_SHADOWS.PRIMARY,
  ].join(' '),

  /** Error state */
  ERROR: [
    BORDER_COLORS.ERROR,
    BORDER_COLORS.ERROR_FOCUS,
    RING_COLORS.ERROR,
    FOCUS_SHADOWS.ERROR,
  ].join(' '),

  /** Success state */
  SUCCESS: [
    BORDER_COLORS.SUCCESS,
    RING_COLORS.SUCCESS,
    FOCUS_SHADOWS.SUCCESS,
  ].join(' '),
} as const;

/**
 * Animation duration constants (in ms) for use with inline styles or JS
 * For Tailwind classes, use the corresponding Tailwind classes instead
 */
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

/**
 * Spacing constants (in pixels) for calculations
 * For Tailwind classes, use the corresponding Tailwind classes instead
 */
export const SPACING_PX = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
} as const;

/**
 * Size constants for components
 */
export const SIZES = {
  /** Icon sizes */
  ICON: {
    SM: 16,
    MD: 20,
    LG: 24,
    XL: 32,
  },

  /** Textarea minimum heights */
  TEXTAREA: {
    MIN_HEIGHT: 100,
    MIN_HEIGHT_PX: '100px',
  },
} as const;

export type FocusShadows = typeof FOCUS_SHADOWS;
export type BorderColors = typeof BORDER_COLORS;
export type RingColors = typeof RING_COLORS;
export type TextColors = typeof TEXT_COLORS;
export type BgColors = typeof BG_COLORS;
export type InputStyles = typeof INPUT_STYLES;
