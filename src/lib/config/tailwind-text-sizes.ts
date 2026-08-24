/**
 * Tailwind Text Sizes Configuration
 *
 * Centralizes all standard Tailwind text size classes used across components.
 * Follows the "Flexy" principle: eliminate hardcoded values and make modular systems.
 *
 * Usage:
 * ```typescript
 * import { TAILWIND_TEXT_SIZES } from '@/lib/config/tailwind-text-sizes';
 *
 * // Instead of hardcoded className:
 * <span className="text-sm">Small text</span>
 *
 * // Use modular config:
 * <span className={TAILWIND_TEXT_SIZES.SM}>Small text</span>
 * ```
 */

/**
 * Standard Tailwind Text Size Classes
 * Maps to standard Tailwind CSS text size utilities
 */
export const TAILWIND_TEXT_SIZES = {
  /** text-xs - Extra small text (12px) */
  XS: 'text-xs',

  /** text-sm - Small text (14px) */
  SM: 'text-sm',

  /** text-base - Base text (16px) */
  BASE: 'text-base',

  /** text-lg - Large text (18px) */
  LG: 'text-lg',

  /** text-xl - Extra large text (20px) */
  XL: 'text-xl',

  /** text-2xl - 2x large text (24px) */
  '2XL': 'text-2xl',

  /** text-3xl - 3x large text (30px) */
  '3XL': 'text-3xl',

  /** text-4xl - 4x large text (36px) */
  '4XL': 'text-4xl',
} as const;

/**
 * Responsive Text Size Patterns
 * Common responsive text size combinations used in components
 */
export const RESPONSIVE_TEXT_SIZES = {
  /** text-sm sm:text-base - Small on mobile, base on desktop */
  SM_TO_BASE: 'text-sm sm:text-base',

  /** text-xs sm:text-sm - Extra small on mobile, small on desktop */
  XS_TO_SM: 'text-xs sm:text-sm',

  /** text-base sm:text-lg - Base on mobile, large on desktop */
  BASE_TO_LG: 'text-base sm:text-lg',

  /** text-lg sm:text-xl - Large on mobile, extra large on desktop */
  LG_TO_XL: 'text-lg sm:text-xl',

  /** text-xl sm:text-2xl - Extra large on mobile, 2x large on desktop */
  XL_TO_2XL: 'text-xl sm:text-2xl',
} as const;

/**
 * Text Size Presets for Common UI Patterns
 * Predefined combinations for specific use cases
 */
export const TAILWIND_TEXT_SIZE_PRESETS = {
  /** Badge text - extra small */
  BADGE: TAILWIND_TEXT_SIZES.XS,

  /** Label text - small */
  LABEL: TAILWIND_TEXT_SIZES.SM,

  /** Body text - base */
  BODY: TAILWIND_TEXT_SIZES.BASE,

  /** Heading text - large */
  HEADING: TAILWIND_TEXT_SIZES.LG,

  /** Title text - extra large */
  TITLE: TAILWIND_TEXT_SIZES.XL,

  /** Display text - 2x large */
  DISPLAY: TAILWIND_TEXT_SIZES['2XL'],

  /** Caption text - extra small */
  CAPTION: TAILWIND_TEXT_SIZES.XS,

  /** Helper text - small */
  HELPER: TAILWIND_TEXT_SIZES.SM,

  /** Navigation text - small */
  NAV: TAILWIND_TEXT_SIZES.SM,

  /** Button text - small */
  BUTTON: TAILWIND_TEXT_SIZES.SM,
} as const;

export type TailwindTextSizes = typeof TAILWIND_TEXT_SIZES;
export type ResponsiveTextSizes = typeof RESPONSIVE_TEXT_SIZES;
export type TextSizePresets = typeof TAILWIND_TEXT_SIZE_PRESETS;
