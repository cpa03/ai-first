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
  /** Tooltip for invalid input error icon */
  FIX_ERROR_TOOLTIP: 'Please fix this error',
  /** Character limit progress aria-label */
  CHAR_LIMIT_PROGRESS_ARIA: 'Character limit progress',
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
 * Layout Error Fallback Labels
 * Eliminates hardcoded strings in LayoutErrorFallback component
 */
export const LAYOUT_ERROR_LABELS = {
  /** Retry button label */
  RETRY_BUTTON: 'Try Again',
  /** Home link label */
  HOME_LINK: 'Back to Home',
  /** Default error title */
  DEFAULT_TITLE: 'Something went wrong',
  /** Default error message */
  DEFAULT_MESSAGE: 'An unexpected error occurred. Please try again.',
} as const;

/**
 * ScrollToTop Labels
 * Eliminates hardcoded strings in ScrollToTop component
 */
export const SCROLL_TO_TOP_LABELS = {
  /** Main tooltip title */
  TITLE: 'Back to top',
  /** Screen reader text */
  SR_TEXT: 'Back to top',
  /** Scroll instruction label */
  SCROLL_INSTRUCTION: 'Scroll 25%',
  /** Top position label */
  TOP: 'Top',
  /** Bottom position label */
  BOTTOM: 'Bottom',
  /** Keyboard key labels */
  KEYS: {
    UP: '↑',
    DOWN: '↓',
    HOME: 'Home',
    END: 'End',
  },
  /** Separator between keyboard shortcuts */
  SEPARATOR: '·',
  /** ARIA label template for the button */
  ARIA_LABEL: (progress: number) =>
    `Scroll to top (${progress}% scrolled). Use arrow keys to scroll by 25%, Home or End to go to top or bottom.`,
} as const;

/**
 * ToastContainer Labels
 * Eliminates hardcoded strings in ToastContainer component
 */
export const TOAST_CONTAINER_LABELS = {
  DISMISS_INSTRUCTION: 'Press Escape to dismiss',
  CLOSE_ARIA_LABEL: 'Close notification',
  REGION_ARIA_LABEL: 'Notifications',
} as const;

/**
 * AutoSaveIndicator Labels
 * Eliminates hardcoded strings in AutoSaveIndicator component
 */
export const AUTO_SAVE_INDICATOR_LABELS = {
  /** Last saved text */
  LAST_SAVED: 'Last saved',
  /** Typing state label */
  TYPING: 'Typing...',
  /** Saving state label */
  SAVING: 'Saving...',
  /** Saved state label */
  SAVED: 'Saved',
  /** Just now timestamp label */
  JUST_NOW: 'just now',
} as const;

/**
 * KeyboardShortcutsHelp Labels
 * Eliminates hardcoded strings in KeyboardShortcutsHelp component
 */
export const KEYBOARD_SHORTCUTS_HELP_LABELS = {
  /** Tip aria-label */
  TIP_ARIA_LABEL: 'Tip',
  /** Tip text content */
  TIP_TEXT: 'Tip: Enable vim mode to navigate with j/k keys',
  /** No results title */
  NO_RESULTS_TITLE: 'No shortcuts found',
  /** No results description */
  NO_RESULTS_DESCRIPTION:
    'Try a different search term or clear the search to see all shortcuts.',
  /** Clear search button label */
  CLEAR_SEARCH_LABEL: 'Clear search',
  /** Search input aria-label */
  SEARCH_ARIA_LABEL: 'Search keyboard shortcuts',
  /** Close button aria-label */
  CLOSE_ARIA_LABEL: 'Close command palette',
  /** Keyboard shortcut context labels */
  CONTEXT_LABELS: {
    global: 'Global',
    form: 'Forms',
    navigation: 'Navigation',
    modal: 'Modals',
    command: 'Commands',
  } as const,
  /** Keyboard shortcut context display order */
  CONTEXT_ORDER: ['global', 'command', 'navigation', 'form', 'modal'] as const,
} as const;

/**
 * ProgressStepper Labels
 * Eliminates hardcoded aria-labels in ProgressStepper component
 */
export const PROGRESS_STEPPER_LABELS = {
  /** Navigation aria-label for the stepper */
  NAV_ARIA_LABEL: 'Question progress',
  /** Step completion status labels */
  STEP_CURRENT: 'Current',
  STEP_COMPLETED: 'Completed',
  STEP_UPCOMING: 'Upcoming',
  /** Progress bar aria-label template */
  PROGRESS_ARIA_LABEL: (completed: number, total: number, percentage: number) =>
    `Progress: ${completed} of ${total} steps completed, ${percentage}%`,
  /** Checkmark SVG aria-label */
  CHECKMARK_ARIA_LABEL: 'Completed',
  /** Step counter label */
  STEP_COUNTER: (current: number, total: number) =>
    `Step ${current} of ${total}`,
} as const;

/**
 * ReferralLink Labels
 * Eliminates hardcoded aria-labels and strings in ReferralLink component
 */
export const REFERRAL_LINK_LABELS = {
  /** Region aria-label */
  REGION_ARIA_LABEL: 'Referral link',
  /** Title text */
  TITLE: 'Share Your Referral Link',
  /** Description text */
  DESCRIPTION: 'Invite friends and earn rewards when they sign up!',
  /** Copy button label */
  COPY_LABEL: 'Copy',
  /** Copy button success label */
  COPY_SUCCESS_LABEL: 'Copied!',
  /** Copy button aria-label */
  COPY_ARIA_LABEL: 'Copy referral link',
  /** Copy button toast message */
  COPY_TOAST_MESSAGE: 'Referral link copied!',
} as const;

/**
 * Alert Labels
 * Eliminates hardcoded aria-labels in Alert component
 */
export const ALERT_LABELS = {
  /** Dismiss button aria-label */
  DISMISS_ARIA_LABEL: 'Dismiss alert',
} as const;

/**
 * KeyboardShortcutsProvider Labels
 * Eliminates hardcoded aria-labels in KeyboardShortcutsProvider component
 */
export const KEYBOARD_SHORTCUTS_PROVIDER_LABELS = {
  /** Help button aria-label */
  HELP_BUTTON_ARIA_LABEL: 'Open keyboard shortcuts help',
} as const;

/**
 * IdeaInput Labels
 * Eliminates hardcoded aria-labels in IdeaInput component
 */
export const IDEA_INPUT_LABELS = {
  /** Writing progress aria-label */
  WRITING_PROGRESS_ARIA_LABEL: 'Writing progress',
} as const;

/**
 * UserOnboarding Labels
 * Eliminates hardcoded aria-labels and strings in UserOnboarding component
 */
export const USER_ONBOARDING_LABELS = {
  COMPLETION_ARIA_LABEL: 'Onboarding complete',
  PROGRESS_ARIA_LABEL: 'Onboarding progress',
  SKIP_ARIA_LABEL: 'Skip onboarding tour',
  TOUR_STEPS: [
    {
      id: 'welcome',
      title: 'Welcome to IdeaFlow! 👋',
      content:
        "Transform your ideas into actionable project plans with AI. Let's take a quick tour.",
      targetSelector: 'h1',
      position: 'bottom',
    },
    {
      id: 'idea-input',
      title: '1. Share Your Idea',
      content:
        'Enter your project idea in natural language. Our AI will help clarify details.',
      targetSelector: '[aria-labelledby="idea-input-heading"]',
      position: 'top',
    },
    {
      id: 'breakdown',
      title: '2. Get Your Project Plan',
      content:
        'We break down your idea into tasks, estimate effort, and create a realistic timeline.',
      targetSelector: '[aria-labelledby="how-it-works-heading"]',
      position: 'top',
    },
    {
      id: 'share',
      title: '3. Export or Share',
      content: 'Export to Markdown, Notion, Trello, or share with your team!',
      targetSelector: '[aria-label*="Share IdeaFlow"]',
      position: 'left',
    },
  ],
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
  LAYOUT_ERROR: LAYOUT_ERROR_LABELS,
  SCROLL_TO_TOP: SCROLL_TO_TOP_LABELS,
  TOAST_CONTAINER: TOAST_CONTAINER_LABELS,
  AUTO_SAVE_INDICATOR: AUTO_SAVE_INDICATOR_LABELS,
  KEYBOARD_SHORTCUTS_HELP: KEYBOARD_SHORTCUTS_HELP_LABELS,
  PROGRESS_STEPPER: PROGRESS_STEPPER_LABELS,
  REFERRAL_LINK: REFERRAL_LINK_LABELS,
  ALERT: ALERT_LABELS,
  KEYBOARD_SHORTCUTS_PROVIDER: KEYBOARD_SHORTCUTS_PROVIDER_LABELS,
  IDEA_INPUT: IDEA_INPUT_LABELS,
  USER_ONBOARDING: USER_ONBOARDING_LABELS,
} as const;

export type ShareButtonLabels = typeof SHARE_BUTTON_LABELS;
export type CopyButtonLabels = typeof COPY_BUTTON_LABELS;
export type InputValidationLabels = typeof INPUT_VALIDATION_LABELS;
export type LayoutErrorLabels = typeof LAYOUT_ERROR_LABELS;
export type ScrollToTopLabels = typeof SCROLL_TO_TOP_LABELS;
export type ToastContainerLabels = typeof TOAST_CONTAINER_LABELS;
export type AutoSaveIndicatorLabels = typeof AUTO_SAVE_INDICATOR_LABELS;
export type KeyboardShortcutsHelpLabels = typeof KEYBOARD_SHORTCUTS_HELP_LABELS;
export type ProgressStepperLabels = typeof PROGRESS_STEPPER_LABELS;
export type ReferralLinkLabels = typeof REFERRAL_LINK_LABELS;
export type AlertLabels = typeof ALERT_LABELS;
export type KeyboardShortcutsProviderLabels =
  typeof KEYBOARD_SHORTCUTS_PROVIDER_LABELS;
export type IdeaInputLabels = typeof IDEA_INPUT_LABELS;
export type UserOnboardingLabels = typeof USER_ONBOARDING_LABELS;
export type ComponentLabels = typeof COMPONENT_LABELS;
