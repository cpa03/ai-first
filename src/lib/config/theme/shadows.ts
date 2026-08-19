/**
 * Theme Shadows Module
 * Centralizes all shadow-related theme constants
 */

import { SHADOW_COLOR_PRESETS } from './shadow-colors';

/**
 * Shadow ring size configuration (in pixels)
 * Centralizes the hardcoded 3px value used in focus rings
 */
export const SHADOW_RING_SIZE = {
  /** Standard focus ring size */
  STANDARD: 3,
  /** Small focus ring size */
  SMALL: 2,
  /** Large focus ring size */
  LARGE: 4,
} as const;

/**
 * State shadow utilities for form inputs (non-focus states)
 * Uses modular shadow colors from shadow-colors.ts
 */
export const STATE_SHADOWS = {
  SUCCESS: `shadow-[0_0_0_${SHADOW_RING_SIZE.STANDARD}px_${SHADOW_COLOR_PRESETS.STATE.SUCCESS}]`,
  PRIMARY: `shadow-[0_0_0_${SHADOW_RING_SIZE.STANDARD}px_${SHADOW_COLOR_PRESETS.STATE.PRIMARY}]`,
  ERROR: `shadow-[0_0_0_${SHADOW_RING_SIZE.STANDARD}px_${SHADOW_COLOR_PRESETS.STATE.ERROR}]`,
} as const;

/**
 * Focus ring shadow utilities for form inputs
 * Uses modular shadow colors from shadow-colors.ts
 */
export const FOCUS_SHADOWS = {
  PRIMARY: `focus-visible:shadow-[0_0_0_${SHADOW_RING_SIZE.STANDARD}px_${SHADOW_COLOR_PRESETS.STATE.PRIMARY}]`,
  ERROR: `focus-visible:shadow-[0_0_0_${SHADOW_RING_SIZE.STANDARD}px_${SHADOW_COLOR_PRESETS.STATE.ERROR}]`,
  SUCCESS: `focus-visible:shadow-[0_0_0_${SHADOW_RING_SIZE.STANDARD}px_${SHADOW_COLOR_PRESETS.STATE.SUCCESS}]`,
  WARNING: `focus-visible:shadow-[0_0_0_${SHADOW_RING_SIZE.STANDARD}px_${SHADOW_COLOR_PRESETS.STATE.WARNING}]`,
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
