/**
 * Final Remaining Hardcoded Patterns
 * Centralizes the last remaining hardcoded Tailwind classes in components
 * Follows the "Flexy" principle: eliminate hardcoded values and make modular systems
 */

/**
 * Keyboard Shortcuts Help patterns
 * Replaces hardcoded classes in KeyboardShortcutsHelp.tsx
 */
export const KEYBOARD_SHORTCUTS_HELP_PATTERNS = {
  /** Category filter container */
  CATEGORY_FILTER_CONTAINER: 'px-6 py-3 border-b flex flex-wrap gap-2',
  /** Category filter button */
  CATEGORY_FILTER_BUTTON:
    'px-3 py-1 text-xs font-medium rounded-full transition-all',
  /** Search input container */
  SEARCH_INPUT_CONTAINER: 'relative',
  /** Scrollable content area */
  SCROLLABLE_CONTENT: 'overflow-y-auto p-6',
} as const;

/**
 * Keyboard shortcuts help aria labels
 * Replaces hardcoded aria-label strings in KeyboardShortcutsHelp.tsx
 */
export const KEYBOARD_SHORTCUTS_HELP_ARIA_LABELS = {
  /** Category filter tablist aria-label */
  CATEGORY_FILTER_ARIA_LABEL: 'Filter shortcuts by category',
  /** Category filter "All" button text */
  CATEGORY_ALL: 'All',
} as const;

/**
 * Loading Spinner patterns
 * Replaces hardcoded classes in LoadingSpinner.tsx
 */
export const LOADING_SPINNER_PATTERNS = {
  /** Main container */
  CONTAINER: 'flex justify-center items-center gap-2.5',
  /** Hidden state */
  HIDDEN: 'opacity-0 scale-90',
  /** Visible state */
  VISIBLE: 'opacity-100 scale-100',
} as const;

/**
 * Password Requirements patterns
 * Replaces hardcoded classes in PasswordRequirementsChecklist.tsx
 */
export const PASSWORD_REQUIREMENTS_PATTERNS = {
  /** Container spacing */
  CONTAINER: 'space-y-2',
} as const;

/**
 * Blueprint Display patterns
 * Replaces hardcoded classes in BlueprintDisplay.tsx
 */
export const BLUEPRINT_DISPLAY_PATTERNS = {
  /** Keyboard hint overlay position */
  KEYBOARD_HINT_OVERLAY: 'absolute top-3 right-3',
  /** Keyboard hint inline */
  KEYBOARD_HINT_INLINE: 'flex items-center gap-1.5 px-2.5 py-1.5',
} as const;

/**
 * Feature Grid patterns
 * Replaces hardcoded classes in FeatureGrid.tsx
 */
export const FEATURE_GRID_PATTERNS = {
  /** Icon container */
  ICON_CONTAINER: 'flex items-center justify-center mx-auto mb-4',
  /** Decorative line - desktop */
  DECORATIVE_LINE_DESKTOP: 'hidden md:block absolute top-1/2 -right-4',
  /** Decorative line - mobile */
  DECORATIVE_LINE_MOBILE: 'md:hidden absolute left-1/2 -bottom-4',
} as const;

/**
 * Toast Container patterns
 * Replaces hardcoded classes in ToastContainer.tsx
 */
export const TOAST_CONTAINER_PATTERNS = {
  /** Toast item container */
  TOAST_ITEM: 'border rounded-lg shadow-lg p-4',
  /** Toast content layout */
  TOAST_CONTENT: 'flex items-start gap-3 max-w-md relative overflow-hidden',
  /** Toast list positioning */
  TOAST_LIST:
    'fixed top-4 right-4 z-[600] flex flex-col gap-2 max-h-screen overflow-y-auto',
} as const;

/**
 * Scroll To Top Button patterns
 * Replaces hardcoded classes in ScrollToTopButton.tsx
 */
export const SCROLL_TO_TOP_BUTTON_PATTERNS = {
  /** Main container */
  CONTAINER: 'inline-flex items-center gap-1.5',
} as const;

/**
 * Tooltip positioning patterns
 * Replaces hardcoded positioning classes in Tooltip.tsx
 */
export const TOOLTIP_POSITIONING = {
  TOP: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  BOTTOM: 'top-full left-1/2 -translate-x-1/2 mt-2',
  LEFT: 'right-full top-1/2 -translate-y-1/2 mr-2',
  RIGHT: 'left-full top-1/2 -translate-y-1/2 ml-2',
} as const;

/**
 * Section Indicator patterns
 * Replaces hardcoded classes in SectionIndicator.tsx
 */
export const SECTION_INDICATOR_PATTERNS = {
  /** Dots container */
  DOTS_CONTAINER: 'flex flex-col gap-2',
  /** Dot button */
  DOT_BUTTON: 'p-2',
} as const;

/**
 * Progress Stepper patterns
 * Replaces hardcoded classes in ProgressStepper.tsx
 */
export const PROGRESS_STEPPER_PATTERNS = {
  /** Connector margin */
  CONNECTOR_MARGIN: 'flex-1 mx-4',
} as const;

/**
 * Mobile Nav patterns
 * Replaces hardcoded classes in MobileNav.tsx
 */
export const MOBILE_NAV_PATTERNS = {
  /** Nav item padding */
  NAV_ITEM_PADDING: 'px-4 py-3 text-sm sm:text-base font-medium',
  /** Nav link padding */
  NAV_LINK_PADDING: 'w-full text-left px-6 py-4 text-lg font-semibold',
} as const;

/**
 * Keyboard Shortcut Hint patterns
 * Replaces hardcoded classes in KeyboardShortcutHint.tsx
 */
export const KEYBOARD_SHORTCUT_HINT_PATTERNS = {
  /** Hint container */
  HINT_CONTAINER:
    'p-4 transition-opacity transition-transform will-change-transform',
} as const;

/**
 * Share Button patterns
 * Replaces hardcoded classes in ShareButton.tsx
 */
export const SHARE_BUTTON_PATTERNS = {
  /** Button container */
  BUTTON_CONTAINER: 'inline-flex items-center justify-center gap-2',
  /** Dropdown item */
  DROPDOWN_ITEM: 'px-3 py-1.5 text-sm',
  /** Dropdown icon size */
  DROPDOWN_ICON: 'p-1.5',
} as const;

/**
 * Copy Button patterns
 * Replaces hardcoded classes in CopyButton.tsx
 */
export const COPY_BUTTON_PATTERNS = {
  /** Button container */
  BUTTON_CONTAINER: 'inline-flex items-center justify-center gap-2',
} as const;
