/**
 * Footer Grid Patterns Configuration
 *
 * Centralizes hardcoded Tailwind classes for footer grid layouts
 * (responsive grid, keyboard hints). Follows the "Flexy" principle:
 * eliminate hardcoded values and make modular systems.
 *
 * Usage:
 * ```typescript
 * import { FOOTER_GRID_PATTERNS } from '@/lib/config/footer-grid-patterns';
 *
 * // Instead of hardcoded className:
 * <div className="col-span-2 md:col-span-4 flex items-center gap-2">
 *
 * // Use modular config:
 * <div className={FOOTER_GRID_PATTERNS.KEYBOARD_HINTS}>
 * ```
 */

/**
 * Footer keyboard hints pattern
 * Used in: FooterNav.tsx keyboard hints section
 */
export const FOOTER_KEYBOARD_HINTS = {
  /** col-span-2 md:col-span-4 flex items-center gap-2 */
  BASE: 'col-span-2 md:col-span-4 flex items-center gap-2',
} as const;

/**
 * Footer keyboard hints visibility pattern
 * Used in: FooterNav.tsx keyboard hints toggle
 */
export const FOOTER_HINTS_VISIBILITY = {
  /** opacity-60 - when hint is shown */
  VISIBLE: 'opacity-60',
  /** opacity-0 - when hint is hidden */
  HIDDEN: 'opacity-0',
  /** transition-opacity - smooth opacity transition */
  TRANSITION: 'transition-opacity',
} as const;

/**
 * Combined patterns object for easy access
 */
export const FOOTER_GRID_PATTERNS = {
  KEYBOARD_HINTS: FOOTER_KEYBOARD_HINTS,
  HINTS_VISIBILITY: FOOTER_HINTS_VISIBILITY,
} as const;
