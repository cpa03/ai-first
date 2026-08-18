/**
 * Primary Color Patterns Configuration
 *
 * Centralizes all hardcoded primary color Tailwind classes used throughout
 * components. Follows the "Flexy" principle: eliminate hardcoded values
 * and make modular systems.
 *
 * Usage:
 * ```typescript
 * import { PRIMARY_COLOR_PATTERNS } from '@/lib/config/primary-colors';
 *
 * // Instead of hardcoded className:
 * <button className="text-primary-600 hover:text-primary-700">
 *
 * // Use modular config:
 * <button className={PRIMARY_COLOR_PATTERNS.TEXT.HOVER_700}>
 * ```
 */

/**
 * Primary text color patterns
 */
export const PRIMARY_TEXT = {
  /** text-primary-400 */
  _400: 'text-primary-400',
  /** text-primary-500 */
  _500: 'text-primary-500',
  /** text-primary-600 */
  _600: 'text-primary-600',
  /** text-primary-700 */
  _700: 'text-primary-700',
  /** text-primary-800 */
  _800: 'text-primary-800',
  /** text-primary-900 */
  _900: 'text-primary-900',
  /** hover:text-primary-500 */
  HOVER_500: 'hover:text-primary-500',
  /** hover:text-primary-600 */
  HOVER_600: 'hover:text-primary-600',
  /** hover:text-primary-700 */
  HOVER_700: 'hover:text-primary-700',
  /** hover:text-primary-900 */
  HOVER_900: 'hover:text-primary-900',
} as const;

/**
 * Primary background color patterns
 */
export const PRIMARY_BG = {
  /** bg-primary-50 */
  _50: 'bg-primary-50',
  /** bg-primary-100 */
  _100: 'bg-primary-100',
  /** bg-primary-200 */
  _200: 'bg-primary-200',
  /** bg-primary-500 */
  _500: 'bg-primary-500',
  /** bg-primary-600 */
  _600: 'bg-primary-600',
  /** hover:bg-primary-50 */
  HOVER_50: 'hover:bg-primary-50',
  /** hover:bg-primary-700 */
  HOVER_700: 'hover:bg-primary-700',
} as const;

/**
 * Primary border color patterns
 */
export const PRIMARY_BORDER = {
  /** border-primary-100 */
  _100: 'border-primary-100',
  /** border-primary-200 */
  _200: 'border-primary-200',
  /** border-primary-300 */
  _300: 'border-primary-300',
  /** border-primary-400 */
  _400: 'border-primary-400',
  /** border-primary-500 */
  _500: 'border-primary-500',
  /** border-primary-600 */
  _600: 'border-primary-600',
  /** hover:border-primary-300 */
  HOVER_300: 'hover:border-primary-300',
} as const;

/**
 * Primary ring color patterns (for focus states)
 */
export const PRIMARY_RING = {
  /** ring-primary-500 */
  _500: 'ring-primary-500',
  /** focus:ring-primary-500 */
  FOCUS_500: 'focus:ring-primary-500',
  /** focus-visible:ring-primary-500 */
  FOCUS_VISIBLE_500: 'focus-visible:ring-primary-500',
} as const;

/**
 * Combined primary color patterns for easy access
 */
export const PRIMARY_COLOR_PATTERNS = {
  TEXT: PRIMARY_TEXT,
  BG: PRIMARY_BG,
  BORDER: PRIMARY_BORDER,
  RING: PRIMARY_RING,
} as const;

/**
 * Common primary color combinations used in components
 */
export const PRIMARY_COMBINATIONS = {
  /** text-primary-600 hover:text-primary-700 - standard link hover */
  LINK_HOVER: 'text-primary-600 hover:text-primary-700',
  /** text-primary-600 hover:text-primary-500 - link hover lighter */
  LINK_HOVER_LIGHT: 'text-primary-600 hover:text-primary-500',
  /** bg-primary-600 text-white - primary button */
  BUTTON_PRIMARY: 'bg-primary-600 text-white',
  /** bg-primary-100 text-primary-700 - secondary button / badge */
  BADGE_SECONDARY: 'bg-primary-100 text-primary-700',
  /** bg-primary-200 text-primary-800 - darker badge */
  BADGE_DARK: 'bg-primary-200 text-primary-800',
  /** bg-primary-50 border-primary-200 - light card */
  CARD_LIGHT: 'bg-primary-50 border border-primary-200',
  /** focus:ring-primary-500 focus:border-primary-500 - form focus states */
  FORM_FOCUS: 'focus:ring-primary-500 focus:border-primary-500',
  /** hover:text-primary-600 hover:bg-primary-50 - interactive hover */
  INTERACTIVE_HOVER: 'hover:text-primary-600 hover:bg-primary-50',
  /** border-primary-600 bg-primary-600 text-white - active step */
  ACTIVE_STEP: 'border-primary-600 bg-primary-600 text-white',
  /** border-primary-600 text-primary-600 - active step outline */
  ACTIVE_STEP_OUTLINE: 'border-primary-600 text-primary-600',
  /** hover:border-primary-200 - subtle border hover */
  BORDER_HOVER: 'hover:border-primary-200',
  /** border-primary-500 ring-green-500 - success input */
  INPUT_SUCCESS: 'border-primary-500 ring-green-500',
} as const;

/**
 * Primary color patterns for specific components
 * Used in: KeyboardShortcutsHelp, ReferralLink, MobileNav, etc.
 */
export const COMPONENT_PRIMARY_PATTERNS = {
  /** Search result badge: text-xs text-primary-600 font-medium px-2 py-0.5 bg-primary-50 rounded-full */
  SEARCH_RESULT_BADGE:
    'text-xs text-primary-600 font-medium px-2 py-0.5 bg-primary-50 rounded-full',
  /** Search input: rounded border-gray-300 text-primary-600 focus:ring-primary-500 */
  SEARCH_INPUT:
    'rounded border-gray-300 text-primary-600 focus:ring-primary-500',
  /** Category icon: text-primary-600 */
  CATEGORY_ICON: 'text-primary-600',
  /** Active nav link: border-primary-600 text-primary-600 */
  NAV_ACTIVE_LINK: 'border-primary-600 text-primary-600',
  /** Active nav link hover: hover:text-primary-600 hover:border-primary-300 */
  NAV_HOVER: 'hover:text-primary-600 hover:border-primary-300',
  /** Active nav bg: bg-primary-50/30 */
  NAV_ACTIVE_BG: 'bg-primary-50/30',
  /** Onboarding spotlight: border-2 border-primary-500 rounded-lg */
  ONBOARDING_SPOTLIGHT: 'border-2 border-primary-500 rounded-lg',
  /** Referral link input: border-primary-200 text-primary-800 */
  REFERRAL_INPUT: 'border-primary-200 text-primary-800',
  /** Referral title: text-primary-900 */
  REFERRAL_TITLE: 'text-primary-900',
  /** Referral icon: text-primary-600 */
  REFERRAL_ICON: 'text-primary-600',
  /** Footer active link: text-primary-600 font-semibold */
  FOOTER_ACTIVE: 'text-primary-600 font-semibold',
  /** Footer link hover: hover:text-primary-600 */
  FOOTER_HOVER: 'hover:text-primary-600',
  /** Scroll to top hover: hover:text-primary-600 */
  SCROLL_TO_TOP_HOVER: 'hover:text-primary-600',
  /** Scroll to top border hover: hover:border-primary-200 */
  SCROLL_TO_TOP_BORDER_HOVER: 'hover:border-primary-200',
  /** Task management icon: text-primary-500 */
  TASK_ICON: 'text-primary-500',
  /** Task management icon large: text-primary-400 */
  TASK_ICON_LARGE: 'text-primary-400',
  /** Feature grid hover: group-hover:text-primary-700 */
  FEATURE_HOVER: 'group-hover:text-primary-700',
  /** Clarification flow active: text-primary-600 font-medium */
  CLARIFICATION_ACTIVE: 'text-primary-600 font-medium',
  /** Auth spinner border: border-primary-600 */
  AUTH_SPINNER_BORDER: 'border-primary-600',
  /** Progress stepper hover: group-hover:border-primary-400 group-hover:shadow-primary-200/50 */
  PROGRESS_HOVER:
    'group-hover:border-primary-400 group-hover:shadow-primary-200/50',
  /** Progress stepper focus: group-focus-visible:ring-primary-500 */
  PROGRESS_FOCUS: 'group-focus-visible:ring-primary-500',
  /** Dashboard filter active: focus:ring-primary-500 focus:border-primary-500 */
  DASHBOARD_FILTER_FOCUS: 'focus:ring-primary-500 focus:border-primary-500',
  /** Dashboard step icon: bg-primary-50 border-primary-200 */
  DASHBOARD_STEP_ICON: 'bg-primary-50 border border-primary-200',
  /** Active step: border-primary-600 bg-primary-600 text-white */
  ACTIVE_STEP: 'border-primary-600 bg-primary-600 text-white',
  /** Active step outline: border-primary-600 text-primary-600 */
  ACTIVE_STEP_OUTLINE: 'border-primary-600 text-primary-600',
  /** Badge secondary: bg-primary-100 text-primary-700 */
  BADGE_SECONDARY: 'bg-primary-100 text-primary-700',
  /** Badge dark: bg-primary-200 text-primary-800 */
  BADGE_DARK: 'bg-primary-200 text-primary-800',
} as const;

export type PrimaryText = typeof PRIMARY_TEXT;
export type PrimaryBg = typeof PRIMARY_BG;
export type PrimaryBorder = typeof PRIMARY_BORDER;
export type PrimaryRing = typeof PRIMARY_RING;
export type PrimaryColorPatterns = typeof PRIMARY_COLOR_PATTERNS;
export type PrimaryCombinations = typeof PRIMARY_COMBINATIONS;
export type ComponentPrimaryPatterns = typeof COMPONENT_PRIMARY_PATTERNS;
