import { EnvLoader } from './environment';

/**
 * UI Text Sizes Configuration
 * Centralizes all hardcoded text sizes used across components
 * Eliminates arbitrary Tailwind values like text-[10px], text-[9px], etc.
 */

/**
 * Small Text Sizes
 * Used for badges, labels, and compact UI elements
 */
export const SMALL_TEXT_SIZES = {
  /**
   * Extra small text (10px) - for badges, keyboard shortcuts, compact labels
   * Env: UI_TEXT_SIZE_XS (default: 10)
   */
  XS: EnvLoader.number('UI_TEXT_SIZE_XS', 10, 8, 12),

  /**
   * Extra extra small text (9px) - for keyboard shortcut keys
   * Env: UI_TEXT_SIZE_XXS (default: 9)
   */
  XXS: EnvLoader.number('UI_TEXT_SIZE_XXS', 9, 7, 11),
} as const;

/**
 * Medium Text Sizes
 * Used for body text and standard content
 */
export const MEDIUM_TEXT_SIZES = {
  /**
   * Small text (12px) - for secondary labels
   * Env: UI_TEXT_SIZE_SM (default: 12)
   */
  SM: EnvLoader.number('UI_TEXT_SIZE_SM', 12, 10, 14),

  /**
   * Base text (14px) - for body content
   * Env: UI_TEXT_SIZE_BASE (default: 14)
   */
  BASE: EnvLoader.number('UI_TEXT_SIZE_BASE', 14, 12, 16),
} as const;

/**
 * Tailwind Text Size Classes
 * Returns Tailwind class strings with centralized values
 */
export const TEXT_SIZE_CLASSES = {
  /** Extra small text class (10px) */
  XS: `text-[${SMALL_TEXT_SIZES.XS}px]`,
  /** Extra extra small text class (9px) */
  XXS: `text-[${SMALL_TEXT_SIZES.XXS}px]`,
  /** Small text class (12px) */
  SM: `text-[${MEDIUM_TEXT_SIZES.SM}px]`,
  /** Base text class (14px) */
  BASE: `text-[${MEDIUM_TEXT_SIZES.BASE}px]`,
} as const;

/**
 * Text Size Presets for Common UI Patterns
 */
export const TEXT_SIZE_PRESETS = {
  /** Keyboard shortcut key badge */
  KBD: `text-[${SMALL_TEXT_SIZES.XXS}px]`,
  /** Badge/label text */
  BADGE: `text-[${SMALL_TEXT_SIZES.XS}px]`,
  /** Compact status text */
  STATUS: `text-[${SMALL_TEXT_SIZES.XS}px]`,
  /** Secondary description text */
  DESCRIPTION: `text-[${MEDIUM_TEXT_SIZES.SM}px]`,
} as const;

export type SmallTextSizes = typeof SMALL_TEXT_SIZES;
export type MediumTextSizes = typeof MEDIUM_TEXT_SIZES;
