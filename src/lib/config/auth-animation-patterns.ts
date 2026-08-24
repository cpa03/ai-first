/**
 * Auth Animation Patterns Configuration
 *
 * Centralizes hardcoded Tailwind classes for auth-related animations
 * (spin, reduce motion). Follows the "Flexy" principle:
 * eliminate hardcoded values and make modular systems.
 *
 * Usage:
 * ```typescript
 * import { AUTH_ANIMATION_PATTERNS } from '@/lib/config/auth-animation-patterns';
 *
 * // Instead of hardcoded className:
 * <div className={`${prefersReducedMotion ? '' : 'motion-reduce:animate-none'}`}>
 *
 * // Use modular config:
 * <div className={AUTH_ANIMATION_PATTERNS.REDUCED_MOTION(prefersReducedMotion)}>
 * ```
 */

/**
 * Auth reduced motion pattern
 * Used in: auth/callback/page.tsx spinner
 */
export const AUTH_REDUCED_MOTION = {
  /** Returns motion-reduce:animate-none if motion is allowed, empty string otherwise */
  get: (prefersReducedMotion: boolean) =>
    prefersReducedMotion ? '' : 'motion-reduce:animate-none',
  /** The raw motion-reduce:animate-none class name */
  CLASS: 'motion-reduce:animate-none',
} as const;

/**
 * Auth spinner patterns
 * Used in: auth/callback/page.tsx spinner
 */
export const AUTH_SPINNER = {
  /** animate-spin rounded-full - spinning animation */
  SPIN: 'animate-spin rounded-full',
} as const;

/**
 * Auth animation patterns
 * Used in: signup/page.tsx strength indicator
 */
export const AUTH_STRENGTH_ANIMATION = {
  /** animate-strength-transition-pulse - strength transition animation */
  PULSE: 'animate-strength-transition-pulse',
} as const;

/**
 * Combined patterns object for easy access
 */
export const AUTH_ANIMATION_PATTERNS = {
  REDUCED_MOTION: AUTH_REDUCED_MOTION,
  SPINNER: AUTH_SPINNER,
  STRENGTH: AUTH_STRENGTH_ANIMATION,
} as const;
