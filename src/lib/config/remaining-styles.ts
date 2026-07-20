/**
 * Remaining Hardcoded Styles Configuration
 * Centralizes remaining hardcoded Tailwind classes that were not covered in theme.ts
 * Follows the "Flexy" principle: eliminate hardcoded values and make modular systems
 */

/**
 * Gray color classes for text, backgrounds, and borders
 * Replaces hardcoded gray-* classes throughout components
 */
export const GRAY_CLASSES = {
  // Text colors
  TEXT_300: 'text-gray-300',
  TEXT_400: 'text-gray-400',
  TEXT_500: 'text-gray-500',
  TEXT_600: 'text-gray-600',
  TEXT_700: 'text-gray-700',
  TEXT_800: 'text-gray-800',
  TEXT_900: 'text-gray-900',

  // Hover text colors
  HOVER_TEXT_600: 'hover:text-gray-600',
  HOVER_TEXT_700: 'hover:text-gray-700',
  HOVER_TEXT_800: 'hover:text-gray-800',
  HOVER_TEXT_900: 'hover:text-gray-900',

  // Background colors
  BG_50: 'bg-gray-50',
  BG_100: 'bg-gray-100',
  BG_200: 'bg-gray-200',
  BG_800: 'bg-gray-800',
  BG_900: 'bg-gray-900',

  // Hover background colors
  HOVER_BG_50: 'hover:bg-gray-50',
  HOVER_BG_100: 'hover:bg-gray-100',

  // Border colors
  BORDER_200: 'border-gray-200',
  BORDER_300: 'border-gray-300',
  BORDER_400: 'border-gray-400',
} as const;

/**
 * Combined gray text classes for common patterns
 */
export const GRAY_TEXT_COMBOS = {
  // Common text + hover patterns
  MUTED_HOVER: `${GRAY_CLASSES.TEXT_600} ${GRAY_CLASSES.HOVER_TEXT_800}`,
  BODY_HOVER: `${GRAY_CLASSES.TEXT_700} ${GRAY_CLASSES.HOVER_TEXT_900}`,
  SUBTLE: `${GRAY_CLASSES.TEXT_500} ${GRAY_CLASSES.HOVER_TEXT_700} ${GRAY_CLASSES.HOVER_BG_100}`,
  INPUT: `${GRAY_CLASSES.TEXT_600} ${GRAY_CLASSES.HOVER_TEXT_800} ${GRAY_CLASSES.HOVER_BG_50}`,
} as const;

/**
 * Gray background + border combinations
 */
export const GRAY_BG_COMBOS = {
  INPUT_FIELD: `${GRAY_CLASSES.BG_200} ${GRAY_CLASSES.BORDER_200}`,
  CARD: `${GRAY_CLASSES.BG_50} ${GRAY_CLASSES.BORDER_200}`,
  BADGE: `${GRAY_CLASSES.BG_100} ${GRAY_CLASSES.BORDER_200}`,
  SKELETON: `${GRAY_CLASSES.BG_200} ${GRAY_CLASSES.BORDER_200}`,
} as const;

/**
 * Focus ring patterns used across components
 */
export const FOCUS_RING_PATTERNS = {
  DEFAULT:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
  SMALL:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1',
  INPUT:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
} as const;

/**
 * Button hover patterns
 */
export const BUTTON_HOVER_PATTERNS = {
  GHOST: `${GRAY_CLASSES.TEXT_600} ${GRAY_CLASSES.HOVER_TEXT_800} ${GRAY_CLASSES.HOVER_BG_100}`,
  SECONDARY: `${GRAY_CLASSES.TEXT_700} ${GRAY_CLASSES.HOVER_TEXT_900} ${GRAY_CLASSES.HOVER_BG_50}`,
  LINK: `${GRAY_CLASSES.TEXT_600} ${GRAY_CLASSES.HOVER_TEXT_800} ${GRAY_CLASSES.HOVER_BG_100}`,
} as const;

/**
 * Common element patterns
 */
export const ELEMENT_PATTERNS = {
  // Keyboard shortcut badge
  KBD: `px-1.5 py-0.5 text-xs font-mono ${GRAY_CLASSES.TEXT_600} bg-white border ${GRAY_CLASSES.BORDER_200} rounded shadow-sm`,

  // Status badge
  STATUS_BADGE: `px-1.5 py-0.5 font-mono text-xs font-medium ${GRAY_CLASSES.TEXT_500} ${GRAY_CLASSES.BG_100} border ${GRAY_CLASSES.BORDER_200} rounded`,

  // Divider
  DIVIDER: `${GRAY_CLASSES.TEXT_300} mx-0.5`,

  // Loading indicator
  LOADING: `${GRAY_CLASSES.TEXT_400}`,
} as const;

/**
 * White background patterns
 */
export const WHITE_BG_PATTERNS = {
  DEFAULT: 'bg-white',
  TRANSPARENT: 'bg-white/90',
  WITH_BORDER: `bg-white border ${GRAY_CLASSES.BORDER_200}`,
  HOVER: `bg-white ${GRAY_CLASSES.HOVER_BG_50} ${GRAY_CLASSES.HOVER_TEXT_900} ${GRAY_CLASSES.BORDER_300} shadow-sm`,
} as const;

/**
 * Layout patterns
 */
export const LAYOUT_PATTERNS = {
  // Error page background
  ERROR_PAGE: `min-h-screen ${GRAY_CLASSES.BG_50} flex items-center justify-center p-4`,

  // Content container
  CONTENT_CONTAINER: 'flex items-center justify-center gap-2 sm:gap-4 text-xs',

  // Footer section
  FOOTER: `mt-4 flex items-center justify-center gap-2 sm:gap-4 text-xs ${GRAY_CLASSES.TEXT_400} animate-fade-in`,
} as const;

/**
 * Animation patterns
 */
export const ANIMATION_PATTERNS = {
  FADE_IN: 'animate-fade-in',
  BREATHE: 'animate-breathe',
  SLIDE_UP: 'slide-up',
  DISCOVER_PULSE: 'animate-discover-pulse',
} as const;

/**
 * Transition patterns
 */
export const TRANSITION_PATTERNS = {
  COLORS: 'transition-colors',
  ALL: 'transition-all duration-200',
  SLOW: 'transition-all duration-300',
  FAST: 'transition-all duration-150',
} as const;

/**
 * Typography patterns
 */
export const TYPOGRAPHY_PATTERNS = {
  // Font weights
  MEDIUM: 'font-medium',
  SEMIBOLD: 'font-semibold',
  BOLD: 'font-bold',
  MONO: 'font-mono',

  // Text sizes
  XS: 'text-xs',
  SM: 'text-sm',
  BASE: 'text-base',
  LG: 'text-lg',
  XL: 'text-xl',
  XL2: 'text-2xl',

  // Responsive text
  RESPONSIVE_SM_BASE: 'text-sm sm:text-base',
  RESPONSIVE_XL_2XL: 'text-xl sm:text-2xl',
} as const;

/**
 * Spacing patterns
 */
export const SPACING_PATTERNS = {
  // Padding
  P1: 'p-1',
  P2: 'p-2',
  P3: 'p-3',
  P4: 'p-4',
  PX3: 'px-3',
  PX4: 'px-4',
  PY3: 'py-3',
  PY4: 'py-4',

  // Margins
  MT2: 'mt-2',
  MT4: 'mt-4',
  MR4: 'mr-4',
  MB1: 'mb-1',
  MB4: 'mb-4',
  ML4: 'ml-4',

  // Gaps
  GAP1: 'gap-1',
  GAP2: 'gap-2',
  GAP3: 'gap-3',
  GAP4: 'gap-4',
} as const;

/**
 * Border patterns
 */
export const BORDER_PATTERNS = {
  // Border widths
  B2: 'border-b-2',
  BORDER_L: 'border-l',

  // Border styles
  TRANSPARENT: 'border-transparent',
  SOLID: 'border-solid',

  // Common combinations
  BOTTOM_PRIMARY: `border-b-2 border-primary-600`,
  BOTTOM_TRANSPARENT: `border-b-2 border-transparent`,
} as const;

/**
 * Shadow patterns
 */
export const SHADOW_PATTERNS = {
  SM: 'shadow-sm',
  MD: 'shadow-md',
  LG: 'shadow-lg',
  XL: 'shadow-xl',
} as const;

/**
 * Rounded patterns
 */
export const ROUNDED_PATTERNS = {
  SM: 'rounded-sm',
  MD: 'rounded-md',
  LG: 'rounded-lg',
  XL: 'rounded-xl',
  FULL: 'rounded-full',
  T_MD: 'rounded-t-md',
} as const;

/**
 * Position patterns
 */
export const POSITION_PATTERNS = {
  ABSOLUTE: 'absolute',
  RELATIVE: 'relative',
  FIXED: 'fixed',
  STICKY: 'sticky',
} as const;

/**
 * Flex patterns
 */
export const FLEX_PATTERNS = {
  ROW: 'flex flex-row',
  COL: 'flex flex-col',
  CENTER: 'flex items-center justify-center',
  BETWEEN: 'flex items-center justify-between',
  WRAP: 'flex flex-wrap',
} as const;

/**
 * Grid patterns
 */
export const GRID_PATTERNS = {
  COL_2: 'grid grid-cols-2',
  COL_3: 'grid grid-cols-3',
  COL_4: 'grid grid-cols-4',
} as const;

/**
 * Common component patterns
 */
export const COMPONENT_PATTERNS = {
  // Card pattern
  CARD: `${WHITE_BG_PATTERNS.DEFAULT} ${ROUNDED_PATTERNS.LG} ${SHADOW_PATTERNS.LG}`,

  // Button pattern
  BUTTON: `${FOCUS_RING_PATTERNS.DEFAULT} ${TRANSITION_PATTERNS.COLORS}`,

  // Input pattern
  INPUT: `${WHITE_BG_PATTERNS.DEFAULT} ${BORDER_PATTERNS.SOLID} ${ROUNDED_PATTERNS.MD} ${SHADOW_PATTERNS.SM}`,

  // Badge pattern
  BADGE: `${GRAY_CLASSES.BG_100} ${GRAY_CLASSES.TEXT_600} ${ROUNDED_PATTERNS.MD}`,

  // Link pattern
  LINK: `${GRAY_CLASSES.TEXT_600} ${GRAY_CLASSES.HOVER_TEXT_800} ${TRANSITION_PATTERNS.COLORS}`,
} as const;

/**
 * Dashboard-specific patterns
 * Eliminates hardcoded Tailwind classes in dashboard page
 */
export const DASHBOARD_PATTERNS = {
  STEP_ICON:
    'w-14 h-14 flex items-center justify-center rounded-2xl transition-transform duration-200 hover:scale-110',
  STEP_ICON_SIZE: 'w-7 h-7',
  STEP_LABEL: 'text-xs font-medium text-gray-700',

  ARROW_CONTAINER: 'flex items-center',
  ARROW_LINE: 'w-8 sm:w-12 h-px',
  ARROW_ICON: 'w-4 h-4 -ml-1',

  FILTER_BADGE:
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',

  ACTION_LINK:
    'text-xs text-gray-500 hover:text-primary-600 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded',

  EMPTY_STATE_ICON:
    'inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full',
  EMPTY_STATE_ICON_INNER: 'w-10 h-10',

  SECTION_HEADING: 'text-xl font-semibold text-gray-900 mb-2',
  SECTION_SUBHEADING: 'text-gray-600 mb-6',
  PAGE_HEADING: 'text-3xl font-bold text-gray-900',
  PAGE_SUBHEADING: 'text-gray-600 mt-1',

  KEYBOARD_HINTS_BAR:
    'mt-4 flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg animate-fade-in',
  KEYBOARD_HINTS_GROUP: 'flex items-center gap-4 text-xs text-gray-500',
  KEYBOARD_HINT_ITEM:
    'hidden sm:inline-flex items-center gap-1.5 hover:text-gray-700 transition-colors duration-200',
  KEYBOARD_HINT_LABEL: 'text-gray-400',

  VIEW_SHORTCUTS_BTN:
    'text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 transition-colors duration-200',

  DELETE_CONFIRM_LABEL: 'block text-sm font-medium text-gray-700 mb-1.5',
  DELETE_CONFIRM_HINT: 'mt-1.5 text-xs text-gray-500',

  SELECT_OPTION_ACTIVE: 'bg-primary-50 font-medium',

  FILTER_CLEAR_GROUP:
    'flex items-center gap-2 transition-all duration-200 ease-out',

  TOOLTIP_LINK: 'cursor-help border-b border-dotted border-gray-400',

  STATUS_BADGE_ACTIVE:
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 ring-1 ring-primary-200',
} as const;

/**
 * Export all patterns for easy access
 */
export const REMAINING_STYLES = {
  GRAY_CLASSES,
  GRAY_TEXT_COMBOS,
  GRAY_BG_COMBOS,
  FOCUS_RING_PATTERNS,
  BUTTON_HOVER_PATTERNS,
  ELEMENT_PATTERNS,
  WHITE_BG_PATTERNS,
  LAYOUT_PATTERNS,
  ANIMATION_PATTERNS,
  TRANSITION_PATTERNS,
  TYPOGRAPHY_PATTERNS,
  SPACING_PATTERNS,
  BORDER_PATTERNS,
  SHADOW_PATTERNS,
  ROUNDED_PATTERNS,
  POSITION_PATTERNS,
  FLEX_PATTERNS,
  GRID_PATTERNS,
  COMPONENT_PATTERNS,
} as const;
