/**
 * Component Labels Configuration
 * Centralizes hardcoded string labels, messages, and aria-labels for UI components
 * Follows the "Flexy" principle: eliminate hardcoded values
 */

/**
 * Share Button Labels
 * Eliminates hardcoded strings in ShareButton component
 */
export const SHARE_BUTTON_LABELS = {
  /** Default button label */
  DEFAULT_LABEL: 'Share',
  /** Success state label after sharing */
  SUCCESS_LABEL: 'Shared!',
  /** ARIA label for the share button */
  ARIA_LABEL: 'Share this page',
  /** Default toast message on clipboard copy */
  CLIPBOARD_TOAST: 'Link copied to clipboard!',
  /** Success message after Web Share API */
  SHARE_SUCCESS: 'Thanks for sharing!',
  /** Error message on clipboard failure */
  CLIPBOARD_ERROR: 'Failed to copy link. Please try again.',
} as const;

/**
 * Copy Button Labels
 * Eliminates hardcoded strings in CopyButton component
 */
export const COPY_BUTTON_LABELS = {
  /** Default button label */
  DEFAULT_LABEL: 'Copy',
  /** Success state label after copying */
  SUCCESS_LABEL: 'Copied!',
  /** ARIA label for the copy button */
  ARIA_LABEL: 'Copy to clipboard',
  /** Default toast message on successful copy */
  CLIPBOARD_TOAST: 'Copied to clipboard!',
  /** Error message on clipboard failure */
  CLIPBOARD_ERROR: 'Failed to copy. Please try selecting and copying manually.',
} as const;

/**
 * Input Validation Labels
 * Eliminates hardcoded strings in InputWithValidation component
 */
export const INPUT_VALIDATION_LABELS = {
  /** Show password label */
  SHOW_PASSWORD: 'Show',
  /** Hide password label */
  HIDE_PASSWORD: 'Hide',
  /** ARIA label to show password */
  SHOW_PASSWORD_ARIA: 'Show password',
  /** ARIA label to hide password */
  HIDE_PASSWORD_ARIA: 'Hide password',
} as const;

/**
 * Tooltip Labels
 * Eliminates hardcoded strings in Tooltip component
 */
export const TOOLTIP_LABELS = {
  /** Default position */
  DEFAULT_POSITION: 'top' as const,
} as const;

/**
 * Component Labels - Combined export
 * Provides all component labels in a single object
 */
export const COMPONENT_LABELS = {
  SHARE_BUTTON: SHARE_BUTTON_LABELS,
  COPY_BUTTON: COPY_BUTTON_LABELS,
  INPUT_VALIDATION: INPUT_VALIDATION_LABELS,
  TOOLTIP: TOOLTIP_LABELS,
} as const;

export type ShareButtonLabels = typeof SHARE_BUTTON_LABELS;
export type CopyButtonLabels = typeof COPY_BUTTON_LABELS;
export type InputValidationLabels = typeof INPUT_VALIDATION_LABELS;
export type ComponentLabels = typeof COMPONENT_LABELS;
