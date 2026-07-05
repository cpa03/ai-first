/**
 * Tailwind Arbitrary Values Configuration
 * Centralizes all hardcoded Tailwind arbitrary values (e.g., text-[10px], min-w-[1.5rem])
 * These values are used in className strings and need to be configurable
 */

import { EnvLoader } from './environment';

/**
 * Dashboard-specific Tailwind arbitrary values
 */
export const DASHBOARD_TAILWIND = {
  /** Status badge minimum width - Env: DASHBOARD_STATUS_BADGE_MIN_W (default: '1.5rem') */
  STATUS_BADGE_MIN_W: EnvLoader.string(
    'DASHBOARD_STATUS_BADGE_MIN_W',
    '1.5rem'
  ),
  /** Keyboard shortcut text size - Env: DASHBOARD_KBD_TEXT_SIZE (default: '10px') */
  KBD_TEXT_SIZE: EnvLoader.string('DASHBOARD_KBD_TEXT_SIZE', '10px'),
} as const;

/**
 * Mobile navigation Tailwind arbitrary values
 */
export const MOBILE_NAV_TAILWIND = {
  /** Active link left border width - Env: MOBILE_NAV_ACTIVE_BORDER_W (default: '3px') */
  ACTIVE_LINK_BORDER_W: EnvLoader.string('MOBILE_NAV_ACTIVE_BORDER_W', '3px'),
} as const;

/**
 * Skeleton loading Tailwind arbitrary values
 */
export const SKELETON_TAILWIND = {
  /** Backdrop blur amount - Env: SKELETON_BACKDROP_BLUR (default: '2px') */
  BACKDROP_BLUR: EnvLoader.string('SKELETON_BACKDROP_BLUR', '2px'),
} as const;

/**
 * Loading spinner Tailwind arbitrary values
 */
export const SPINNER_TAILWIND = {
  /** Border ring top offset - Env: SPINNER_BORDER_RING_OFFSET (default: '-4px') */
  BORDER_RING_OFFSET: EnvLoader.string('SPINNER_BORDER_RING_OFFSET', '-4px'),
} as const;

/**
 * Input validation Tailwind arbitrary values
 */
export const INPUT_TAILWIND = {
  /** Icon width for single icon - Env: INPUT_ICON_WIDTH (default: '40px') */
  ICON_WIDTH: EnvLoader.string('INPUT_ICON_WIDTH', '40px'),
  /** Icon width for dual icons - Env: INPUT_DUAL_ICON_WIDTH (default: '80px') */
  DUAL_ICON_WIDTH: EnvLoader.string('INPUT_DUAL_ICON_WIDTH', '80px'),
} as const;

/**
 * Step celebration Tailwind arbitrary values
 */
export const STEP_CELEBRATION_TAILWIND = {
  /** Backdrop blur amount - Env: STEP_CELEBRATION_BACKDROP_BLUR (default: '2px') */
  BACKDROP_BLUR: EnvLoader.string('STEP_CELEBRATION_BACKDROP_BLUR', '2px'),
} as const;

/**
 * All Tailwind arbitrary values combined
 */
export const TAILWIND_ARBITRARY = {
  DASHBOARD: DASHBOARD_TAILWIND,
  MOBILE_NAV: MOBILE_NAV_TAILWIND,
  SKELETON: SKELETON_TAILWIND,
  SPINNER: SPINNER_TAILWIND,
  INPUT: INPUT_TAILWIND,
  STEP_CELEBRATION: STEP_CELEBRATION_TAILWIND,
} as const;

export type TailwindArbitrary = typeof TAILWIND_ARBITRARY;
