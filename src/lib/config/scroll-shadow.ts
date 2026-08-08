/**
 * ScrollShadow Configuration
 * Centralizes all hardcoded values used in ScrollShadow component
 * Follows the "Flexy" principle: eliminate hardcoded values and make modular systems
 */

/**
 * Box shadow values for the header when scrolled
 * Replaces hardcoded rgb() shadow values in ScrollShadow.tsx
 */
export const SCROLL_SHADOW_BOX_SHADOWS = {
  /** Subtle shadow for users with prefers-reduced-motion enabled */
  REDUCED_MOTION:
    '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  /** Full shadow for users without motion preferences */
  DEFAULT: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
} as const;

/**
 * Transition values for header shadow animation
 * Replaces hardcoded transition strings in ScrollShadow.tsx
 */
export const SCROLL_SHADOW_TRANSITIONS = {
  /** No transition for reduced motion */
  NONE: 'none',
  /** Smooth shadow transition */
  SHADOW: 'box-shadow 200ms ease-out',
} as const;

/**
 * Scroll threshold in pixels
 * Replaces hardcoded `window.scrollY > 10` in ScrollShadow.tsx
 */
export const SCROLL_SHADOW_THRESHOLD = 10 as const;

/**
 * Complete ScrollShadow configuration
 */
export const SCROLL_SHADOW_CONFIG = {
  SHADOWS: SCROLL_SHADOW_BOX_SHADOWS,
  TRANSITIONS: SCROLL_SHADOW_TRANSITIONS,
  THRESHOLD: SCROLL_SHADOW_THRESHOLD,
} as const;

export type ScrollShadowConfig = typeof SCROLL_SHADOW_CONFIG;
