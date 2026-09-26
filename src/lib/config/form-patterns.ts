/**
 * Form Patterns Configuration
 *
 * Centralizes all form-related Tailwind patterns used throughout the codebase.
 * Follows the "Flexy" principle: eliminate hardcoded values and make modular systems.
 *
 * Usage:
 * ```typescript
 * import { FORM_PATTERNS } from '@/lib/config/form-patterns';
 *
 * // Instead of hardcoded className:
 * <input className="w-full text-sm" />
 *
 * // Use modular config:
 * <input className={`${FORM_PATTERNS.WIDTH.FULL} ${FORM_PATTERNS.TEXT_SIZES.SM}`} />
 * ```
 */

/**
 * Form input text sizes
 * Used in: Login, Signup pages
 */
export const FORM_TEXT_SIZES = {
  /** text-sm - for form labels and descriptions */
  SM: 'text-sm',
  /** text-xs - for form hints and secondary text */
  XS: 'text-xs',
} as const;

/**
 * Form input width classes
 * Used in: Login, Signup, Auth callback
 */
export const FORM_WIDTH = {
  /** w-full - full width inputs */
  FULL: 'w-full',
  /** w-full sm:w-auto - responsive width */
  RESPONSIVE: 'w-full sm:w-auto',
} as const;

/**
 * Form container styles
 * Used in: Signup page
 */
export const FORM_CONTAINER = 'relative flex justify-center text-sm';

/**
 * Form item layout
 * Used in: Signup page feature list
 */
export const FORM_ITEM_LAYOUT = 'flex items-center gap-1';

/**
 * Peer sr-only pattern for form inputs
 * Used in: Login page form inputs
 */
export const PEER_SR_ONLY = 'peer sr-only';

/**
 * Combined form patterns for easy access
 */
export const FORM_PATTERNS = {
  /** Form input text sizes */
  TEXT_SIZES: FORM_TEXT_SIZES,
  /** Form input width classes */
  WIDTH: FORM_WIDTH,
  /** Form container styles */
  CONTAINER: FORM_CONTAINER,
  /** Form item layout */
  ITEM_LAYOUT: FORM_ITEM_LAYOUT,
  /** Peer sr-only pattern */
  PEER_SR_ONLY,
} as const;
