/**
 * Theme Classes Module
 * Centralizes all Tailwind utility class constants
 */

/**
 * Standard classes for <kbd> elements
 */
export const KBD_CLASSES =
  'hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-gray-100 border border-gray-400 rounded text-xs font-sans font-medium text-gray-800';

/**
 * Text Color Utility Classes
 */
export const TEXT_COLOR_CLASSES = {
  HEADING: 'text-gray-900',
  BODY: 'text-gray-600',
  MUTED: 'text-gray-500',
  PLACEHOLDER: 'text-gray-500',
  BRAND: 'text-primary-700',
  BRAND_HOVER: 'hover:text-primary-900',
  ERROR: 'text-red-700',
  SUCCESS: 'text-green-800',
  SUCCESS_DARK: 'text-green-700',
  SUCCESS_MEDIUM: 'text-green-700',
  WARNING: 'text-amber-700',
  WARNING_LIGHT: 'text-amber-700',
  WARNING_MEDIUM: 'text-amber-700',
  INFO: 'text-blue-800',
  INFO_LIGHT: 'text-blue-600',
  INFO_DARK: 'text-blue-900',
  INVERSE: 'text-white',
  LINK: 'text-gray-500 hover:text-primary-600 underline',
  LABEL: 'text-gray-500',
  INPUT: 'text-gray-800',
  MUTED_DARK: 'text-gray-700',
  LIGHT: 'text-gray-300',
  HOVER_MUTED: 'hover:text-gray-700',
  HOVER_HEADING: 'hover:text-gray-900',
} as const;

/**
 * Background Color Utility Classes
 */
export const BG_COLOR_CLASSES = {
  PAGE: 'bg-gray-50',
  CARD: 'bg-white',
  SUBTLE: 'bg-gray-100',
  LIGHT: 'bg-gray-200',
  BRAND: 'bg-primary-600',
  BRAND_HOVER: 'hover:bg-primary-700',
  SUCCESS: 'bg-green-600',
  SUCCESS_LIGHT: 'bg-green-100',
  ERROR: 'bg-red-500',
  WARNING: 'bg-amber-600',
  INFO: 'bg-blue-100',
  INFO_LIGHT: 'bg-blue-50',
  TRANSPARENT: 'bg-transparent',
  SKELETON: 'bg-gray-200',
  HOVER_SUBTLE: 'hover:bg-gray-100',
  HOVER_LIGHT: 'hover:bg-gray-200',
} as const;

/**
 * Border Color Utility Classes
 */
export const BORDER_COLOR_CLASSES = {
  DEFAULT: 'border-gray-300',
  LIGHT: 'border-gray-200',
  FOCUS: 'border-primary-500',
  ERROR: 'border-red-300',
  SUCCESS: 'border-green-500',
  WARNING: 'border-amber-500',
  WARNING_LIGHT: 'border-amber-200',
  INFO: 'border-blue-200',
  NONE: 'border-0',
  TOP: 'border-t border-gray-200',
  MUTED_DARK: 'border-gray-700',
  EXTRA_LIGHT: 'border-gray-100',
  HOVER_DEFAULT: 'hover:border-gray-400',
} as const;

/**
 * Focus Ring Utility Classes
 */
export const FOCUS_RING_CLASSES = {
  PRIMARY: 'focus-visible:ring-primary-500',
  ERROR: 'focus-visible:ring-red-500',
  SUCCESS: 'focus-visible:ring-green-500',
  NONE: 'focus-visible:ring-0',
} as const;

/**
 * Spacing Utility Classes
 */
export const SPACING_CLASSES = {
  SECTION: 'mb-8',
  COMPONENT: 'mb-6',
  ELEMENT: 'mb-4',
  SMALL: 'mb-2',
  EXTRA_SMALL: 'mb-1',
  NONE: 'mb-0',
  TOP: 'mt-8',
  TOP_SMALL: 'mt-2',
  PAGE: 'p-8',
  CARD: 'p-6',
  COMPONENT_PADDING: 'p-4',
  PADDING_SMALL: 'p-2',
} as const;

/**
 * Typography Utility Classes
 */
export const TYPOGRAPHY_CLASSES = {
  PAGE_HEADING: 'text-3xl font-bold',
  SECTION_HEADING: 'text-2xl font-semibold',
  COMPONENT_HEADING: 'text-xl font-semibold',
  SUBHEADING: 'text-lg font-semibold',
  BODY: 'text-base',
  SMALL: 'text-sm',
  EXTRA_SMALL: 'text-xs',
  CODE: 'font-mono',
  NORMAL: 'font-normal',
  MEDIUM: 'font-medium',
  SEMIBOLD: 'font-semibold',
  BOLD: 'font-bold',
  LIGHT: 'font-light',
  XS_MEDIUM: 'text-xs font-medium',
  XS_SEMIBOLD: 'text-xs font-semibold',
  XS_BOLD: 'text-xs font-bold',
  SM_MEDIUM: 'text-sm font-medium',
  SM_SEMIBOLD: 'text-sm font-semibold',
  SM_BOLD: 'text-sm font-bold',
  BASE_MEDIUM: 'text-base font-medium',
  BASE_SEMIBOLD: 'text-base font-semibold',
  LG_SEMIBOLD: 'text-lg font-semibold',
  XL_SEMIBOLD: 'text-xl font-semibold',
  XXL_SEMIBOLD: 'text-2xl font-semibold',
  XXL_BOLD: 'text-2xl font-bold',
  XXXL_BOLD: 'text-3xl font-bold',
} as const;

/**
 * Layout Utility Classes
 */
export const LAYOUT_CLASSES = {
  CENTER: 'flex items-center justify-center',
  FLEX_ROW: 'flex items-center',
  FLEX_COL: 'flex flex-col',
  GRID: 'grid grid-cols-1',
  RESPONSIVE_GRID: 'grid grid-cols-1 sm:grid-cols-2',
  FULL_WIDTH: 'w-full',
  FULL_HEIGHT: 'h-full',
  MIN_HEIGHT_SCREEN: 'min-h-screen',
  TEXT_CENTER: 'text-center',
  OVERFLOW_HIDDEN: 'overflow-hidden',
  OVERFLOW_AUTO: 'overflow-auto',
} as const;

/**
 * Rounded Corner Utility Classes
 */
export const ROUNDED_CLASSES = {
  DEFAULT: 'rounded',
  MEDIUM: 'rounded-md',
  LARGE: 'rounded-lg',
  EXTRA_LARGE: 'rounded-xl',
  FULL: 'rounded-full',
  NONE: 'rounded-none',
} as const;

/**
 * Reusable Focus Ring Pattern
 */
export const PRIMARY_FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2';

/**
 * Primary Link Style
 */
export const PRIMARY_LINK =
  'text-primary-600 hover:text-primary-700 font-medium transition-colors';

/**
 * Primary Link with Focus Ring
 */
export const PRIMARY_LINK_FOCUS = `${PRIMARY_LINK} ${PRIMARY_FOCUS_RING} rounded`;

/**
 * Primary Active Navigation Link
 */
export const PRIMARY_ACTIVE_LINK =
  'border-primary-600 text-primary-600 bg-primary-50/50';

/**
 * Primary Inactive Navigation Link with Hover
 */
export const PRIMARY_INACTIVE_LINK =
  'border-transparent text-gray-800 hover:text-primary-600 hover:bg-gray-50';

/**
 * Combined Tailwind Utility Classes
 */
export const TAILWIND_UTILS = {
  TEXT: TEXT_COLOR_CLASSES,
  BG: BG_COLOR_CLASSES,
  BORDER: BORDER_COLOR_CLASSES,
  FOCUS: FOCUS_RING_CLASSES,
  SPACING: SPACING_CLASSES,
  TYPOGRAPHY: TYPOGRAPHY_CLASSES,
  LAYOUT: LAYOUT_CLASSES,
  TRANSITION: {}, // Will be imported from animations
  SHADOW: {}, // Will be imported from shadows
  ROUNDED: ROUNDED_CLASSES,
} as const;

export type TextColorClasses = typeof TEXT_COLOR_CLASSES;
export type BgColorClasses = typeof BG_COLOR_CLASSES;
export type BorderColorClasses = typeof BORDER_COLOR_CLASSES;
export type FocusRingClasses = typeof FOCUS_RING_CLASSES;
export type SpacingClasses = typeof SPACING_CLASSES;
export type TypographyClasses = typeof TYPOGRAPHY_CLASSES;
export type LayoutClasses = typeof LAYOUT_CLASSES;
export type RoundedClasses = typeof ROUNDED_CLASSES;
export type TailwindUtils = typeof TAILWIND_UTILS;
