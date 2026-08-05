/**
 * SVG Icon Paths Configuration
 * Centralizes all duplicated SVG icon path data (d attributes)
 * Follows the "Flexy" principle: eliminate hardcoded values and make modular systems
 *
 * These paths are extracted from Heroicons and other SVG icons used across the codebase.
 * By centralizing them, we ensure consistency and eliminate duplication.
 *
 * Usage:
 * ```typescript
 * import { SVG_ICON_PATHS } from '@/lib/config';
 * <path d={SVG_ICON_PATHS.CHECKMARK} />
 * ```
 */

/**
 * Heroicons Checkmark/Success icon (24x24, outline)
 * Used in: signup, clarification flow, progress stepper, blueprint display,
 * step celebration, password checklist, auto-save indicator, scroll-to-top,
 * share button, copy button, keyboard shortcuts help, success celebration,
 * user onboarding, idea input, email button, idea ready indicator,
 * input with validation, deliverable card
 */
export const CHECKMARK = 'M5 13l4 4L19 7';

/**
 * Heroicons Information Circle icon (24x24, outline)
 * Used in: signup, clarification flow, task management
 */
export const INFO_CIRCLE =
  'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';

/**
 * Heroicons Exclamation Triangle icon (24x24, outline)
 * Used in: signup, input with validation
 */
export const EXCLAMATION_TRIANGLE =
  'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';

/**
 * Heroicons Clock icon (24x24, outline)
 * Used in: clarification flow, task item
 */
export const CLOCK = 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';

/**
 * Heroicons Document icon (24x24, outline)
 * Used in: clarification flow, task management, idea input
 */
export const DOCUMENT =
  'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2';

/**
 * Heroicons Document Check icon (24x24, outline)
 * Used in: task management
 */
export const DOCUMENT_CHECK =
  'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4';

/**
 * Heroicons Search icon (24x24, outline)
 * Used in: keyboard shortcuts help
 */
export const SEARCH = 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z';

/**
 * Heroicons Pencil/ExternalLink icon (24x24, outline)
 * Used in: keyboard shortcuts provider, keyboard shortcuts help
 */
export const PENCIL =
  'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122';

/**
 * Heroicons Arrow Right icon (24x24, outline)
 * Used in: clarification flow, results page
 */
export const ARROW_RIGHT = 'M9 5l7 7-7 7';

/**
 * Heroicons Arrow Left icon (24x24, outline)
 * Used in: clarification flow
 */
export const ARROW_LEFT = 'M10 19l-7-7m0 0l7-7m-7 7h18';

/**
 * Heroicons Chevron Down icon (24x24, outline)
 * Used in: clarification flow
 */
export const CHEVRON_DOWN = 'M19 9l-7 7-7-7';

/**
 * Heroicons Refresh icon (24x24, outline)
 * Used in: auth callback
 */
export const REFRESH =
  'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15';

/**
 * Heroicons X/Close icon (24x24, outline)
 * Used in: auth callback
 */
export const CLOSE = 'M6 18L18 6M6 6l12 12';

/**
 * Heroicons Arrow Down icon (24x24, outline)
 * Used in: layout
 */
export const ARROW_DOWN = 'M19 14l-7 7m0 0l-7-7m7 7V3';

/**
 * Heroicons Refresh Circle icon (24x24, outline)
 * Used in: auth callback
 */
export const REFRESH_CIRCLE =
  'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';

/**
 * All SVG icon paths grouped for easy access
 */
export const SVG_ICON_PATHS = {
  CHECKMARK,
  INFO_CIRCLE,
  EXCLAMATION_TRIANGLE,
  CLOCK,
  DOCUMENT,
  DOCUMENT_CHECK,
  SEARCH,
  PENCIL,
  ARROW_RIGHT,
  ARROW_LEFT,
  CHEVRON_DOWN,
  REFRESH,
  CLOSE,
  ARROW_DOWN,
  REFRESH_CIRCLE,
} as const;

export type SvgIconPaths = typeof SVG_ICON_PATHS;
