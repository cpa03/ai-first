/**
 * Page Patterns Configuration
 *
 * Centralizes all page-specific Tailwind patterns used throughout the codebase.
 * Follows the "Flexy" principle: eliminate hardcoded values and make modular systems.
 *
 * Usage:
 * ```typescript
 * import { PAGE_PATTERNS } from '@/lib/config/page-patterns';
 *
 * // Instead of hardcoded className:
 * <div className="text-center mb-12">
 *
 * // Use modular config:
 * <div className={PAGE_PATTERNS.HOMEPAGE.HERO_SECTION}>
 * ```
 */

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

/**
 * Select icon position
 * Used in: InputWithValidation
 */
export const SELECT_ICON_POSITION =
  'absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none';

/**
 * Swipe progress bar
 * Used in: ToastContainer
 */
export const SWIPE_PROGRESS_BAR =
  'absolute left-0 top-0 bottom-0 w-1 bg-current opacity-50 rounded-l-lg';

/**
 * Hint overlay
 * Used in: MobileNav
 */
export const HINT_OVERLAY = 'absolute top-4 right-16 animate-fade-in';

/**
 * Not found page patterns
 * Used in: Not found page
 */
export const NOT_FOUND_PATTERNS = {
  /** Container for 404 content */
  CONTAINER: 'relative mb-6',
  /** Inline button styles */
  BUTTON_INLINE: 'inline-flex items-center justify-center gap-2',
  /** Full width inline button styles */
  BUTTON_INLINE_FULL: 'inline-flex items-center justify-center gap-2 w-full',
  /** Shortcuts section */
  SHORTCUTS_SECTION: 'mt-6 flex items-center justify-center gap-4 text-xs',
  /** Popular pages section */
  POPULAR_PAGES_SECTION: 'mt-8 pt-6 border-t',
  /** Popular pages grid */
  POPULAR_PAGES_GRID: 'grid grid-cols-1 sm:grid-cols-3 gap-3',
  /** Popular pages item */
  POPULAR_PAGES_ITEM: 'group flex items-center gap-3 p-3 rounded-lg border',
  /** Popular pages icon */
  POPULAR_PAGES_ICON:
    'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
  /** Copy URL hint */
  COPY_URL_HINT: 'text-xs hidden sm:inline-flex items-center gap-1.5',
  /** Copy section */
  COPY_SECTION:
    'mt-6 flex flex-col sm:flex-row items-center justify-center gap-3',
  /** Actions */
  ACTIONS: 'flex flex-col sm:flex-row gap-3 justify-center',
} as const;

/**
 * Task management patterns
 * Used in: TaskManagement components
 */
export const TASK_PATTERNS = {
  /** Task card vertical margin */
  CARD_VERTICAL_MARGIN: 'mt-4 mb-4',
  /** Task action group */
  ACTION_GROUP: 'flex gap-2',
} as const;

/**
 * Dashboard patterns
 * Used in: Dashboard page
 */
export const DASHBOARD_PATTERNS = {
  /** Filter bar */
  FILTER_BAR: 'mb-6 flex flex-wrap items-center gap-4',
  /** Empty state CTA */
  EMPTY_STATE_CTA: 'flex flex-col items-center gap-3',
  /** Empty state CTA row */
  EMPTY_STATE_CTA_ROW: 'flex justify-center gap-3',
  /** Pagination container */
  PAGINATION_CONTAINER: 'flex items-center justify-center gap-2 sm:gap-4 mb-8',
  /** Filter clear container */
  FILTER_CLEAR_CONTAINER: 'flex items-center gap-2',
  /** Filter badge position */
  FILTER_BADGE_POSITION:
    'absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none',
  /** Filter badge active */
  FILTER_BADGE_ACTIVE: 'bg-primary-600 text-white',
  /** Filter badge inactive */
  FILTER_BADGE_INACTIVE: 'bg-primary-100 text-primary-700',
} as const;

/**
 * Signup page patterns
 * Used in: Signup page
 */
export const SIGNUP_PATTERNS = {
  /** Signup tip item */
  TIP_ITEM: 'flex items-center gap-1',
} as const;

/**
 * Error boundary patterns
 * Used in: ErrorBoundary component
 */
export const ERROR_BOUNDARY_PATTERNS = {
  /** Action group */
  ACTION_GROUP: 'mt-4 flex gap-2',
} as const;

/**
 * Homepage patterns
 * Used in: HomePageClient
 */
export const HOMEPAGE_PATTERNS = {
  /** Hero section */
  HERO_SECTION: 'text-center mb-12',
  /** Hero actions */
  HERO_ACTIONS: 'mt-6 flex justify-center gap-6',
} as const;

/**
 * Keyboard hint patterns
 * Used in: KeyboardShortcutsHelp
 */
export const KEYBOARD_HINT_PATTERNS = {
  /** Inline hint */
  INLINE: 'hidden sm:inline-flex items-center gap-1.5',
} as const;

/**
 * Results page patterns
 * Used in: Results page
 */
export const RESULTS_PATTERNS = {
  /** Success container */
  SUCCESS_CONTAINER: 'mt-6 relative',
  /** Share button container */
  SHARE_BUTTON_CONTAINER: 'mt-3 block',
} as const;

/**
 * Clarify page patterns
 * Used in: Clarify page
 */
export const CLARIFY_PATTERNS = {
  /** Paragraph margin */
  PARAGRAPH_MARGIN: 'mb-4',
  /** Empty state */
  EMPTY_STATE: 'py-12',
} as const;

/**
 * Combined page patterns for easy access
 */
export const PAGE_PATTERNS = {
  /** Homepage patterns */
  HOMEPAGE: {
    SKELETON_SIZES: HOMEPAGE_SKELETON_SIZES,
    SKELETON_LAYOUT,
    HERO_SECTION: HOMEPAGE_PATTERNS.HERO_SECTION,
    HERO_ACTIONS: HOMEPAGE_PATTERNS.HERO_ACTIONS,
  },
  /** Auth callback patterns */
  AUTH_CALLBACK: {
    ANIMATION: AUTH_CALLBACK_ANIMATION,
    WIDTH: AUTH_CALLBACK_WIDTH,
  },
  /** Clarify page patterns */
  CLARIFY: {
    LAYOUT: CLARIFY_LAYOUT,
    PARAGRAPH_MARGIN: CLARIFY_PATTERNS.PARAGRAPH_MARGIN,
    EMPTY_STATE: CLARIFY_PATTERNS.EMPTY_STATE,
  },
  /** Results page patterns */
  RESULTS: {
    CTA: RESULTS_CTA,
    SUCCESS_CONTAINER: RESULTS_PATTERNS.SUCCESS_CONTAINER,
    SHARE_BUTTON_CONTAINER: RESULTS_PATTERNS.SHARE_BUTTON_CONTAINER,
  },
  /** Not found page patterns */
  NOT_FOUND: NOT_FOUND_PATTERNS,
  /** Task management patterns */
  TASK: TASK_PATTERNS,
  /** Dashboard patterns */
  DASHBOARD: DASHBOARD_PATTERNS,
  /** Signup page patterns */
  SIGNUP: SIGNUP_PATTERNS,
  /** Error boundary patterns */
  ERROR_BOUNDARY: ERROR_BOUNDARY_PATTERNS,
  /** Keyboard hint patterns */
  KEYBOARD_HINT: KEYBOARD_HINT_PATTERNS,
  /** Select icon position */
  SELECT_ICON_POSITION,
  /** Swipe progress bar */
  SWIPE_PROGRESS_BAR,
  /** Hint overlay */
  HINT_OVERLAY,
} as const;
