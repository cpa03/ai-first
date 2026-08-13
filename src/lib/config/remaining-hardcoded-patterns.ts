/**
 * Remaining Hardcoded Patterns Configuration
 *
 * Centralizes the final remaining hardcoded Tailwind classes and patterns
 * that were identified in the latest audit. Follows the "Flexy" principle:
 * eliminate hardcoded values and make modular systems.
 *
 * Usage:
 * ```typescript
 * import { REMAINING_PATTERNS } from '@/lib/config/remaining-hardcoded-patterns';
 *
 * // Instead of hardcoded className:
 * <tbody className="bg-white divide-y divide-gray-200">
 *
 * // Use modular config:
 * <tbody className={REMAINING_PATTERNS.TABLE_BODY}>
 * ```
 */

/**
 * Table body styles
 * Used in: Dashboard page table body
 */
export const TABLE_BODY = 'bg-white divide-y divide-gray-200';

/**
 * Table row selected ring styles
 * Used in: Dashboard page selected row
 */
export const TABLE_ROW_SELECTED_RING = 'ring-2 ring-primary-400 ring-inset';

/**
 * Copy button hover opacity styles
 * Used in: Dashboard, BlueprintDisplay, TaskItem
 */
export const COPY_BUTTON_HOVER_OPACITY =
  'opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus:opacity-100 transition-opacity';

/**
 * Loading spinner small size
 * Used in: Dashboard, Button, TaskItem
 */
export const SPINNER_SMALL = 'animate-spin h-3 w-3';

/**
 * Disabled state opacity classes
 * Used in: Button, TaskItem, LoadingSpinner
 */
export const DISABLED_OPACITY = {
  /** opacity-25 - for disabled icons */
  LIGHT: 'opacity-25',
  /** opacity-75 - for disabled content */
  MEDIUM: 'opacity-75',
} as const;

/**
 * Loading spinner ripple border
 * Used in: LoadingSpinner
 */
export const SPINNER_BORDER_RING =
  'absolute rounded-full border border-primary-200/60';

/**
 * Loading spinner SVG container
 * Used in: LoadingSpinner
 */
export const SPINNER_SVG_CONTAINER = 'relative z-10 rounded-full';

/**
 * Loading spinner circle opacity
 * Used in: LoadingSpinner
 */
export const SPINNER_CIRCLE_OPACITY = 'opacity-30';

/**
 * Loading spinner path opacity for reduced motion
 * Used in: LoadingSpinner
 */
export const SPINNER_PATH_REDUCED_MOTION = 'opacity-100';

/**
 * Loading spinner path opacity for normal motion
 * Used in: LoadingSpinner
 */
export const SPINNER_PATH_NORMAL_MOTION = 'opacity-75';

/**
 * Layout main content styles
 * Used in: Layout.tsx
 */
export const MAIN_CONTENT = 'min-h-screen flex flex-col';

/**
 * Layout header styles
 * Used in: Layout.tsx
 */
export const HEADER = 'flex justify-between items-center h-16';

/**
 * Layout skip link target
 * Used in: Layout.tsx
 */
export const SKIP_LINK_TARGET = 'flex-1 focus:outline-none';

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
 * Skeleton loading placeholder sizes
 * Used in: HomePageClient
 */
export const HOMEPAGE_SKELETON_SIZES = {
  /** h-10 w-24 - ShareButton placeholder */
  SHARE_BUTTON: 'h-10 w-24',
  /** h-8 w-20 - CopyButton placeholder */
  COPY_BUTTON: 'h-8 w-20',
  /** h-32 w-full - IdeaInput text skeleton */
  IDEA_INPUT_TEXT: 'h-32 w-full',
  /** h-10 w-32 - IdeaInput button skeleton */
  IDEA_INPUT_BUTTON: 'h-10 w-32',
  /** w-16 h-16 - FeatureGrid circle skeleton */
  FEATURE_CIRCLE: 'w-16 h-16',
  /** h-6 - FeatureGrid title skeleton */
  FEATURE_TITLE: 'h-6',
  /** h-4 - FeatureGrid description skeleton */
  FEATURE_DESC: 'h-4',
  /** h-10 - WhyChoose title skeleton */
  WHY_CHOOSE_TITLE: 'h-10',
  /** w-6 h-6 - WhyChoose icon skeleton */
  WHY_CHOOSE_ICON: 'w-6 h-6',
  /** h-5 - WhyChoose item title skeleton */
  WHY_CHOOSE_ITEM_TITLE: 'h-5',
} as const;

/**
 * Skeleton container layout
 * Used in: HomePageClient
 */
export const SKELETON_LAYOUT = {
  /** flex-1 - flex grow */
  FLEX_GROW: 'flex-1',
  /** flex-1 min-w-0 - flex grow with min-width 0 */
  FLEX_GROW_MIN: 'flex-1 min-w-0',
} as const;

/**
 * Auth callback animation styles
 * Used in: Auth callback page
 */
export const AUTH_CALLBACK_ANIMATION =
  'absolute inset-0 rounded-full border-2 border-primary-200 animate-ping opacity-20';

/**
 * Auth callback content width
 * Used in: Auth callback page
 */
export const AUTH_CALLBACK_WIDTH = 'inline-block w-8 text-left';

/**
 * Clarify page layout
 * Used in: Clarify page
 */
export const CLARIFY_LAYOUT = {
  /** text-center - centered text */
  TEXT_CENTER: 'text-center',
  /** flex flex-col sm:flex-row - responsive flex layout */
  RESPONSIVE_FLEX:
    'flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-4',
  /** flex flex-col sm:flex-row items-start sm:items-center gap-3 - responsive flex without margin */
  RESPONSIVE_FLEX_NO_MT:
    'flex flex-col sm:flex-row items-start sm:items-center gap-3',
} as const;

/**
 * Results page CTA styles
 * Used in: Results page
 */
export const RESULTS_CTA = {
  TEXT_LEFT: 'text-left',
} as const;

export const SELECT_ICON_POSITION =
  'absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none';

export const SWIPE_PROGRESS_BAR =
  'absolute left-0 top-0 bottom-0 w-1 bg-current opacity-50 rounded-l-lg';

export const HINT_OVERLAY = 'absolute top-4 right-16 animate-fade-in';

export const NOT_FOUND_404_CONTAINER = 'relative mb-6';

export const NOT_FOUND_BUTTON_INLINE =
  'inline-flex items-center justify-center gap-2';

export const NOT_FOUND_BUTTON_INLINE_FULL =
  'inline-flex items-center justify-center gap-2 w-full';

export const TASK_CARD_VERTICAL_MARGIN = 'mt-4 mb-4';

export const TASK_ACTION_GROUP = 'flex gap-2';

export const DASHBOARD_FILTER_BAR = 'mb-6 flex flex-wrap items-center gap-4';

export const DASHBOARD_EMPTY_STATE_CTA = 'flex flex-col items-center gap-3';

export const DASHBOARD_EMPTY_STATE_CTA_ROW = 'flex justify-center gap-3';

export const SIGNUP_TIP_ITEM = 'flex items-center gap-1';

export const ERROR_BOUNDARY_ACTION_GROUP = 'mt-4 flex gap-2';

export const HOMEPAGE_HERO_SECTION = 'text-center mb-12';

export const HOMEPAGE_HERO_ACTIONS = 'mt-6 flex justify-center gap-6';

export const KEYBOARD_HINT_INLINE =
  'hidden sm:inline-flex items-center gap-1.5';

export const NOT_FOUND_SHORTCUTS_SECTION =
  'mt-6 flex items-center justify-center gap-4 text-xs';

export const POPULAR_PAGES_SECTION = 'mt-8 pt-6 border-t';

export const POPULAR_PAGES_GRID = 'grid grid-cols-1 sm:grid-cols-3 gap-3';

export const POPULAR_PAGES_ITEM =
  'group flex items-center gap-3 p-3 rounded-lg border';

export const POPULAR_PAGES_ICON =
  'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center';

export const COPY_URL_HINT =
  'text-xs hidden sm:inline-flex items-center gap-1.5';

export const NOT_FOUND_COPY_SECTION =
  'mt-6 flex flex-col sm:flex-row items-center justify-center gap-3';

export const NOT_FOUND_ACTIONS =
  'flex flex-col sm:flex-row gap-3 justify-center';

/**
 * Progress bar fill colors based on completion percentage
 * Used in: DeliverableCard.tsx inlineProgressFillClasses
 */
export const PROGRESS_BAR_COLORS = {
  /** bg-green-500 - 100% complete */
  COMPLETE: 'bg-green-500',
  /** bg-blue-500 - 75-99% */
  HIGH: 'bg-blue-500',
  /** bg-blue-400 - 50-74% */
  MEDIUM: 'bg-blue-400',
  /** bg-blue-300 - 1-49% */
  LOW: 'bg-blue-300',
  /** bg-gray-300 - 0% (empty) */
  EMPTY: 'bg-gray-300',
} as const;

/**
 * Loading spinner elapsed time text style
 * Used in: LoadingSpinner.tsx elapsed time display
 */
export const LOADING_SPINNER_ELAPSED_TEXT = 'text-xs text-gray-400 font-mono';

/**
 * Password visible state background tint
 * Used in: InputWithValidation.tsx when password is toggled visible
 * Provides subtle amber feedback that password text is exposed
 */
export const PASSWORD_VISIBLE_TINT = 'bg-amber-50/50 border-amber-300/60';

/**
 * Valid checkmark icon color
 * Used in: InputWithValidation.tsx success checkmark SVG
 */
export const VALID_CHECKMARK_COLOR = 'text-green-800';

/**
 * Dashboard page specific patterns
 * Used in: Dashboard page
 */
export const DASHBOARD_SPECIFIC = {
  /** bg-white divide-y divide-gray-200 - table body */
  TABLE_BODY,
  /** ring-2 ring-primary-400 ring-inset - selected row ring */
  SELECTED_ROW_RING: TABLE_ROW_SELECTED_RING,
  /** opacity-0 group-hover:opacity-100 - copy button hover */
  COPY_BUTTON_HOVER: COPY_BUTTON_HOVER_OPACITY,
  /** animate-spin h-3 w-3 - loading spinner */
  LOADING_SPINNER: SPINNER_SMALL,
  /** opacity-25 - disabled state */
  DISABLED_LIGHT: DISABLED_OPACITY.LIGHT,
  /** opacity-75 - disabled state */
  DISABLED_MEDIUM: DISABLED_OPACITY.MEDIUM,
} as const;

/**
 * Combined patterns object for easy access
 * Used in: Components that need multiple patterns
 */
export const REMAINING_PATTERNS = {
  TABLE_BODY,
  TABLE_ROW_SELECTED_RING,
  COPY_BUTTON_HOVER_OPACITY,
  SPINNER_SMALL,
  DISABLED_OPACITY,
  SPINNER_BORDER_RING,
  SPINNER_SVG_CONTAINER,
  SPINNER_CIRCLE_OPACITY,
  SPINNER_PATH_REDUCED_MOTION,
  SPINNER_PATH_NORMAL_MOTION,
  MAIN_CONTENT,
  HEADER,
  SKIP_LINK_TARGET,
  FORM_TEXT_SIZES,
  FORM_WIDTH,
  FORM_CONTAINER,
  FORM_ITEM_LAYOUT,
  SKELETON_SIZES: HOMEPAGE_SKELETON_SIZES,
  SKELETON_LAYOUT,
  AUTH_CALLBACK_ANIMATION,
  AUTH_CALLBACK_WIDTH,
  CLARIFY_LAYOUT,
  RESULTS_CTA,
  PROGRESS_BAR_COLORS,
  LOADING_SPINNER_ELAPSED_TEXT,
  PASSWORD_VISIBLE_TINT,
  VALID_CHECKMARK_COLOR,
  DASHBOARD_SPECIFIC,
} as const;
