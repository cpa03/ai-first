/**
 * Alert Interactive Patterns Configuration
 *
 * Centralizes hardcoded Tailwind classes for alert interactive elements
 * (shortcut hints, keyboard shortcuts). Follows the "Flexy" principle:
 * eliminate hardcoded values and make modular systems.
 *
 * Usage:
 * ```typescript
 * import { ALERT_SHORTCUT_HINT, ALERT_SHORTCUT_KBD } from '@/lib/config/alert-interactive-patterns';
 *
 * // Instead of hardcoded className:
 * <div className="flex items-center gap-2 text-xs opacity-0 focus-within:opacity-60 hover:opacity-60 transition-opacity">
 *
 * // Use modular config:
 * <div className={ALERT_SHORTCUT_HINT.BASE}>
 * ```
 */

/**
 * Alert shortcut hint container
 * Used in: Alert.tsx shortcut hint overlay
 */
export const ALERT_SHORTCUT_HINT = {
  /** flex items-center gap-2 text-xs opacity-0 focus-within:opacity-60 hover:opacity-60 transition-opacity */
  BASE: 'flex items-center gap-2 text-xs opacity-0 focus-within:opacity-60 hover:opacity-60 transition-opacity',
  /** opacity-60 - when shortcut hint is shown */
  VISIBLE: 'opacity-60',
  /** opacity-0 - when shortcut hint is hidden */
  HIDDEN: 'opacity-0',
} as const;

/**
 * Alert shortcut kbd styling
 * Used in: Alert.tsx keyboard shortcut display
 */
export const ALERT_SHORTCUT_KBD = {
  /** px-1 py-0.5 bg-gray-200/50 rounded text-xs font-mono */
  BASE: 'px-1 py-0.5 bg-gray-200/50 rounded text-xs font-mono',
} as const;

/**
 * Alert snooze button styles
 * Used in: Alert.tsx snooze button
 */
export const ALERT_SNOOZE_BUTTON = {
  /** text-xs opacity-50 hover:opacity-100 transition-opacity p-0.5 rounded */
  BASE: 'text-xs opacity-50 hover:opacity-100 transition-opacity p-0.5 rounded',
} as const;

/**
 * Alert progress bar styles
 * Used in: Alert.tsx auto-dismiss progress bar
 */
export const ALERT_PROGRESS_BAR = {
  /** absolute bottom-0 left-0 bg-current opacity-30 transition-all ease-linear rounded-b-lg */
  BASE: 'absolute bottom-0 left-0 bg-current opacity-30 transition-all ease-linear rounded-b-lg',
} as const;

/**
 * Combined patterns object for easy access
 */
export const ALERT_INTERACTIVE_PATTERNS = {
  SHORTCUT_HINT: ALERT_SHORTCUT_HINT,
  SHORTCUT_KBD: ALERT_SHORTCUT_KBD,
  SNOOZE_BUTTON: ALERT_SNOOZE_BUTTON,
  PROGRESS_BAR: ALERT_PROGRESS_BAR,
} as const;
