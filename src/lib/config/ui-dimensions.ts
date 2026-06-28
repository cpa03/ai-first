import { EnvLoader } from './environment';

/**
 * UI Dimensions Configuration
 * Centralizes all hardcoded pixel dimensions used across components
 * Eliminates arbitrary Tailwind values like min-h-[100px], max-w-[240px], etc.
 */

/**
 * Textarea and Input Minimum Heights
 * Used for form inputs and text areas
 */
export const INPUT_HEIGHTS = {
  /**
   * Standard textarea minimum height
   * Env: UI_TEXTAREA_MIN_HEIGHT (default: 100)
   */
  TEXTAREA_MIN: EnvLoader.number('UI_TEXTAREA_MIN_HEIGHT', 100, 50, 300),

  /**
   * Select/dropdown input minimum height
   * Env: UI_SELECT_MIN_HEIGHT (default: 44)
   */
  SELECT_MIN: EnvLoader.number('UI_SELECT_MIN_HEIGHT', 44, 32, 60),

  /**
   * Button minimum height
   * Env: UI_BUTTON_MIN_HEIGHT (default: 36)
   */
  BUTTON_MIN: EnvLoader.number('UI_BUTTON_MIN_HEIGHT', 36, 28, 48),
} as const;

/**
 * Container Maximum Widths
 * Used for modals, tooltips, and constrained content
 */
export const CONTAINER_WIDTHS = {
  /**
   * Tooltip maximum width
   * Env: UI_TOOLTIP_MAX_WIDTH (default: 240)
   */
  TOOLTIP_MAX: EnvLoader.number('UI_TOOLTIP_MAX_WIDTH', 240, 150, 400),

  /**
   * Onboarding popup width
   * Env: UI_ONBOARDING_WIDTH (default: 300)
   */
  ONBOARDING: EnvLoader.number('UI_ONBOARDING_WIDTH', 300, 200, 500),

  /**
   * Modal maximum width
   * Env: UI_MODAL_MAX_WIDTH (default: 448)
   */
  MODAL_MAX: EnvLoader.number('UI_MODAL_MAX_WIDTH', 448, 320, 640),
} as const;

/**
 * Icon and Button Minimum Sizes
 * Used for touch targets and icon containers
 */
export const MIN_SIZES = {
  /**
   * Toast action button minimum size (for touch targets)
   * Env: UI_TOAST_BUTTON_MIN_SIZE (default: 32)
   */
  TOAST_BUTTON: EnvLoader.number('UI_TOAST_BUTTON_MIN_SIZE', 32, 24, 48),

  /**
   * Keyboard shortcut badge minimum width
   * Env: UI_KBD_MIN_WIDTH (default: 20)
   */
  KBD_MIN_WIDTH: EnvLoader.number('UI_KBD_MIN_WIDTH', 20, 16, 32),

  /**
   * Keyboard shortcut badge minimum height
   * Env: UI_KBD_MIN_HEIGHT (default: 20)
   */
  KBD_MIN_HEIGHT: EnvLoader.number('UI_KBD_MIN_HEIGHT', 20, 16, 32),
} as const;

/**
 * Tailwind Arbitrary Value Helpers
 * Returns Tailwind class strings with centralized values
 */
export const INPUT_HEIGHT_CLASSES = {
  /** Textarea min-h class */
  TEXTAREA: `min-h-[${INPUT_HEIGHTS.TEXTAREA_MIN}px]`,
  /** Select min-h class */
  SELECT: `min-h-[${INPUT_HEIGHTS.SELECT_MIN}px]`,
  /** Button min-h class */
  BUTTON: `min-h-[${INPUT_HEIGHTS.BUTTON_MIN}px]`,
} as const;

export const CONTAINER_WIDTH_CLASSES = {
  /** Tooltip max-w class */
  TOOLTIP: `max-w-[${CONTAINER_WIDTHS.TOOLTIP_MAX}px]`,
  /** Onboarding w class */
  ONBOARDING: `w-[${CONTAINER_WIDTHS.ONBOARDING}px]`,
} as const;

export const MIN_SIZE_CLASSES = {
  /** Toast button min-h + min-w class */
  TOAST_BUTTON: `min-h-[${MIN_SIZES.TOAST_BUTTON}px] min-w-[${MIN_SIZES.TOAST_BUTTON}px]`,
  /** KBD min-w + min-h class */
  KBD: `min-w-[${MIN_SIZES.KBD_MIN_WIDTH}px] min-h-[${MIN_SIZES.KBD_MIN_HEIGHT}px]`,
} as const;

export type InputHeights = typeof INPUT_HEIGHTS;
export type ContainerWidths = typeof CONTAINER_WIDTHS;
export type MinSizes = typeof MIN_SIZES;
