/**
 * Dashboard Animation Patterns Configuration
 *
 * Centralizes hardcoded Tailwind classes for dashboard animations
 * (float, hover effects). Follows the "Flexy" principle:
 * eliminate hardcoded values and make modular systems.
 *
 * Usage:
 * ```typescript
 * import { DASHBOARD_ANIMATION_PATTERNS } from '@/lib/config/dashboard-animation-patterns';
 *
 * // Instead of hardcoded className:
 * <div className={`${prefersReducedMotion ? '' : 'animate-float'}`}>
 *
 * // Use modular config:
 * <div className={DASHBOARD_ANIMATION_PATTERNS.FLOAT(prefersReducedMotion)}>
 * ```
 */

/**
 * Dashboard float animation pattern
 * Used in: dashboard/page.tsx step icons
 */
export const DASHBOARD_FLOAT = {
  /** Returns animate-float if motion is allowed, empty string otherwise */
  get: (prefersReducedMotion: boolean) =>
    prefersReducedMotion ? '' : 'animate-float',
  /** The raw animate-float class name */
  CLASS: 'animate-float',
} as const;

/**
 * Dashboard animation patterns
 * Used in: dashboard/page.tsx various animations
 */
export const DASHBOARD_ANIMATIONS = {
  /** animate-float - floating animation */
  FLOAT: 'animate-float',
} as const;

/**
 * Combined patterns object for easy access
 */
export const DASHBOARD_ANIMATION_PATTERNS = {
  FLOAT: DASHBOARD_FLOAT,
  ANIMATIONS: DASHBOARD_ANIMATIONS,
} as const;
