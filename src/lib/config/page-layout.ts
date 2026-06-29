/**
 * Page Layout Configuration
 * Centralizes hardcoded CSS layout values used across page components
 * Eliminates arbitrary Tailwind values like min-h-[calc(100vh-4rem)]
 */

import { EnvLoader } from './environment';

/**
 * Page Layout Dimensions
 * Used for consistent page layouts across auth and main pages
 */
export const PAGE_LAYOUT = {
  /**
   * Minimum height for auth pages (login, signup, callback)
   * Calculated as 100vh minus header height
   * Env: PAGE_AUTH_MIN_HEIGHT (default: 'calc(100vh - 4rem)')
   */
  AUTH_MIN_HEIGHT: EnvLoader.string(
    'PAGE_AUTH_MIN_HEIGHT',
    'calc(100vh - 4rem)'
  ),

  /**
   * Header height used in calc expressions
   * Env: PAGE_HEADER_HEIGHT (default: '4rem')
   */
  HEADER_HEIGHT: EnvLoader.string('PAGE_HEADER_HEIGHT', '4rem'),
} as const;

/**
 * Responsive Padding Classes
 * Centralizes the repeated responsive padding pattern: px-4 sm:px-6 lg:px-8
 * This pattern is used across all page containers for consistent horizontal spacing
 */
export const RESPONSIVE_PADDING = {
  /** Base horizontal padding: 1rem (16px) */
  BASE: 'px-4',
  /** Small breakpoint padding: 1.5rem (24px) */
  SM: 'sm:px-6',
  /** Large breakpoint padding: 2rem (32px) */
  LG: 'lg:px-8',
  /** Combined responsive padding class */
  CLASS: 'px-4 sm:px-6 lg:px-8',
  /** Responsive padding with vertical spacing: px-4 sm:px-6 lg:px-8 py-8 sm:py-12 */
  WITH_VERTICAL: 'px-4 sm:px-6 lg:px-8 py-8 sm:py-12',
  /** Responsive padding with fixed vertical spacing: px-4 sm:px-6 lg:px-8 py-12 */
  WITH_VERTICAL_FIXED: 'px-4 sm:px-6 lg:px-8 py-12',
} as const;

/**
 * Container Width Classes
 * Centralizes all container max-width variants used across pages
 * Eliminates hardcoded 'max-w-*' classes repeated throughout the codebase
 */
export const CONTAINER_WIDTHS = {
  /** Small container: max-w-sm (384px) - Used for narrow content like error fallbacks */
  XS: 'max-w-sm',
  /** Small container: max-w-2xl (672px) - Used for narrow content like clarification flows */
  SM: 'max-w-2xl',
  /** Medium container: max-w-4xl (896px) - Used for most page content */
  MD: 'max-w-4xl',
  /** Large container: max-w-6xl (1152px) - Used for dashboard and wider layouts */
  LG: 'max-w-6xl',
  /** Extra large container: max-w-7xl (1280px) - Used for full-width layouts like header */
  XL: 'max-w-7xl',
} as const;

/**
 * Tailwind Arbitrary Value Helpers
 * Returns Tailwind class strings with centralized values
 */
export const PAGE_LAYOUT_CLASSES = {
  /** Auth page min-h class */
  AUTH_PAGE: `min-h-[${PAGE_LAYOUT.AUTH_MIN_HEIGHT}]`,

  /** Container classes with responsive padding - Small (max-w-2xl) */
  CONTAINER_SM: `${CONTAINER_WIDTHS.SM} mx-auto ${RESPONSIVE_PADDING.WITH_VERTICAL_FIXED}`,
  /** Container classes with responsive padding - Medium (max-w-4xl) */
  CONTAINER_MD: `${CONTAINER_WIDTHS.MD} mx-auto ${RESPONSIVE_PADDING.WITH_VERTICAL_FIXED}`,
  /** Container classes with responsive padding - Large (max-w-6xl) */
  CONTAINER_LG: `${CONTAINER_WIDTHS.LG} mx-auto ${RESPONSIVE_PADDING.WITH_VERTICAL_FIXED}`,
  /** Container classes with responsive padding - Extra Large (max-w-7xl) */
  CONTAINER_XL: `${CONTAINER_WIDTHS.XL} mx-auto ${RESPONSIVE_PADDING.CLASS}`,

  /** Auth page container: centered with background */
  AUTH_CONTAINER: `min-h-[${PAGE_LAYOUT.AUTH_MIN_HEIGHT}] flex items-center justify-center ${RESPONSIVE_PADDING.WITH_VERTICAL_FIXED} bg-gray-50`,
} as const;

/**
 * Opacity Configuration
 * Centralizes hardcoded opacity values used in components
 */
export const OPACITY_CONFIG = {
  /**
   * SVG background circle opacity
   * Used in AutoSaveIndicator for spinning loader background
   */
  SVG_BACKGROUND: 0.3,

  /**
   * Backdrop overlay opacity
   * Used in modal overlays for dimming background
   */
  BACKDROP_OVERLAY: 0.5,

  /**
   * Step celebration exit opacity
   * Used in StepCelebration component for exit animation
   */
  STEP_CELEBRATION_EXIT: 0,
  STEP_CELEBRATION_VISIBLE: 0.8,
} as const;

export type PageLayout = typeof PAGE_LAYOUT;
export type OpacityConfig = typeof OPACITY_CONFIG;
