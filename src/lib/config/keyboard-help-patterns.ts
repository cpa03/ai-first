/**
 * Keyboard Shortcuts Help Patterns Configuration
 *
 * Centralizes hardcoded Tailwind classes for keyboard shortcuts help modal
 * (backdrop, modal, transitions). Follows the "Flexy" principle:
 * eliminate hardcoded values and make modular systems.
 *
 * Usage:
 * ```typescript
 * import { KEYBOARD_HELP_PATTERNS } from '@/lib/config/keyboard-help-patterns';
 *
 * // Instead of hardcoded className:
 * <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity">
 *
 * // Use modular config:
 * <div className={KEYBOARD_HELP_PATTERNS.BACKDROP}>
 * ```
 */

/**
 * Keyboard shortcuts help backdrop pattern
 * Used in: KeyboardShortcutsHelp.tsx modal backdrop
 */
export const KEYBOARD_HELP_BACKDROP = {
  /** absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity */
  BASE: 'absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity',
  /** opacity-0 - hidden state */
  HIDDEN: 'opacity-0',
  /** opacity-50 - visible state */
  VISIBLE: 'opacity-50',
} as const;

/**
 * Keyboard shortcuts help modal pattern
 * Used in: KeyboardShortcutsHelp.tsx modal container
 */
export const KEYBOARD_HELP_MODAL = {
  /** relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden transform transition-all */
  BASE: 'relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden transform transition-all',
  /** opacity-0 scale-95 translate-y-4 - leaving state */
  LEAVING: 'opacity-0 scale-95 translate-y-4',
  /** opacity-100 scale-100 translate-y-0 - entering state */
  ENTERING: 'opacity-100 scale-100 translate-y-0',
} as const;

/**
 * Keyboard shortcuts help transition patterns
 * Used in: KeyboardShortcutsHelp.tsx modal transitions
 */
export const KEYBOARD_HELP_TRANSITIONS = {
  /** transition-all - all property transitions */
  ALL: 'transition-all',
  /** transition-opacity - opacity transitions */
  OPACITY: 'transition-opacity',
} as const;

/**
 * Combined patterns object for easy access
 */
export const KEYBOARD_HELP_PATTERNS = {
  BACKDROP: KEYBOARD_HELP_BACKDROP,
  MODAL: KEYBOARD_HELP_MODAL,
  TRANSITIONS: KEYBOARD_HELP_TRANSITIONS,
} as const;
