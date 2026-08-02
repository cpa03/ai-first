/**
 * Component Spacing Configuration
 * Centralizes all hardcoded spacing values used in React components
 * Follows the "Flexy" principle: eliminate hardcoded values and make modular systems
 */

/**
 * Margin bottom classes
 * Replaces hardcoded mb-* classes throughout components
 */
export const MB_CLASSES = {
  /** mb-0 = 0px */
  NONE: 'mb-0',
  /** mb-1 = 4px */
  XS: 'mb-1',
  /** mb-2 = 8px */
  SM: 'mb-2',
  /** mb-3 = 12px */
  MD: 'mb-3',
  /** mb-4 = 16px */
  LG: 'mb-4',
  /** mb-6 = 24px */
  XL: 'mb-6',
  /** mb-8 = 32px */
  XXL: 'mb-8',
  /** mb-12 = 48px */
  XXXL: 'mb-12',
} as const;

/**
 * Margin top classes
 * Replaces hardcoded mt-* classes throughout components
 */
export const MT_CLASSES = {
  /** mt-0 = 0px */
  NONE: 'mt-0',
  /** mt-1 = 4px */
  XS: 'mt-1',
  /** mt-2 = 8px */
  SM: 'mt-2',
  /** mt-3 = 12px */
  MD: 'mt-3',
  /** mt-4 = 16px */
  LG: 'mt-4',
  /** mt-6 = 24px */
  XL: 'mt-6',
  /** mt-8 = 32px */
  XXL: 'mt-8',
  /** mt-12 = 48px */
  XXXL: 'mt-12',
} as const;

/**
 * Margin left classes
 * Replaces hardcoded ml-* classes throughout components
 */
export const ML_CLASSES = {
  /** ml-0 = 0px */
  NONE: 'ml-0',
  /** ml-1 = 4px */
  XS: 'ml-1',
  /** ml-2 = 8px */
  SM: 'ml-2',
  /** ml-3 = 12px */
  MD: 'ml-3',
  /** ml-4 = 16px */
  LG: 'ml-4',
  /** ml-6 = 24px */
  XL: 'ml-6',
} as const;

/**
 * Margin right classes
 * Replaces hardcoded mr-* classes throughout components
 */
export const MR_CLASSES = {
  /** mr-0 = 0px */
  NONE: 'mr-0',
  /** mr-1 = 4px */
  XS: 'mr-1',
  /** mr-2 = 8px */
  SM: 'mr-2',
  /** mr-3 = 12px */
  MD: 'mr-3',
  /** mr-4 = 16px */
  LG: 'mr-4',
  /** mr-6 = 24px */
  XL: 'mr-6',
} as const;

/**
 * Padding classes
 * Replaces hardcoded p-* classes throughout components
 */
export const P_CLASSES = {
  /** p-0 = 0px */
  NONE: 'p-0',
  /** p-1 = 4px */
  XS: 'p-1',
  /** p-2 = 8px */
  SM: 'p-2',
  /** p-3 = 12px */
  MD: 'p-3',
  /** p-4 = 16px */
  LG: 'p-4',
  /** p-6 = 24px */
  XL: 'p-6',
  /** p-8 = 32px */
  XXL: 'p-8',
} as const;

/**
 * Padding X (horizontal) classes
 * Replaces hardcoded px-* classes throughout components
 */
export const PX_CLASSES = {
  /** px-0 = 0px */
  NONE: 'px-0',
  /** px-1 = 4px */
  XS: 'px-1',
  /** px-2 = 8px */
  SM: 'px-2',
  /** px-3 = 12px */
  MD: 'px-3',
  /** px-4 = 16px */
  LG: 'px-4',
  /** px-6 = 24px */
  XL: 'px-6',
  /** px-8 = 32px */
  XXL: 'px-8',
} as const;

/**
 * Padding Y (vertical) classes
 * Replaces hardcoded py-* classes throughout components
 */
export const PY_CLASSES = {
  /** py-0 = 0px */
  NONE: 'py-0',
  /** py-1 = 4px */
  XS: 'py-1',
  /** py-2 = 8px */
  SM: 'py-2',
  /** py-3 = 12px */
  MD: 'py-3',
  /** py-4 = 16px */
  LG: 'py-4',
  /** py-6 = 24px */
  XL: 'py-6',
  /** py-8 = 32px */
  XXL: 'py-8',
} as const;

/**
 * Gap classes for flexbox and grid
 * Replaces hardcoded gap-* classes throughout components
 */
export const GAP_CLASSES = {
  /** gap-0 = 0px */
  NONE: 'gap-0',
  /** gap-0.5 = 2px */
  XS: 'gap-0.5',
  /** gap-1 = 4px */
  SM: 'gap-1',
  /** gap-1.5 = 6px */
  MD_SM: 'gap-1.5',
  /** gap-2 = 8px */
  MD: 'gap-2',
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
 * Space Y (vertical space between children) classes
 * Replaces hardcoded space-y-* classes throughout components
 */
export const SPACE_Y_CLASSES = {
  /** space-y-0 = 0px */
  NONE: 'space-y-0',
  /** space-y-1 = 4px */
  XS: 'space-y-1',
  /** space-y-2 = 8px */
  SM: 'space-y-2',
  /** space-y-3 = 12px */
  MD: 'space-y-3',
  /** space-y-4 = 16px */
  LG: 'space-y-4',
  /** space-y-6 = 24px */
  XL: 'space-y-6',
  /** space-y-8 = 32px */
  XXL: 'space-y-8',
} as const;

/**
 * Space X (horizontal space between children) classes
 * Replaces hardcoded space-x-* classes throughout components
 */
export const SPACE_X_CLASSES = {
  /** space-x-0 = 0px */
  NONE: 'space-x-0',
  /** space-x-1 = 4px */
  XS: 'space-x-1',
  /** space-x-2 = 8px */
  SM: 'space-x-2',
  /** space-x-3 = 12px */
  MD: 'space-x-3',
  /** space-x-4 = 16px */
  LG: 'space-x-4',
  /** space-x-6 = 24px */
  XL: 'space-x-6',
} as const;

export type MbClass = (typeof MB_CLASSES)[keyof typeof MB_CLASSES];
export type MtClass = (typeof MT_CLASSES)[keyof typeof MT_CLASSES];
export type MlClass = (typeof ML_CLASSES)[keyof typeof ML_CLASSES];
export type MrClass = (typeof MR_CLASSES)[keyof typeof MR_CLASSES];
export type PClass = (typeof P_CLASSES)[keyof typeof P_CLASSES];
export type PxClass = (typeof PX_CLASSES)[keyof typeof PX_CLASSES];
export type PyClass = (typeof PY_CLASSES)[keyof typeof PY_CLASSES];
export type GapClass = (typeof GAP_CLASSES)[keyof typeof GAP_CLASSES];
export type SpaceYClass =
  (typeof SPACE_Y_CLASSES)[keyof typeof SPACE_Y_CLASSES];
export type SpaceXClass =
  (typeof SPACE_X_CLASSES)[keyof typeof SPACE_X_CLASSES];
