/**
 * Spacing Configuration
 * Centralizes all hardcoded spacing values (gap, mt, mb, mr, ml, p, pt, pb, pr, pl)
 * Follows the "Flexy" principle: eliminate hardcoded values and make modular systems
 */

/**
 * Gap classes for flexbox and grid layouts
 * Replaces hardcoded gap-* classes throughout components
 */
export const GAP_CLASSES = {
  /** gap-0.5 = 2px */
  XS: 'gap-0.5',
  /** gap-1 = 4px */
  SM: 'gap-1',
  /** gap-1.5 = 6px */
  MD_SM: 'gap-1.5',
  /** gap-2 = 8px */
  MD: 'gap-2',
  /** gap-2.5 = 10px */
  MD_LG: 'gap-2.5',
  /** gap-3 = 12px */
  LG: 'gap-3',
  /** gap-4 = 16px */
  XL: 'gap-4',
  /** gap-6 = 24px */
  XXL: 'gap-6',
  /** gap-8 = 32px */
  XXXL: 'gap-8',
} as const;

/**
 * Margin top classes
 * Replaces hardcoded mt-* classes throughout components
 */
export const MT_CLASSES = {
  /** mt-0 = 0px */
  NONE: 'mt-0',
  /** mt-0.5 = 2px */
  XS: 'mt-0.5',
  /** mt-1 = 4px */
  SM: 'mt-1',
  /** mt-1.5 = 6px */
  MD_SM: 'mt-1.5',
  /** mt-2 = 8px */
  MD: 'mt-2',
  /** mt-3 = 12px */
  LG: 'mt-3',
  /** mt-4 = 16px */
  XL: 'mt-4',
  /** mt-6 = 24px */
  XXL: 'mt-6',
  /** mt-8 = 32px */
  XXXL: 'mt-8',
  /** mt-16 = 64px */
  XXXXL: 'mt-16',
} as const;

/**
 * Margin bottom classes
 * Replaces hardcoded mb-* classes throughout components
 */
export const MB_CLASSES = {
  /** mb-0 = 0px */
  NONE: 'mb-0',
  /** mb-1 = 4px */
  SM: 'mb-1',
  /** mb-2 = 8px */
  MD: 'mb-2',
  /** mb-3 = 12px */
  LG: 'mb-3',
  /** mb-4 = 16px */
  XL: 'mb-4',
  /** mb-6 = 24px */
  XXL: 'mb-6',
  /** mb-8 = 32px */
  XXXL: 'mb-8',
} as const;

/**
 * Margin right classes
 * Replaces hardcoded mr-* classes throughout components
 */
export const MR_CLASSES = {
  /** mr-0.5 = 2px */
  XS: 'mr-0.5',
  /** mr-1 = 4px */
  SM: 'mr-1',
  /** mr-1.5 = 6px */
  MD_SM: 'mr-1.5',
  /** mr-2 = 8px */
  MD: 'mr-2',
} as const;

/**
 * Margin left classes
 * Replaces hardcoded ml-* classes throughout components
 */
export const ML_CLASSES = {
  /** ml-0.5 = 2px */
  XS: 'ml-0.5',
  /** ml-1 = 4px */
  SM: 'ml-1',
  /** ml-2 = 8px */
  MD: 'ml-2',
  /** ml-auto */
  AUTO: 'ml-auto',
} as const;

/**
 * Padding classes
 * Replaces hardcoded p-* classes throughout components
 */
export const P_CLASSES = {
  /** p-0 = 0px */
  NONE: 'p-0',
  /** p-0.5 = 2px */
  XS: 'p-0.5',
  /** p-1 = 4px */
  SM: 'p-1',
  /** p-1.5 = 6px */
  MD_SM: 'p-1.5',
  /** p-2 = 8px */
  MD: 'p-2',
  /** p-3 = 12px */
  LG: 'p-3',
  /** p-4 = 16px */
  XL: 'p-4',
  /** p-6 = 24px */
  XXL: 'p-6',
  /** p-8 = 32px */
  XXXL: 'p-8',
} as const;

/**
 * Padding top classes
 * Replaces hardcoded pt-* classes throughout components
 */
export const PT_CLASSES = {
  /** pt-0 = 0px */
  NONE: 'pt-0',
  /** pt-1 = 4px */
  SM: 'pt-1',
  /** pt-2 = 8px */
  MD: 'pt-2',
  /** pt-4 = 16px */
  XL: 'pt-4',
} as const;

/**
 * Padding bottom classes
 * Replaces hardcoded pb-* classes throughout components
 */
export const PB_CLASSES = {
  /** pb-0 = 0px */
  NONE: 'pb-0',
  /** pb-1 = 4px */
  SM: 'pb-1',
  /** pb-2 = 8px */
  MD: 'pb-2',
  /** pb-4 = 16px */
  XL: 'pb-4',
} as const;

/**
 * Padding Y (vertical) classes
 * Replaces hardcoded py-* classes throughout components
 */
export const PY_CLASSES = {
  /** py-0 = 0px */
  NONE: 'py-0',
  /** py-0.5 = 2px */
  XS: 'py-0.5',
  /** py-1 = 4px */
  SM: 'py-1',
  /** py-2 = 8px */
  MD: 'py-2',
  /** py-3 = 12px */
  LG: 'py-3',
  /** py-4 = 16px */
  XL: 'py-4',
  /** py-6 = 24px */
  XXL: 'py-6',
  /** py-8 = 32px */
  XXXL: 'py-8',
  /** py-12 = 48px */
  XXXXL: 'py-12',
} as const;

/**
 * Padding right classes
 * Replaces hardcoded pr-* classes throughout components
 */
export const PR_CLASSES = {
  /** pr-0 = 0px */
  NONE: 'pr-0',
  /** pr-1 = 4px */
  SM: 'pr-1',
  /** pr-2 = 8px */
  MD: 'pr-2',
} as const;

/**
 * Padding left classes
 * Replaces hardcoded pl-* classes throughout components
 */
export const PL_CLASSES = {
  /** pl-0 = 0px */
  NONE: 'pl-0',
  /** pl-1 = 4px */
  SM: 'pl-1',
  /** pl-2 = 8px */
  MD: 'pl-2',
} as const;

/**
 * Combined spacing patterns for common use cases
 */
export const COMMON_SPACING_PATTERNS = {
  /** flex items-center gap-2 */
  FLEX_CENTER_SM: 'flex items-center gap-2',
  /** flex items-center gap-3 */
  FLEX_CENTER_MD: 'flex items-center gap-3',
  /** flex items-center gap-4 */
  FLEX_CENTER_LG: 'flex items-center gap-4',
  /** flex items-start gap-2 */
  FLEX_START_SM: 'flex items-start gap-2',
  /** flex items-start gap-3 */
  FLEX_START_MD: 'flex items-start gap-3',
  /** flex flex-col gap-2 */
  FLEX_COL_SM: 'flex flex-col gap-2',
  /** flex flex-col gap-3 */
  FLEX_COL_MD: 'flex flex-col gap-3',
  /** flex flex-col gap-4 */
  FLEX_COL_LG: 'flex flex-col gap-4',
  /** flex justify-between items-center */
  FLEX_BETWEEN: 'flex justify-between items-center',
  /** flex justify-center gap-2 */
  FLEX_CENTER_GAP_SM: 'flex justify-center gap-2',
  /** flex justify-center gap-3 */
  FLEX_CENTER_GAP_MD: 'flex justify-center gap-3',
} as const;

/**
 * Responsive spacing patterns
 */
export const RESPONSIVE_SPACING = {
  /** flex flex-col sm:flex-row items-start sm:items-center gap-3 */
  RESPONSIVE_ROW: 'flex flex-col sm:flex-row items-start sm:items-center gap-3',
  /** flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 */
  RESPONSIVE_BETWEEN:
    'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3',
  /** flex items-center gap-2 sm:gap-4 */
  RESPONSIVE_GAP: 'flex items-center gap-2 sm:gap-4',
} as const;

export type GapClasses = typeof GAP_CLASSES;
export type MtClasses = typeof MT_CLASSES;
export type MbClasses = typeof MB_CLASSES;
export type PyClasses = typeof PY_CLASSES;
export type CommonSpacingPatterns = typeof COMMON_SPACING_PATTERNS;
