/**
 * Positioning Configuration
 * Centralizes all hardcoded positioning values (top, right, bottom, left)
 * Follows the "Flexy" principle: eliminate hardcoded values and make modular systems
 */

/**
 * Top positioning classes
 * Replaces hardcoded top-* classes throughout components
 */
export const TOP_CLASSES = {
  /** top-0 = 0px */
  NONE: 'top-0',
  /** top-0.5 = 2px */
  XS: 'top-0.5',
  /** top-1 = 4px */
  SM: 'top-1',
  /** top-1.5 = 6px */
  MD_SM: 'top-1.5',
  /** top-2 = 8px */
  MD: 'top-2',
  /** top-3 = 12px */
  LG: 'top-3',
  /** top-4 = 16px */
  XL: 'top-4',
  /** top-6 = 24px */
  XXL: 'top-6',
  /** top-8 = 32px */
  XXXL: 'top-8',
  /** top-1/2 = 50% */
  HALF: 'top-1/2',
  /** top-full = 100% */
  FULL: 'top-full',
} as const;

/**
 * Right positioning classes
 * Replaces hardcoded right-* classes throughout components
 */
export const RIGHT_CLASSES = {
  /** right-0 = 0px */
  NONE: 'right-0',
  /** right-0.5 = 2px */
  XS: 'right-0.5',
  /** right-1 = 4px */
  SM: 'right-1',
  /** right-1.5 = 6px */
  MD_SM: 'right-1.5',
  /** right-2 = 8px */
  MD: 'right-2',
  /** right-3 = 12px */
  LG: 'right-3',
  /** right-4 = 16px */
  XL: 'right-4',
  /** right-6 = 24px */
  XXL: 'right-6',
  /** right-8 = 32px */
  XXXL: 'right-8',
  /** right-12 = 48px */
  XXXXL: 'right-12',
  /** right-14 = 56px */
  XXXXL_SM: 'right-14',
  /** right-16 = 64px */
  XXXXXL: 'right-16',
  /** right-20 = 80px */
  XXXXXL_MD: 'right-20',
  /** right-28 = 112px */
  XXXXXL_LG: 'right-28',
  /** right-36 = 144px */
  XXXXXL_XL: 'right-36',
  /** right-full = 100% */
  FULL: 'right-full',
} as const;

/**
 * Bottom positioning classes
 * Replaces hardcoded bottom-* classes throughout components
 */
export const BOTTOM_CLASSES = {
  /** bottom-0 = 0px */
  NONE: 'bottom-0',
  /** bottom-0.5 = 2px */
  XS: 'bottom-0.5',
  /** bottom-1 = 4px */
  SM: 'bottom-1',
  /** bottom-1.5 = 6px */
  MD_SM: 'bottom-1.5',
  /** bottom-2 = 8px */
  MD: 'bottom-2',
  /** bottom-3 = 12px */
  LG: 'bottom-3',
  /** bottom-4 = 16px */
  XL: 'bottom-4',
  /** bottom-6 = 24px */
  XXL: 'bottom-6',
  /** bottom-8 = 32px */
  XXXL: 'bottom-8',
  /** bottom-full = 100% */
  FULL: 'bottom-full',
} as const;

/**
 * Left positioning classes
 * Replaces hardcoded left-* classes throughout components
 */
export const LEFT_CLASSES = {
  /** left-0 = 0px */
  NONE: 'left-0',
  /** left-0.5 = 2px */
  XS: 'left-0.5',
  /** left-1 = 4px */
  SM: 'left-1',
  /** left-1.5 = 6px */
  MD_SM: 'left-1.5',
  /** left-2 = 8px */
  MD: 'left-2',
  /** left-3 = 12px */
  LG: 'left-3',
  /** left-4 = 16px */
  XL: 'left-4',
  /** left-6 = 24px */
  XXL: 'left-6',
  /** left-8 = 32px */
  XXXL: 'left-8',
  /** left-12 = 48px */
  XXXXL: 'left-12',
  /** left-14 = 56px */
  XXXXL_SM: 'left-14',
  /** left-16 = 64px */
  XXXXXL: 'left-16',
  /** left-20 = 80px */
  XXXXXL_MD: 'left-20',
  /** left-28 = 112px */
  XXXXXL_LG: 'left-28',
  /** left-36 = 144px */
  XXXXXL_XL: 'left-36',
  /** left-1/2 = 50% */
  HALF: 'left-1/2',
  /** left-full = 100% */
  FULL: 'left-full',
} as const;

/**
 * Combined positioning patterns for common use cases
 */
export const COORDINATE_POSITION_PATTERNS = {
  /** absolute top-0 left-0 */
  TOP_LEFT: 'absolute top-0 left-0',
  /** absolute top-0 right-0 */
  TOP_RIGHT: 'absolute top-0 right-0',
  /** absolute bottom-0 left-0 */
  BOTTOM_LEFT: 'absolute bottom-0 left-0',
  /** absolute bottom-0 right-0 */
  BOTTOM_RIGHT: 'absolute bottom-0 right-0',
  /** absolute inset-0 */
  INSET: 'absolute inset-0',
  /** absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 */
  CENTER: 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  /** absolute top-3 right-3 */
  TOP_RIGHT_SM: 'absolute top-3 right-3',
  /** absolute bottom-1.5 right-2 */
  BOTTOM_RIGHT_SM: 'absolute bottom-1.5 right-2',
  /** absolute bottom-1.5 left-2 */
  BOTTOM_LEFT_SM: 'absolute bottom-1.5 left-2',
  /** absolute left-0 top-0 bottom-0 */
  LEFT_FULL_HEIGHT: 'absolute left-0 top-0 bottom-0',
  /** absolute right-3 top-1/2 -translate-y-1/2 */
  RIGHT_CENTER: 'absolute right-3 top-1/2 -translate-y-1/2',
  /** absolute top-4 right-16 */
  TOP_RIGHT_LG: 'absolute top-4 right-16',
} as const;

export type TopClasses = typeof TOP_CLASSES;
export type RightClasses = typeof RIGHT_CLASSES;
export type BottomClasses = typeof BOTTOM_CLASSES;
export type LeftClasses = typeof LEFT_CLASSES;
export type CoordinatePositionPatterns = typeof COORDINATE_POSITION_PATTERNS;
