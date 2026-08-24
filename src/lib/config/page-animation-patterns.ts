/**
 * Page Animation Patterns Configuration
 *
 * Centralizes hardcoded Tailwind classes for page animations
 * (fade-in, hover effects). Follows the "Flexy" principle:
 * eliminate hardcoded values and make modular systems.
 *
 * Usage:
 * ```typescript
 * import { PAGE_ANIMATION_PATTERNS } from '@/lib/config/page-animation-patterns';
 *
 * // Instead of hardcoded className:
 * <div className={`${prefersReducedMotion ? '' : 'fade-in'}`}>
 *
 * // Use modular config:
 * <div className={PAGE_ANIMATION_PATTERNS.FADE_IN(prefersReducedMotion)}>
 * ```
 */

/**
 * Page fade-in pattern
 * Used in: results/page.tsx, various page components
 */
export const PAGE_FADE_IN = {
  /** Returns fade-in class if motion is allowed, empty string otherwise */
  get: (prefersReducedMotion: boolean) =>
    prefersReducedMotion ? '' : 'fade-in',
  /** The raw fade-in class name */
  CLASS: 'fade-in',
} as const;

/**
 * Page hover effect patterns
 * Used in: results/page.tsx, various page components
 */
export const PAGE_HOVER_EFFECTS = {
  /** hover:-translate-y-0.5 active:translate-y-0 - subtle lift on hover */
  LIFT: 'hover:-translate-y-0.5 active:translate-y-0',
  /** transition-transform - smooth transform transitions */
  TRANSITION: 'transition-transform',
} as const;

/**
 * Page layout patterns
 * Used in: results/page.tsx, various page components
 */
export const PAGE_LAYOUT_PATTERNS = {
  /** flex flex-wrap - flexible wrapping layout */
  FLEX_WRAP: 'flex flex-wrap',
  /** inline-flex items-center - inline flex with centered items */
  INLINE_FLEX_CENTER: 'inline-flex items-center',
} as const;

/**
 * Combined patterns object for easy access
 */
export const PAGE_ANIMATION_PATTERNS = {
  FADE_IN: PAGE_FADE_IN,
  HOVER_EFFECTS: PAGE_HOVER_EFFECTS,
  LAYOUT: PAGE_LAYOUT_PATTERNS,
} as const;
