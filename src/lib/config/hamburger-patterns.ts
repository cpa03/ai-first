/**
 * Mobile Nav Hamburger Patterns Configuration
 *
 * Centralizes hardcoded Tailwind classes for mobile navigation hamburger menu
 * (menu lines, animations). Follows the "Flexy" principle:
 * eliminate hardcoded values and make modular systems.
 *
 * Usage:
 * ```typescript
 * import { HAMBURGER_PATTERNS } from '@/lib/config/hamburger-patterns';
 *
 * // Instead of hardcoded className:
 * <div className="flex flex-col justify-center items-center">
 *
 * // Use modular config:
 * <div className={HAMBURGER_PATTERNS.CONTAINER}>
 * ```
 */

/**
 * Hamburger container pattern
 * Used in: MobileNav.tsx hamburger menu container
 */
export const HAMBURGER_CONTAINER = {
  /** flex flex-col justify-center items-center */
  BASE: 'flex flex-col justify-center items-center',
} as const;

/**
 * Hamburger line pattern
 * Used in: MobileNav.tsx hamburger menu lines
 */
export const HAMBURGER_LINE = {
  /** block bg-current rounded-full ease-in-out motion-reduce:transition-none */
  BASE: 'block bg-current rounded-full ease-in-out motion-reduce:transition-none',
  /** rotate-45 translate-y-1 - open state transformation */
  OPEN_TRANSFORM: 'rotate-45 translate-y-1',
  /** opacity-0 scale-0 - hidden state */
  HIDDEN: 'opacity-0 scale-0',
} as const;

/**
 * Hamburger transition patterns
 * Used in: MobileNav.tsx menu animations
 */
export const HAMBURGER_TRANSITIONS = {
  /** ease-in-out - smooth easing */
  EASING: 'ease-in-out',
  /** motion-reduce:transition-none - respect reduced motion */
  REDUCED_MOTION: 'motion-reduce:transition-none',
} as const;

/**
 * Combined patterns object for easy access
 */
export const HAMBURGER_PATTERNS = {
  CONTAINER: HAMBURGER_CONTAINER,
  LINE: HAMBURGER_LINE,
  TRANSITIONS: HAMBURGER_TRANSITIONS,
} as const;
