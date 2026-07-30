/**
 * Icon Size Configuration
 * Centralizes all hardcoded icon size values (w-N h-N patterns)
 * Follows the "Flexy" principle: eliminate hardcoded values and make modular systems
 */

/**
 * Icon size classes for consistent sizing
 * Replaces hardcoded w-* h-* classes throughout components
 */
export const ICON_SIZES = {
  /** w-2 h-2 = 8px */
  XS: 'w-2 h-2',
  /** w-2.5 h-2.5 = 10px */
  SM_XS: 'w-2.5 h-2.5',
  /** w-3 h-3 = 12px */
  SM: 'w-3 h-3',
  /** w-3.5 h-3.5 = 14px */
  MD_SM: 'w-3.5 h-3.5',
  /** w-4 h-4 = 16px */
  MD: 'w-4 h-4',
  /** w-5 h-5 = 20px */
  LG: 'w-5 h-5',
  /** w-6 h-6 = 24px */
  XL: 'w-6 h-6',
  /** w-8 h-8 = 32px */
  XXL: 'w-8 h-8',
  /** w-10 h-10 = 40px */
  XXXL: 'w-10 h-10',
  /** w-12 h-12 = 48px */
  XXXXL: 'w-12 h-12',
  /** w-16 h-16 = 64px */
  HUGE: 'w-16 h-16',
  /** w-20 h-20 = 80px */
  XXL_20: 'w-20 h-20',
  /** w-24 h-24 = 96px */
  MASSIVE: 'w-24 h-24',
} as const;

/**
 * Icon-only size classes (width only)
 * Replaces hardcoded w-* classes throughout components
 */
export const WIDTH_ONLY = {
  /** w-3 = 12px */
  SM: 'w-3',
  /** w-4 = 16px */
  MD: 'w-4',
  /** w-5 = 20px */
  LG: 'w-5',
  /** w-6 = 24px */
  XL: 'w-6',
  /** w-8 = 32px */
  XXL: 'w-8',
  /** w-20 = 80px */
  XXL_20: 'w-20',
  /** w-24 = 96px */
  XXXL: 'w-24',
  /** w-32 = 128px */
  XXXXL: 'w-32',
  /** w-48 = 192px */
  HUGE: 'w-48',
} as const;

/**
 * Height-only size classes
 * Replaces hardcoded h-* classes throughout components
 */
export const HEIGHT_ONLY = {
  /** h-3 = 12px */
  SM: 'h-3',
  /** h-4 = 16px */
  MD: 'h-4',
  /** h-5 = 20px */
  LG: 'h-5',
  /** h-6 = 24px */
  XL: 'h-6',
  /** h-8 = 32px */
  XXL: 'h-8',
  /** h-10 = 40px */
  XXXL: 'h-10',
  /** h-12 = 48px */
  XXXXL: 'h-12',
  /** h-16 = 64px */
  HUGE: 'h-16',
  /** h-24 = 96px */
  MASSIVE: 'h-24',
  /** h-32 = 128px */
  XXXXXL: 'h-32',
} as const;

/**
 * Skeleton loading size classes
 * Replaces hardcoded Skeleton component sizes
 */
export const SKELETON_SIZES = {
  /** h-3 w-40 */
  TEXT_SM: 'h-3 w-40',
  /** h-4 w-32 */
  TEXT_MD: 'h-4 w-32',
  /** h-4 w-48 */
  TEXT_LG: 'h-4 w-48',
  /** h-5 w-20 */
  BADGE_SM: 'h-5 w-20',
  /** h-5 w-48 */
  BADGE_MD: 'h-5 w-48',
  /** h-6 w-16 */
  TITLE_SM: 'h-6 w-16',
  /** h-6 w-48 */
  TITLE_MD: 'h-6 w-48',
  /** h-8 w-48 */
  TITLE_LG: 'h-8 w-48',
  /** h-9 w-28 */
  BUTTON_SM: 'h-9 w-28',
  /** h-9 w-32 */
  BUTTON_MD: 'h-9 w-32',
  /** h-10 w-28 */
  BUTTON_LG: 'h-10 w-28',
  /** h-10 w-32 */
  BUTTON_XL: 'h-10 w-32',
  /** h-10 w-40 */
  BUTTON_XXL: 'h-10 w-40',
  /** h-24 w-full */
  CARD_SM: 'h-24 w-full',
  /** h-32 w-full */
  CARD_MD: 'h-32 w-full',
} as const;

/**
 * Combined icon patterns for common use cases
 */
export const ICON_PATTERNS = {
  /** w-4 h-4 flex-shrink-0 */
  ICON_SM: 'w-4 h-4 flex-shrink-0',
  /** w-5 h-5 flex-shrink-0 */
  ICON_MD: 'w-5 h-5 flex-shrink-0',
  /** w-6 h-6 flex-shrink-0 */
  ICON_LG: 'w-6 h-6 flex-shrink-0',
  /** w-4 h-4 text-primary-600 */
  ICON_PRIMARY_SM: 'w-4 h-4 text-primary-600',
  /** w-5 h-5 text-primary-600 */
  ICON_PRIMARY_MD: 'w-5 h-5 text-primary-600',
  /** w-3 h-3 text-primary-500 */
  ICON_PRIMARY_LG: 'w-3 h-3 text-primary-500',
  /** w-4 h-4 mr-1.5 */
  ICON_WITH_MARGIN_SM: 'w-4 h-4 mr-1.5',
  /** w-4 h-4 mr-2 */
  ICON_WITH_MARGIN_MD: 'w-4 h-4 mr-2',
  /** w-5 h-5 mr-2 */
  ICON_WITH_MARGIN_LG: 'w-5 h-5 mr-2',
  /** animate-spin h-3 w-3 */
  SPINNER_SM: 'animate-spin h-3 w-3',
  /** animate-spin h-4 w-4 */
  SPINNER_MD: 'animate-spin h-4 w-4',
  /** animate-spin h-5 w-5 */
  SPINNER_LG: 'animate-spin h-5 w-5',
} as const;

/**
 * Mini button/icon patterns for compact UI elements
 */
export const MINI_BUTTON_SIZES = {
  /** w-2.5 h-2.5 rounded-full */
  DOT: 'w-2.5 h-2.5 rounded-full',
  /** w-3 h-3 rounded-full */
  DOT_SM: 'w-3 h-3 rounded-full',
  /** w-3.5 h-3.5 rounded-full */
  DOT_MD: 'w-3.5 h-3.5 rounded-full',
} as const;

export type IconSizes = typeof ICON_SIZES;
export type IconPatterns = typeof ICON_PATTERNS;
