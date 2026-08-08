/**
 * Body Overflow Configuration
 * Centralizes all hardcoded body overflow values used in MobileNav and KeyboardShortcutsHelp
 * Follows the "Flexy" principle: eliminate hardcoded values and make modular systems
 */

/**
 * Body overflow values
 * Replaces hardcoded `document.body.style.overflow = 'hidden'` and `'unset'`
 */
export const BODY_OVERFLOW_VALUES = {
  /** Lock body scroll when modal/menu is open */
  HIDDEN: 'hidden' as const,
  /** Restore body scroll when modal/menu is closed */
  UNSET: 'unset' as const,
} as const;

/**
 * Body overflow configuration
 */
export const BODY_OVERFLOW_CONFIG = {
  VALUES: BODY_OVERFLOW_VALUES,
} as const;

export type BodyOverflowConfig = typeof BODY_OVERFLOW_CONFIG;
