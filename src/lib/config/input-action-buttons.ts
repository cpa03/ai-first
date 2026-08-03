/**
 * Input Action Buttons Configuration
 *
 * Centralizes hardcoded positioning and sizing values used for input action buttons
 * (clear button, password toggle, validation icons) in InputWithValidation and similar components.
 *
 * Follows the "Flexy" principle: eliminate hardcoded values and make modular systems
 * that are easy to maintain and update.
 *
 * Usage:
 * ```typescript
 * import { INPUT_ACTION_BUTTONS } from '@/lib/config';
 *
 * // Instead of hardcoded positioning:
 * <div className="absolute right-3 top-1/2 -translate-y-1/2">
 *
 * // Use modular config:
 * <div className={`${INPUT_ACTION_BUTTONS.POSITION.DEFAULT}`}>
 * ```
 */

/**
 * Input action button positioning classes
 * Used for positioning clear button, password toggle, and validation icons
 */
export const INPUT_ACTION_POSITION = {
  /**
   * Default positioning for action buttons (right side, vertically centered)
   */
  DEFAULT: 'absolute right-3 top-1/2 -translate-y-1/2',

  /**
   * Positioning for multiline inputs (right side, top aligned)
   */
  MULTILINE: 'absolute right-3 top-3',

  /**
   * Positioning for validation icon in multiline inputs
   */
  VALIDATION_ICON_MULTILINE: 'absolute right-3 top-3 pointer-events-none',

  /**
   * Positioning for validation icon in single-line inputs
   */
  VALIDATION_ICON_DEFAULT:
    'absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none',

  /**
   * Positioning for clear button when icon or password toggle is present
   */
  CLEAR_WITH_ICON: 'absolute top-1/2 -translate-y-1/2 right-12',

  /**
   * Positioning for clear button without icon
   */
  CLEAR_DEFAULT: 'absolute top-1/2 -translate-y-1/2 right-3',

  /**
   * Positioning for clear button in multiline mode
   */
  CLEAR_MULTILINE: 'absolute top-3 right-3',

  /**
   * Positioning for password toggle when clear button or icon is present
   */
  PASSWORD_TOGGLE_WITH_ICON: 'absolute top-1/2 -translate-y-1/2 right-20',

  /**
   * Positioning for password toggle without icon
   */
  PASSWORD_TOGGLE_DEFAULT: 'absolute top-1/2 -translate-y-1/2 right-14',

  /**
   * Positioning for password toggle in multiline mode
   */
  PASSWORD_TOGGLE_MULTILINE: 'absolute top-3 right-14',

  /**
   * Positioning for copy/action buttons in top-right corner
   */
  TOP_RIGHT: 'absolute top-3 right-3',

  /**
   * Positioning for close/dismiss buttons in top-right corner
   */
  CLOSE_TOP_RIGHT: 'absolute top-2 right-2',

  /**
   * Positioning for buttons in bottom-right corner
   */
  BOTTOM_RIGHT: 'absolute bottom-3 right-3',
} as const;

/**
 * Input action button sizing classes
 * Used for sizing clear button, password toggle, and validation icons
 */
export const INPUT_ACTION_SIZES = {
  /**
   * Clear button size (w-11 h-11 = 44px for touch targets)
   * Env: UI_CLEAR_BUTTON_SIZE (default: 44)
   */
  CLEAR_BUTTON: 'w-11 h-11',

  /**
   * Clear button inner content alignment
   */
  CLEAR_BUTTON_INNER: 'flex items-center justify-center',

  /**
   * Password toggle button size
   */
  PASSWORD_TOGGLE: 'flex items-center gap-1.5 px-2 py-1.5',

  /**
   * Validation icon container for multiline inputs
   */
  VALIDATION_ICON_MULTILINE: 'absolute right-3 top-3 pointer-events-none',

  /**
   * Validation icon container for single-line inputs
   */
  VALIDATION_ICON_DEFAULT:
    'absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none',
} as const;

/**
 * Input action button styling classes
 * Used for styling clear button, password toggle, and validation icons
 */
export const INPUT_ACTION_STYLES = {
  /**
   * Clear button base styling
   */
  CLEAR_BUTTON:
    'flex items-center justify-center rounded-full animate-in fade-in zoom-in disabled:opacity-0',

  /**
   * Password toggle button base styling
   */
  PASSWORD_TOGGLE: 'rounded-md animate-in fade-in zoom-in',

  /**
   * Validation icon base styling
   */
  VALIDATION_ICON: 'pointer-events-none',
} as const;

/**
 * Get positioning class based on input type and available actions
 * @param options - Configuration options for positioning
 * @returns Tailwind class string for positioning
 */
export function getInputActionPosition(options: {
  multiline?: boolean;
  hasIcon?: boolean;
  hasPasswordToggle?: boolean;
  hasClearButton?: boolean;
  buttonType: 'validation' | 'clear' | 'password';
}): string {
  const { multiline, hasIcon, hasPasswordToggle, hasClearButton, buttonType } =
    options;

  if (buttonType === 'validation') {
    return multiline
      ? INPUT_ACTION_POSITION.VALIDATION_ICON_MULTILINE
      : INPUT_ACTION_POSITION.VALIDATION_ICON_DEFAULT;
  }

  if (buttonType === 'clear') {
    if (multiline) {
      return INPUT_ACTION_POSITION.CLEAR_MULTILINE;
    }
    return hasIcon || hasPasswordToggle
      ? INPUT_ACTION_POSITION.CLEAR_WITH_ICON
      : INPUT_ACTION_POSITION.CLEAR_DEFAULT;
  }

  if (buttonType === 'password') {
    if (multiline) {
      return INPUT_ACTION_POSITION.PASSWORD_TOGGLE_MULTILINE;
    }
    return hasIcon || hasClearButton
      ? INPUT_ACTION_POSITION.PASSWORD_TOGGLE_WITH_ICON
      : INPUT_ACTION_POSITION.PASSWORD_TOGGLE_DEFAULT;
  }

  return INPUT_ACTION_POSITION.DEFAULT;
}

export type InputActionPosition = typeof INPUT_ACTION_POSITION;
export type InputActionSizes = typeof INPUT_ACTION_SIZES;
export type InputActionStyles = typeof INPUT_ACTION_STYLES;
