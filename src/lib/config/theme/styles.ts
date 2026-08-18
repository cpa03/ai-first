/**
 * Theme Styles Module
 * Centralizes all component style-related theme constants
 */

import { EnvLoader } from '../environment';
import { PROGRESS_PERCENTAGE } from '../modular-constants';
import { BORDER_COLORS, RING_COLORS } from './colors';
import { FOCUS_SHADOWS } from './shadows';

/**
 * Complete input styling configurations by state
 */
export const INPUT_STYLES = {
  BASE: [
    'w-full px-4 py-3 border rounded-md shadow-sm',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
    'transition-all duration-200',
    'hover:border-gray-400 hover:shadow-md',
  ].join(' '),
  NORMAL: [
    BORDER_COLORS.DEFAULT,
    RING_COLORS.PRIMARY,
    FOCUS_SHADOWS.PRIMARY,
  ].join(' '),
  ERROR: [
    BORDER_COLORS.ERROR,
    BORDER_COLORS.ERROR_FOCUS,
    RING_COLORS.ERROR,
    FOCUS_SHADOWS.ERROR,
  ].join(' '),
  SUCCESS: [
    BORDER_COLORS.SUCCESS,
    RING_COLORS.SUCCESS,
    FOCUS_SHADOWS.SUCCESS,
  ].join(' '),
  ICON_PADDING: {
    NONE: '',
    SINGLE: 'pr-10',
    DOUBLE: 'pr-20',
  },
} as const;

/**
 * Button Component Styles
 */
export const BUTTON_STYLES = {
  VARIANTS: {
    primary:
      'bg-primary-600 text-white hover:bg-primary-700 disabled:hover:bg-primary-600 btn-glow-hover shadow-md hover:shadow-lg active:shadow-sm disabled:hover:shadow-md disabled:active:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0 disabled:active:translate-y-0',
    secondary:
      'bg-gray-600 text-white hover:bg-gray-700 disabled:hover:bg-gray-600 shadow-md hover:shadow-lg active:shadow-sm disabled:hover:shadow-md disabled:active:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0 disabled:active:translate-y-0',
    outline:
      'border-2 border-gray-700 text-gray-700 hover:bg-gray-50 disabled:hover:bg-transparent shadow-sm hover:shadow-md active:shadow-sm disabled:hover:shadow-sm disabled:active:shadow-sm hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0 disabled:active:translate-y-0 hover:border-gray-900 disabled:hover:border-gray-700',
    ghost:
      'text-gray-700 hover:bg-gray-100 disabled:hover:bg-transparent hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0 disabled:active:translate-y-0',
    danger:
      'bg-red-600 text-white hover:bg-red-700 disabled:hover:bg-red-600 btn-glow-hover shadow-md hover:shadow-lg active:shadow-sm disabled:hover:shadow-md disabled:active:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0 disabled:active:translate-y-0',
  } as const,
  FOCUS_RINGS: {
    primary: 'focus-visible:ring-primary-500',
    secondary: 'focus-visible:ring-gray-500',
    outline: 'focus-visible:ring-gray-500',
    ghost: 'focus-visible:ring-gray-500',
    danger: 'focus-visible:ring-red-500',
  } as const,
  SIZES: {
    sm: `px-3 py-1.5 text-sm min-h-[${EnvLoader.number('UI_BUTTON_SM_HEIGHT', 36, 28, 48)}px]`,
    md: `px-4 py-2 text-base min-h-[${EnvLoader.number('UI_BUTTON_MD_HEIGHT', 44, 36, 56)}px]`,
    lg: `px-6 py-3 text-lg min-h-[${EnvLoader.number('UI_BUTTON_LG_HEIGHT', 48, 40, 64)}px]`,
  } as const,
  STATES: {
    disabled:
      'opacity-50 cursor-not-allowed hover:scale-100 active:scale-100 hover:translate-y-0 active:translate-y-0 motion-reduce:hover:scale-100 motion-reduce:active:scale-100 motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0 pointer-events-none shadow-none',
    enabled:
      'cursor-pointer hover:scale-[1.02] active:scale-[0.98] motion-reduce:hover:scale-100 motion-reduce:active:scale-100 motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0',
  } as const,
  BASE: 'rounded-md font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none touch-manipulation relative overflow-hidden animate-focus-ring',
} as const;

/**
 * Alert Component Styles
 */
export const ALERT_STYLES = {
  error: {
    container: 'bg-red-50 border-red-200',
    iconColor: 'text-red-600',
    titleColor: 'text-red-900',
    textColor: 'text-red-800',
    subtextColor: 'text-red-600',
    focusRing: 'focus-visible:ring-red-500',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200',
    iconColor: 'text-yellow-600',
    titleColor: 'text-yellow-900',
    textColor: 'text-yellow-800',
    subtextColor: 'text-yellow-600',
    focusRing: 'focus-visible:ring-yellow-500',
  },
  info: {
    container: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-900',
    textColor: 'text-blue-800',
    subtextColor: 'text-blue-600',
    focusRing: 'focus-visible:ring-blue-500',
  },
  success: {
    container: 'bg-green-50 border-green-200',
    iconColor: 'text-green-600',
    titleColor: 'text-green-900',
    textColor: 'text-green-800',
    subtextColor: 'text-green-600',
    focusRing: 'focus-visible:ring-green-500',
  },
} as const;

/** Base classes applied to all alerts */
export const ALERT_BASE_STYLES = {
  container: 'border rounded-lg p-4 flex items-start gap-3',
  transition:
    'transition-all duration-200 ease-out motion-reduce:transition-none',
  visible: 'opacity-100 scale-100 translate-y-0',
  exiting: 'opacity-0 scale-[0.98] translate-y-[-8px]',
  closeButton: `flex-shrink-0 ml-2 hover:opacity-75 focus:outline-none rounded-md p-1 min-h-[${EnvLoader.number('UI_ALERT_CLOSE_BUTTON_SIZE', 32, 24, 48)}px] min-w-[${EnvLoader.number('UI_ALERT_CLOSE_BUTTON_SIZE', 32, 24, 48)}px] transition-opacity`,
} as const;

/**
 * Deliverable Card Styles
 */
export const DELIVERABLE_STYLES = {
  COMPLETED: {
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  IN_PROGRESS: {
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  NOT_STARTED: {
    bgColor: 'bg-white',
    borderColor: 'border-gray-200',
  },
  getByProgress: (progress: number) => {
    if (progress === PROGRESS_PERCENTAGE.COMPLETE)
      return DELIVERABLE_STYLES.COMPLETED;
    if (progress > 0) return DELIVERABLE_STYLES.IN_PROGRESS;
    return DELIVERABLE_STYLES.NOT_STARTED;
  },
} as const;

/**
 * Table Component Patterns
 */
export const TABLE_PATTERNS = {
  container: 'w-full',
  header: {
    container: 'bg-gray-50',
    cell: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
  },
  row: {
    default: '',
    hover: 'hover:bg-gray-100',
    even: '',
    odd: '',
  },
  cell: {
    padding: 'px-6 py-4 whitespace-nowrap',
    text: 'text-sm text-gray-500',
    primary: 'text-sm font-medium text-gray-900',
  },
  actions: {
    container: 'px-6 py-4 whitespace-nowrap text-right text-sm font-medium',
    buttonGroup: 'flex justify-end gap-2',
    buttonBase: 'px-2 py-1 rounded transition-colors',
  },
  statusBadge: {
    base: 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
  },
} as const;

/**
 * Modal Component Patterns
 */
export const MODAL_PATTERNS = {
  overlay: 'fixed inset-0 bg-gray-900/50',
  container: 'fixed inset-0 z-50 flex items-center justify-center p-4',
  content: {
    container: 'bg-white rounded-lg shadow-lg p-8 max-w-md w-full',
    transition: 'transition-all duration-200',
  },
  header: {
    container: 'mb-6',
    title: 'text-lg font-semibold text-gray-900',
    description: 'text-gray-600 mb-6',
  },
  footer: {
    container: 'flex justify-end gap-3',
    button: 'px-4 py-2 rounded-md transition-colors',
    cancelButton: 'bg-gray-200 text-gray-600 hover:bg-gray-300',
    confirmButton: 'bg-red-600 text-white hover:bg-red-700',
  },
  closeButton: {
    iconSize: 'w-5 h-5',
    iconColor: 'text-red-600',
  },
  dangerIcon: {
    container:
      'w-10 h-10 rounded-full bg-red-100 flex items-center justify-center',
    icon: 'w-5 h-5 text-red-600',
  },
} as const;

/**
 * Spinner Component Patterns
 */
export const SPINNER_PATTERNS = {
  default: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
    },
    border: 'border-b-2',
    borderColor: 'border-indigo-600',
    borderColorAlt: 'border-transparent',
  },
  placeholder: {
    container: 'px-4 py-2 bg-gray-200 rounded-md text-gray-600',
  },
} as const;

/**
 * Card Component Patterns
 */
export const CARD_PATTERNS = {
  BASE: 'bg-white rounded-lg shadow-lg p-8',
  CENTERED: 'bg-white rounded-lg shadow-lg p-8 text-center',
  CENTERED_LARGE: 'bg-white rounded-lg shadow-lg p-12 text-center',
  OVERFLOW_HIDDEN: 'bg-white rounded-lg shadow-lg overflow-hidden',
  RESPONSIVE: 'bg-white rounded-lg shadow-lg p-6 sm:p-8',
  WITH_MARGIN: 'bg-white rounded-lg shadow-lg p-8 mt-8',
  ANIMATED: 'bg-white rounded-lg shadow-lg p-8 text-center fade-in',
  SKELETON: 'bg-white rounded-lg shadow-lg p-8 animate-pulse',
  COMPACT: 'bg-white rounded-lg shadow-lg p-6',
  CONTENT: 'bg-white border border-gray-200 rounded-md p-4 mb-4 space-y-2',
  FLAT: 'bg-white rounded-lg border border-gray-200 p-8',
} as const;

/**
 * Loading State Patterns
 */
export const LOADING_PATTERNS = {
  SIMPLE: 'bg-gray-100 p-4',
  ROUNDED: 'bg-gray-100 p-4 rounded',
  TEXT: 'text-center text-gray-600',
} as const;

/**
 * Skeleton Loading Patterns
 */
export const SKELETON_PATTERNS = {
  BASE_REDUCED_MOTION: 'bg-gray-200',
  BASE_ANIMATED:
    'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]',
  RECT: '',
  CIRCLE: 'rounded-full',
  TEXT: 'h-4 rounded',
} as const;

/**
 * Skeleton Size Patterns
 */
export const SKELETON_SIZE_PATTERNS = {
  TITLE: 'h-6 w-3/4',
  SUBTITLE: 'h-5 w-1/2',
  BODY_FULL: 'h-4 w-full',
  BODY_THREE_QUARTERS: 'h-4 w-3/4',
  BODY_FIVE_SIXTHS: 'h-4 w-5/6',
  BODY_TWO_THIRDS: 'h-4 w-2/3',
  BODY_HALF: 'h-4 w-1/2',
  INPUT_FULL: 'h-10 w-full',
  INPUT_SM: 'h-10 w-24',
  INPUT_MD: 'h-10 w-28',
  INPUT_LG: 'h-10 w-32',
  INPUT_XL: 'h-10 w-36',
  INPUT_XXL: 'h-10 w-40',
  BUTTON_SM: 'h-9 w-28',
  BUTTON_MD: 'h-9 w-32',
  HEADING_SM: 'h-6 sm:h-8 w-36 sm:w-48',
  SUBTITLE_SM: 'h-5 sm:h-6 w-3/4',
  CAPTION_SM: 'h-3 sm:h-4 w-full',
  CAPTION_SM_FIVE_SIXTHS: 'h-3 sm:h-4 w-5/6',
  CAPTION_SM_ELEVEN_TWELFTHS: 'h-3 sm:h-4 w-11/12',
  CAPTION_SM_TEN_TWELFTHS: 'h-3 sm:h-4 w-10/12',
  CAPTION_SM_HALF: 'h-3 sm:h-4 w-1/2',
  INPUT_RESPONSIVE_SM: 'h-10 w-full sm:w-40',
  BUTTON_RESPONSIVE_SM: 'h-10 w-full sm:w-28',
  BUTTON_RESPONSIVE_MD: 'h-10 w-full sm:w-36',
  SUBTITLE_RESPONSIVE_SM: 'h-4 sm:h-5 w-1/2',
  BODY_RESPONSIVE_SM: 'h-4 sm:h-5 w-1/2',
  CONTAINER_LG: 'h-24 w-full',
  CONTAINER_XL: 'h-32 w-full',
  AVATAR_SM: 'h-8 w-8',
  AVATAR_MD: 'h-12 w-12',
  AVATAR_LG: 'h-16 w-16',
  ICON_SM: 'h-5 w-5',
  ICON_MD: 'h-6 w-6',
  ICON_LG: 'h-8 w-8',
  PROGRESS_SM: 'h-2 w-full',
  PROGRESS_MD: 'h-3 w-full',
  PROGRESS_LG: 'h-4 w-full',
  BADGE_SM: 'h-5 w-12',
  BADGE_MD: 'h-5 w-16',
  BADGE_LG: 'h-5 w-20',
  TAG_SM: 'h-4 w-16',
  TAG_MD: 'h-4 w-20',
  TAG_LG: 'h-4 w-24',
  DIVIDER: 'h-px w-full',
  SPACER_SM: 'h-4 w-full',
  SPACER_MD: 'h-6 w-full',
  SPACER_LG: 'h-8 w-full',
} as const;

/**
 * Gradient Patterns
 */
export const GRADIENT_PATTERNS = {
  SHIMMER:
    'absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer',
  PROGRESS_BAR:
    'bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-700 ease-out',
  SUCCESS_BUTTON: 'bg-gradient-to-r from-green-400 to-green-600',
  PRIMARY_BUTTON: 'bg-gradient-to-r from-primary-400 to-primary-600',
  DIVIDER_PRIMARY: 'bg-gradient-to-r from-primary-300 to-primary-100',
  DIVIDER_AMBER_PRIMARY: 'bg-gradient-to-r from-amber-300 to-primary-300',
  DIVIDER_PRIMARY_GREEN: 'bg-gradient-to-r from-primary-300 to-green-300',
} as const;

/**
 * Gradient Configuration
 */
export const GRADIENT_CONFIG = {
  ARROW: {
    STEP_1_TO_2: 'bg-gradient-to-r from-amber-300 to-primary-300',
    STEP_2_TO_3: 'bg-gradient-to-r from-primary-300 to-green-300',
  },
  CONNECTOR: {
    HORIZONTAL: 'bg-gradient-to-r from-primary-300 to-primary-100',
    VERTICAL: 'bg-gradient-to-b from-primary-300 to-primary-100',
  },
  SCROLL_PROGRESS_BAR: 'bg-gradient-to-r from-primary-500 to-primary-600',
  REFERRAL_BACKGROUND: 'bg-gradient-to-r from-primary-50 to-blue-50',
} as const;

export type InputStyles = typeof INPUT_STYLES;
export type ButtonStyles = typeof BUTTON_STYLES;
export type AlertStyles = typeof ALERT_STYLES;
export type SkeletonPatterns = typeof SKELETON_PATTERNS;
export type GradientPatterns = typeof GRADIENT_PATTERNS;
export type GradientConfig = typeof GRADIENT_CONFIG;
