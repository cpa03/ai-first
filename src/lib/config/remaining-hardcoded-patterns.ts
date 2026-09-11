/**
 * Remaining Hardcoded Patterns Configuration
 *
 * This file re-exports all patterns from domain-specific modules for backward compatibility.
 * New code should import directly from the domain-specific modules:
 *
 * - table-patterns.ts: Table-related patterns
 * - form-patterns.ts: Form-related patterns
 * - layout-patterns.ts: Layout and positioning patterns
 * - component-patterns.ts: Component-specific patterns
 * - page-patterns.ts: Page-specific patterns
 *
 * Usage:
 * ```typescript
 * // New way (recommended):
 * import { TABLE_PATTERNS } from '@/lib/config/table-patterns';
 * import { FORM_PATTERNS } from '@/lib/config/form-patterns';
 * import { LAYOUT_PATTERNS } from '@/lib/config/layout-patterns';
 * import { COMPONENT_PATTERNS } from '@/lib/config/component-patterns';
 * import { PAGE_PATTERNS } from '@/lib/config/page-patterns';
 *
 * // Legacy way (backward compatible):
 * import { REMAINING_PATTERNS } from '@/lib/config/remaining-hardcoded-patterns';
 * ```
 */

// Re-export from domain-specific modules for backward compatibility
export {
  TABLE_UI_PATTERNS,
  TABLE_BODY,
  TABLE_ROW_SELECTED_RING,
} from './table-patterns';

export {
  FORM_PATTERNS,
  FORM_TEXT_SIZES,
  FORM_WIDTH,
  FORM_CONTAINER,
  FORM_ITEM_LAYOUT,
  PEER_SR_ONLY,
} from './form-patterns';

export {
  LAYOUT_PATTERNS,
  MAIN_CONTENT,
  HEADER,
  SKIP_LINK_TARGET,
  RESPONSIVE_WIDTH,
  RESPONSIVE_WIDTH_WITH_MARGIN,
  ABSOLUTE_CENTER_OVERLAY,
  ABSOLUTE_CENTER_FLEX_COL,
  RESPONSIVE_FLEX_BETWEEN_GAP,
  FLEX_SPACE_X,
  FLEX_1,
  FLEX_ITEMS_CENTER,
  TEXT_LEFT,
  FONT_MEDIUM,
  INLINE_FLEX_ITEMS_CENTER,
  CENTER_INLINE_FLEX,
  FLEX_CENTER,
  RELATIVE,
  RELATIVE_GROUP,
  HIDDEN_SM,
  POINTER_EVENTS_NONE,
  MX_SMALL,
  MARGIN_TOP_4,
  MARGIN_BOTTOM_4,
  JUSTIFY_CENTER,
  GRID_COL_SPAN,
  SKIP_LINK,
  INLINE_FLEX_RELATIVE,
  COMMON_FLEX_BETWEEN_RESPONSIVE,
  COMMON_INLINE_FLEX_GAP,
  COMMON_INLINE_FLEX_GAP_SM,
} from './layout-patterns';

export {
  COMPONENT_PATTERNS,
  COPY_BUTTON_HOVER_OPACITY,
  SPINNER_SMALL,
  DISABLED_OPACITY,
  SPINNER_BORDER_RING,
  SPINNER_SVG_CONTAINER,
  SPINNER_CIRCLE_OPACITY,
  SPINNER_PATH_REDUCED_MOTION,
  SPINNER_PATH_NORMAL_MOTION,
  LOADING_SPINNER_ELAPSED_TEXT,
  PASSWORD_VISIBLE_TINT,
  VALID_CHECKMARK_COLOR,
  PROGRESS_BAR_COLORS,
  TABULAR_NUMS_MEDIUM,
  SKELETON_FULL_THIRD,
} from './component-patterns';

export {
  PAGE_PATTERNS,
  HOMEPAGE_SKELETON_SIZES,
  SKELETON_LAYOUT,
  AUTH_CALLBACK_ANIMATION,
  AUTH_CALLBACK_WIDTH,
  CLARIFY_LAYOUT,
  RESULTS_CTA,
  SELECT_ICON_POSITION,
  SWIPE_PROGRESS_BAR,
  HINT_OVERLAY,
  NOT_FOUND_PATTERNS,
  TASK_PATTERNS,
  DASHBOARD_PATTERNS,
  SIGNUP_PATTERNS,
  ERROR_BOUNDARY_PATTERNS,
  HOMEPAGE_PATTERNS,
  KEYBOARD_HINT_PATTERNS,
  RESULTS_PATTERNS,
  CLARIFY_PATTERNS,
} from './page-patterns';

// Individual exports for backward compatibility
export const HOMEPAGE_HERO_SECTION = 'text-center mb-12';
export const HOMEPAGE_HERO_ACTIONS = 'mt-6 flex justify-center gap-6';
export const CLARIFY_PARAGRAPH_MARGIN = 'mb-4';
export const CLARIFY_EMPTY_STATE = 'py-12';
export const DASHBOARD_FILTER_BAR = 'mb-6 flex flex-wrap items-center gap-4';
export const DASHBOARD_EMPTY_STATE_CTA = 'flex flex-col items-center gap-3';
export const DASHBOARD_EMPTY_STATE_CTA_ROW = 'flex justify-center gap-3';
export const DASHBOARD_PAGINATION_CONTAINER =
  'flex items-center justify-center gap-2 sm:gap-4 mb-8';
export const DASHBOARD_FILTER_CLEAR_CONTAINER = 'flex items-center gap-2';
export const DASHBOARD_FILTER_BADGE_POSITION =
  'absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none';
export const DASHBOARD_FILTER_BADGE_ACTIVE = 'bg-primary-600 text-white';
export const DASHBOARD_FILTER_BADGE_INACTIVE =
  'bg-primary-100 text-primary-700';
export const SR_ONLY = 'sr-only';
export const NOT_FOUND_404_CONTAINER = 'relative mb-6';
export const NOT_FOUND_BUTTON_INLINE =
  'inline-flex items-center justify-center gap-2';
export const NOT_FOUND_BUTTON_INLINE_FULL =
  'inline-flex items-center justify-center gap-2 w-full';
export const NOT_FOUND_SHORTCUTS_SECTION =
  'mt-6 flex items-center justify-center gap-4 text-xs';
export const KEYBOARD_HINT_INLINE =
  'hidden sm:inline-flex items-center gap-1.5';
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
export const RESULTS_SUCCESS_CONTAINER = 'mt-6 relative';
export const RESULTS_SHARE_BUTTON_CONTAINER = 'mt-3 block';
export const SIGNUP_TIP_ITEM = 'flex items-center gap-1';
export const ERROR_BOUNDARY_ACTION_GROUP = 'mt-4 flex gap-2';
export const TASK_CARD_VERTICAL_MARGIN = 'mt-4 mb-4';
export const TASK_ACTION_GROUP = 'flex gap-2';
export const DASHBOARD_SPECIFIC = {
  TABLE_BODY: 'bg-white divide-y divide-gray-200',
  SELECTED_ROW_RING: 'ring-2 ring-primary-400 ring-inset',
  COPY_BUTTON_HOVER:
    'opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus:opacity-100 transition-opacity',
  LOADING_SPINNER: 'animate-spin h-3 w-3',
  DISABLED_LIGHT: 'opacity-25',
  DISABLED_MEDIUM: 'opacity-75',
  FILTER_BADGE_POSITION:
    'absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none',
  FILTER_BADGE_ACTIVE: 'bg-primary-600 text-white',
  FILTER_BADGE_INACTIVE: 'bg-primary-100 text-primary-700',
  FILTER_CLEAR_CONTAINER: 'flex items-center gap-2',
  RESTART_TOUR_MARGIN: 'ml-2',
  SECTION_BOTTOM_MARGIN: 'mb-8',
  ALERT_BUTTON_MARGIN: 'mt-4',
  PAGINATION_CONTAINER: 'flex items-center justify-center gap-2 sm:gap-4 mb-8',
} as const;

/**
 * Combined patterns object for easy access (backward compatible)
 * Used in: Components that need multiple patterns
 */
export const REMAINING_PATTERNS = {
  // Table patterns
  TABLE_BODY: 'bg-white divide-y divide-gray-200',
  TABLE_ROW_SELECTED_RING: 'ring-2 ring-primary-400 ring-inset',

  // Component patterns
  COPY_BUTTON_HOVER_OPACITY:
    'opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus:opacity-100 transition-opacity',
  SPINNER_SMALL: 'animate-spin h-3 w-3',
  DISABLED_OPACITY: {
    LIGHT: 'opacity-25',
    MEDIUM: 'opacity-75',
  } as const,
  SPINNER_BORDER_RING: 'absolute rounded-full border border-primary-200/60',
  SPINNER_SVG_CONTAINER: 'relative z-10 rounded-full',
  SPINNER_CIRCLE_OPACITY: 'opacity-30',
  SPINNER_PATH_REDUCED_MOTION: 'opacity-100',
  SPINNER_PATH_NORMAL_MOTION: 'opacity-75',

  // Layout patterns
  MAIN_CONTENT: 'min-h-screen flex flex-col',
  HEADER: 'flex justify-between items-center h-16',
  SKIP_LINK_TARGET: 'flex-1 focus:outline-none',

  // Form patterns
  FORM_TEXT_SIZES: {
    SM: 'text-sm',
    XS: 'text-xs',
  } as const,
  FORM_WIDTH: {
    FULL: 'w-full',
    RESPONSIVE: 'w-full sm:w-auto',
  } as const,
  FORM_CONTAINER: 'relative flex justify-center text-sm',
  FORM_ITEM_LAYOUT: 'flex items-center gap-1',

  // Skeleton patterns
  SKELETON_SIZES: {
    SHARE_BUTTON: 'h-10 w-24',
    COPY_BUTTON: 'h-8 w-20',
    IDEA_INPUT_TEXT: 'h-32 w-full',
    IDEA_INPUT_BUTTON: 'h-10 w-32',
    FEATURE_CIRCLE: 'w-16 h-16',
    FEATURE_TITLE: 'h-6',
    FEATURE_DESC: 'h-4',
    WHY_CHOOSE_TITLE: 'h-10',
    WHY_CHOOSE_ICON: 'w-6 h-6',
    WHY_CHOOSE_ITEM_TITLE: 'h-5',
  } as const,
  SKELETON_LAYOUT: {
    FLEX_GROW: 'flex-1',
    FLEX_GROW_MIN: 'flex-1 min-w-0',
  } as const,

  // Auth patterns
  AUTH_CALLBACK_ANIMATION:
    'absolute inset-0 rounded-full border-2 border-primary-200 animate-ping opacity-20',
  AUTH_CALLBACK_WIDTH: 'inline-block w-8 text-left',

  // Page layouts
  CLARIFY_LAYOUT: {
    TEXT_CENTER: 'text-center',
    RESPONSIVE_FLEX:
      'flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-4',
    RESPONSIVE_FLEX_NO_MT:
      'flex flex-col sm:flex-row items-start sm:items-center gap-3',
  } as const,
  RESULTS_CTA: {
    TEXT_LEFT: 'text-left',
  } as const,

  // Component patterns
  PROGRESS_BAR_COLORS: {
    COMPLETE: 'bg-green-500',
    HIGH: 'bg-blue-500',
    MEDIUM: 'bg-blue-400',
    LOW: 'bg-blue-300',
    EMPTY: 'bg-gray-300',
  } as const,
  LOADING_SPINNER_ELAPSED_TEXT: 'text-xs text-gray-400 font-mono',
  PASSWORD_VISIBLE_TINT: 'bg-amber-50/50 border-amber-300/60',
  VALID_CHECKMARK_COLOR: 'text-green-800',

  // Dashboard patterns
  DASHBOARD_SPECIFIC: {
    TABLE_BODY: 'bg-white divide-y divide-gray-200',
    SELECTED_ROW_RING: 'ring-2 ring-primary-400 ring-inset',
    COPY_BUTTON_HOVER:
      'opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus:opacity-100 transition-opacity',
    LOADING_SPINNER: 'animate-spin h-3 w-3',
    DISABLED_LIGHT: 'opacity-25',
    DISABLED_MEDIUM: 'opacity-75',
    FILTER_BADGE_POSITION:
      'absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none',
    FILTER_BADGE_ACTIVE: 'bg-primary-600 text-white',
    FILTER_BADGE_INACTIVE: 'bg-primary-100 text-primary-700',
    FILTER_CLEAR_CONTAINER: 'flex items-center gap-2',
    RESTART_TOUR_MARGIN: 'ml-2',
    SECTION_BOTTOM_MARGIN: 'mb-8',
    ALERT_BUTTON_MARGIN: 'mt-4',
    PAGINATION_CONTAINER:
      'flex items-center justify-center gap-2 sm:gap-4 mb-8',
  } as const,
  DASHBOARD_PAGINATION_CONTAINER:
    'flex items-center justify-center gap-2 sm:gap-4 mb-8',
  DASHBOARD_FILTER_CLEAR_CONTAINER: 'flex items-center gap-2',
  DASHBOARD_FILTER_BADGE_POSITION:
    'absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none',
  DASHBOARD_FILTER_BADGE_ACTIVE: 'bg-primary-600 text-white',
  DASHBOARD_FILTER_BADGE_INACTIVE: 'bg-primary-100 text-primary-700',

  // Results patterns
  RESULTS_SUCCESS_CONTAINER: 'mt-6 relative',
  RESULTS_SHARE_BUTTON_CONTAINER: 'mt-3 block',

  // Clarify patterns
  CLARIFY_PARAGRAPH_MARGIN: 'mb-4',
  CLARIFY_EMPTY_STATE: 'py-12',

  // Common patterns
  COMMON_FLEX_BETWEEN_RESPONSIVE:
    'flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4',
  COMMON_INLINE_FLEX_GAP: 'flex items-center gap-2',
  COMMON_INLINE_FLEX_GAP_SM: 'flex items-center gap-1.5',

  // Layout patterns
  INLINE_FLEX_RELATIVE: 'relative inline-flex',
  RESPONSIVE_WIDTH: 'w-full sm:w-auto',
  RESPONSIVE_WIDTH_WITH_MARGIN: 'w-full sm:w-auto ml-0 sm:ml-2',
  ABSOLUTE_CENTER_OVERLAY: 'absolute inset-0 flex items-center justify-center',
  ABSOLUTE_CENTER_FLEX_COL:
    'absolute inset-0 flex flex-col items-center justify-center',
  RESPONSIVE_FLEX_BETWEEN_GAP:
    'flex flex-col sm:flex-row sm:items-center justify-between gap-3',
  FLEX_SPACE_X: 'flex space-x-2 sm:space-x-4',
  TABULAR_NUMS_MEDIUM: 'tabular-nums font-medium',
  SKELETON_FULL_THIRD: 'h-full w-1/3',
  FLEX_1: 'flex-1',
  FLEX_ITEMS_CENTER: 'flex items-center',
  TEXT_LEFT: 'text-left',
  FONT_MEDIUM: 'font-medium',
  INLINE_FLEX_ITEMS_CENTER: 'inline-flex items-center',
  CENTER_INLINE_FLEX: 'relative inline-flex items-center justify-center',
  FLEX_CENTER: 'flex justify-center items-center',
  SR_ONLY: 'sr-only',
  RELATIVE: 'relative',
  RELATIVE_GROUP: 'relative group',
  HIDDEN_SM: 'sm:hidden',
  POINTER_EVENTS_NONE: 'pointer-events-none',
  MX_SMALL: 'mx-1.5',
  MARGIN_TOP_4: 'mt-4',
  MARGIN_BOTTOM_4: 'mb-4',
  JUSTIFY_CENTER: 'justify-center',
  GRID_COL_SPAN: 'col-span-2 md:col-span-1',
  SKIP_LINK: 'skip-link',
  PEER_SR_ONLY: 'peer sr-only',
} as const;
