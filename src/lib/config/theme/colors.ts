/**
 * Theme Colors Module
 * Centralizes all color-related theme constants
 */

import { EnvLoader } from '../environment';

/**
 * Section indicator colors for active/inactive states
 * Used by SectionIndicator component
 */
export const SECTION_INDICATOR_COLORS = {
  ACTIVE_BG: 'bg-primary-600',
  ACTIVE_PING: 'bg-primary-400',
  INACTIVE_BG: 'bg-gray-100',
  INACTIVE_HOVER_BG: 'hover:bg-primary-50',
} as const;

/**
 * Success state colors for password reset and confirmation screens
 * Used by forgot-password, signup, and confirmation pages
 */
export const SUCCESS_STATE_COLORS = {
  ICON_BG: 'bg-green-100',
  ICON_TEXT: 'text-green-600',
  HEADING: 'text-gray-900',
  BODY: 'text-gray-600',
  MUTED: 'text-gray-500',
} as const;

/**
 * Landing page feature card colors
 * Used by WhyChooseSection and FeatureGrid components
 */
export const LANDING_PAGE_COLORS = {
  FEATURE_ICON_BG: 'bg-green-100',
  FEATURE_ICON_HOVER: 'group-hover:bg-green-200',
  FEATURE_HOVER_BORDER: 'hover:border-green-200',
  FEATURE_HOVER_BG: 'hover:bg-green-50/30',
  FEATURE_TITLE_HOVER: 'group-hover:text-green-800',
  FEATURE_ICON_CONTAINER_HOVER: 'group-hover:bg-green-200',
} as const;

/**
 * Border color utilities for form states
 */
export const BORDER_COLORS = {
  DEFAULT: 'border-gray-300',
  LIGHT: 'border-gray-200',
  MUTED: 'border-gray-400',
  PRIMARY: 'border-primary-500',
  PRIMARY_LIGHT: 'border-primary-200',
  PRIMARY_DARK: 'border-primary-300',
  ERROR: 'border-red-300',
  ERROR_FOCUS: 'focus-visible:border-red-500',
  SUCCESS: 'border-green-500',
  SUCCESS_LIGHT: 'border-green-100',
  SUCCESS_LIGHTER: 'border-green-200',
  SUCCESS_MEDIUM: 'border-green-300',
  WARNING: 'border-amber-500',
  WARNING_LIGHT: 'border-amber-200',
  INFO: 'border-blue-200',
} as const;

/**
 * Ring color utilities for focus states
 */
export const RING_COLORS = {
  PRIMARY: 'focus-visible:ring-primary-500',
  ERROR: 'focus-visible:ring-red-500',
  SUCCESS: 'focus-visible:ring-green-500',
  SUCCESS_MEDIUM: 'focus-visible:ring-green-500',
} as const;

/**
 * Text color utilities
 */
export const TEXT_COLORS = {
  PRIMARY: 'text-gray-900',
  SECONDARY: 'text-gray-600',
  MUTED: 'text-gray-500',
  MUTED_LIGHT: 'text-gray-200',
  MUTED_DARK: 'text-gray-600',
  MUTED_LIGHTER: 'text-gray-100',
  ERROR: 'text-red-700',
  ERROR_LIGHT: 'text-red-500',
  SUCCESS: 'text-green-800',
  SUCCESS_LIGHT: 'text-green-700',
  SUCCESS_LIGHTER: 'text-green-100',
  SUCCESS_MEDIUM: 'text-green-700',
  SUCCESS_MEDIUM_DARK: 'text-green-600',
  SUCCESS_DARK: 'text-green-700',
  SUCCESS_VERY_LIGHT: 'text-green-700',
  WARNING: 'text-amber-700',
  WARNING_LIGHT: 'text-amber-700',
  WARNING_MEDIUM: 'text-amber-700',
  WARNING_ICON: 'text-amber-600',
  INFO: 'text-blue-800',
  INFO_LIGHT: 'text-blue-600',
  INFO_DARK: 'text-blue-900',
  BRAND: 'text-primary-700',
  BRAND_600: 'text-primary-600',
  BRAND_LIGHT: 'text-primary-500',
  HOVER_SECONDARY: 'hover:text-gray-600',
  HOVER_PRIMARY: 'hover:text-gray-900',
} as const;

/**
 * Background color utilities
 */
export const BG_COLORS = {
  DEFAULT: 'bg-white',
  DARK: 'bg-gray-700',
  LIGHT: 'bg-gray-50',
  LIGHTER: 'bg-gray-100',
  LIGHT_DARK: 'bg-gray-200',
  SUCCESS: 'bg-green-600',
  SUCCESS_LIGHT: 'bg-green-100',
  SUCCESS_LIGHTER: 'bg-green-200',
  SUCCESS_VERY_LIGHT: 'bg-green-50',
  WARNING: 'bg-amber-600',
  WARNING_LIGHT: 'bg-amber-100',
  WARNING_LIGHTER: 'bg-amber-50',
  ERROR: 'bg-red-500',
  INFO: 'bg-blue-100',
  INFO_LIGHT: 'bg-blue-50',
  PROGRESS_NEUTRAL: 'bg-gray-200',
  OVERLAY: 'bg-black/40',
  OVERLAY_DARK: 'bg-black/50',
  BRAND_LIGHT: 'bg-primary-50',
  BRAND_LIGHTER: 'bg-primary-50/30',
  BRAND_LIGHT_HALF: 'bg-primary-50/50',
  BRAND_100: 'bg-primary-100',
  BRAND_200: 'bg-primary-200',
  BRAND: 'bg-primary-600',
  BRAND_500: 'bg-primary-500',
  BRAND_HOVER: 'hover:bg-primary-700',
  DARKER: 'bg-gray-800',
} as const;

/**
 * Celebration animation colors
 * Used for success/confetti animations
 */
export const CELEBRATION_COLORS = {
  SUCCESS: EnvLoader.string('CELEBRATION_COLOR_SUCCESS', '#10B981'),
  PRIMARY: EnvLoader.string('CELEBRATION_COLOR_PRIMARY', '#3B82F6'),
  PURPLE: EnvLoader.string('CELEBRATION_COLOR_PURPLE', '#8B5CF6'),
  AMBER: EnvLoader.string('CELEBRATION_COLOR_AMBER', '#F59E0B'),
  PINK: EnvLoader.string('CELEBRATION_COLOR_PINK', '#EC4899'),
  CYAN: EnvLoader.string('CELEBRATION_COLOR_CYAN', '#06B6D4'),
  ALL: (() => {
    const colors = [
      EnvLoader.string('CELEBRATION_COLOR_SUCCESS', '#10B981'),
      EnvLoader.string('CELEBRATION_COLOR_PRIMARY', '#3B82F6'),
      EnvLoader.string('CELEBRATION_COLOR_PURPLE', '#8B5CF6'),
      EnvLoader.string('CELEBRATION_COLOR_AMBER', '#F59E0B'),
      EnvLoader.string('CELEBRATION_COLOR_PINK', '#EC4899'),
      EnvLoader.string('CELEBRATION_COLOR_CYAN', '#06B6D4'),
    ];
    return colors as unknown as readonly string[];
  })(),
  PROGRESS_CIRCLE: {
    TRACK: EnvLoader.string('CELEBRATION_PROGRESS_TRACK_COLOR', '#e5e7eb'),
    PROGRESS: EnvLoader.string(
      'CELEBRATION_PROGRESS_INDICATOR_COLOR',
      '#2563eb'
    ),
    RADIUS: EnvLoader.number('CELEBRATION_PROGRESS_RADIUS', 45, 20, 100),
  },
  SHADOWS: {
    DROP_SHADOW: EnvLoader.string(
      'CELEBRATION_SHADOW_DROP',
      'rgba(37, 99, 235, 0.4)'
    ),
    BOX_SHADOW: EnvLoader.string(
      'CELEBRATION_SHADOW_BOX',
      'rgba(37, 99, 235, 0.5)'
    ),
  },
} as const;

/**
 * Brand Colors
 */
export const BRAND_COLORS = {
  PRIMARY: EnvLoader.string('BRAND_COLOR_PRIMARY', '#2563eb'),
} as const;

/**
 * Confetti Colors for CopyButton and Celebration Components
 */
export const CONFETTI_COLORS = {
  PRIMARY: [
    EnvLoader.string('CONFETTI_COLOR_1', '#22c55e'),
    EnvLoader.string('CONFETTI_COLOR_2', '#3b82f6'),
    EnvLoader.string('CONFETTI_COLOR_3', '#eab308'),
    EnvLoader.string('CONFETTI_COLOR_4', '#ec4899'),
    EnvLoader.string('CONFETTI_COLOR_5', '#8b5cf6'),
  ] as readonly string[],
  PARTICLE_COUNT: EnvLoader.number('CONFETTI_PARTICLE_COUNT', 6, 3, 12),
  MIN_DISTANCE: EnvLoader.number('CONFETTI_MIN_DISTANCE', 20, 5, 50),
  MAX_DISTANCE_VARIANCE: EnvLoader.number(
    'CONFETTI_MAX_DISTANCE_VARIANCE',
    20,
    5,
    50
  ),
  MIN_SIZE: EnvLoader.number('CONFETTI_MIN_SIZE', 4, 2, 10),
  MAX_SIZE_VARIANCE: EnvLoader.number('CONFETTI_MAX_SIZE_VARIANCE', 6, 2, 10),
  PARTICLE_DELAY_MS: EnvLoader.number('CONFETTI_PARTICLE_DELAY_MS', 30, 5, 100),
} as const;

/**
 * OAuth provider brand colors
 */
export const OAUTH_PROVIDER_COLORS = {
  GOOGLE: {
    BLUE: EnvLoader.string('GOOGLE_OAUTH_BLUE', '#4285F4'),
    GREEN: EnvLoader.string('GOOGLE_OAUTH_GREEN', '#34A853'),
    YELLOW: EnvLoader.string('GOOGLE_OAUTH_YELLOW', '#FBBC05'),
    RED: EnvLoader.string('GOOGLE_OAUTH_RED', '#EA4335'),
  } as const,
  GITHUB: {
    BLACK: EnvLoader.string('GITHUB_OAUTH_BLACK', '#24292F'),
  } as const,
} as const;

/**
 * Action Colors for Dashboard and Table Actions
 */
export const ACTION_COLORS = {
  CONTINUE: {
    text: 'text-primary-600',
    hoverText: 'hover:text-primary-900',
    bg: '',
    hoverBg: 'hover:bg-primary-50',
    ariaLabel: 'Continue working on this idea',
  },
  VIEW: {
    text: 'text-green-600',
    hoverText: 'hover:text-green-900',
    bg: '',
    hoverBg: 'hover:bg-green-50',
    ariaLabel: 'View blueprint',
  },
  DELETE: {
    text: 'text-red-600',
    hoverText: 'hover:text-red-900',
    bg: '',
    hoverBg: 'hover:bg-red-50',
    ariaLabel: 'Delete this item',
  },
  EDIT: {
    text: 'text-indigo-600',
    hoverText: 'hover:text-indigo-900',
    bg: '',
    hoverBg: 'hover:bg-indigo-50',
    ariaLabel: 'Edit this item',
  },
} as const;

/**
 * Character Count Colors
 */
export const CHAR_COUNT_COLORS = {
  OVER_LIMIT: EnvLoader.string('CHAR_COUNT_COLOR_OVER_LIMIT', '#b91c1c'),
  WARNING_START: { r: 180, g: 119, b: 11 },
  WARNING_END: { r: 185, g: 28, b: 28 },
  SUCCESS_START: { r: 22, g: 163, b: 74 },
  SUCCESS_END: { r: 180, g: 119, b: 11 },
  NORMAL: EnvLoader.string('CHAR_COUNT_COLOR_NORMAL', '#15803d'),
  EMPTY: EnvLoader.string('CHAR_COUNT_COLOR_EMPTY', '#4b5563'),
  THRESHOLDS: {
    WARNING_START: 0.9,
    WARNING_RANGE: 0.1,
    SUCCESS_START: 0.7,
    SUCCESS_RANGE: 0.2,
  },
} as const;

/**
 * Component State Colors
 */
export const COMPONENT_STATE_COLORS = {
  COPIED: {
    ICON: 'text-green-700 bg-green-50 hover:bg-green-100 hover:text-green-800',
    CHECKMARK: 'text-green-700',
    DEFAULT: 'text-green-700',
  },
  SHARED: {
    ICON: 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700',
    CHECKMARK: 'text-green-500',
    DEFAULT: 'text-green-500',
  },
  CELEBRATION: {
    CIRCLE_BG: 'bg-green-100',
    RIPPLE_1: 'border-green-400',
    RIPPLE_2: 'border-green-300',
  },
  IDEA_READY: {
    READY: 'bg-green-100 text-green-700',
    NOT_READY: 'bg-gray-100 text-gray-800',
    CHECKMARK: 'text-green-700',
  },
  ERROR_BOUNDARY: {
    SKIP_LINK: 'focus:bg-blue-600 focus:text-white',
  },
  BLUEPRINT: {
    COPIED: 'bg-green-100 text-green-700 border border-green-200',
    DEFAULT:
      'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300',
  },
  INPUT_SUCCESS: {
    FLASH: 'border-green-500 ring-green-500',
  },
  PASSWORD: {
    MET_CHECKMARK: 'text-green-700',
    UNMET_ICON: 'text-gray-500',
  },
  EMAIL: {
    SUCCESS_CHECKMARK: 'text-green-700',
  },
  SCROLL_PROGRESS: {
    NEAR_BOTTOM_STROKE: 'text-emerald-500',
    NEAR_BOTTOM_TEXT: 'text-emerald-600',
    MIDDLE_STROKE: 'text-primary-500',
    MIDDLE_TEXT: 'text-primary-600',
    REACHED_END_STROKE: 'text-emerald-500',
    REACHED_END_TEXT: 'text-emerald-600',
  },
} as const;

export type BorderColors = typeof BORDER_COLORS;
export type RingColors = typeof RING_COLORS;
export type TextColors = typeof TEXT_COLORS;
export type BgColors = typeof BG_COLORS;
export type CelebrationColors = typeof CELEBRATION_COLORS;
export type CharCountColors = typeof CHAR_COUNT_COLORS;
