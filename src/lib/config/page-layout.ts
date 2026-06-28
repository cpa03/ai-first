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
 * Tailwind Arbitrary Value Helpers
 * Returns Tailwind class strings with centralized values
 */
export const PAGE_LAYOUT_CLASSES = {
  /** Auth page min-h class */
  AUTH_PAGE: `min-h-[${PAGE_LAYOUT.AUTH_MIN_HEIGHT}]`,
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
