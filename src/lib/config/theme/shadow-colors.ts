/**
 * Shadow Colors Configuration
 * Centralizes all shadow color values used throughout the application
 * Follows the "Flexy" principle: eliminate hardcoded values and make modular systems
 */

import { EnvLoader } from '../environment';

/**
 * Shadow color configurations for form state indicators
 * These colors are used for focus rings and state shadows
 */
export const SHADOW_STATE_COLORS = {
  /** Success state shadow color (green) */
  SUCCESS: {
    RGB: EnvLoader.string('SHADOW_COLOR_SUCCESS_RGB', '34,197,94'),
    ALPHA: EnvLoader.number('SHADOW_COLOR_SUCCESS_ALPHA', 0.2, 0.05, 0.5),
    get RGBA() {
      return `rgba(${this.RGB},${this.ALPHA})`;
    },
  },
  /** Primary/brand state shadow color (blue) */
  PRIMARY: {
    RGB: EnvLoader.string('SHADOW_COLOR_PRIMARY_RGB', '59,130,246'),
    ALPHA: EnvLoader.number('SHADOW_COLOR_PRIMARY_ALPHA', 0.2, 0.05, 0.5),
    get RGBA() {
      return `rgba(${this.RGB},${this.ALPHA})`;
    },
  },
  /** Error state shadow color (red) */
  ERROR: {
    RGB: EnvLoader.string('SHADOW_COLOR_ERROR_RGB', '239,68,68'),
    ALPHA: EnvLoader.number('SHADOW_COLOR_ERROR_ALPHA', 0.2, 0.05, 0.5),
    get RGBA() {
      return `rgba(${this.RGB},${this.ALPHA})`;
    },
  },
  /** Warning state shadow color (amber) */
  WARNING: {
    RGB: EnvLoader.string('SHADOW_COLOR_WARNING_RGB', '245,158,11'),
    ALPHA: EnvLoader.number('SHADOW_COLOR_WARNING_ALPHA', 0.2, 0.05, 0.5),
    get RGBA() {
      return `rgba(${this.RGB},${this.ALPHA})`;
    },
  },
} as const;

/**
 * Shadow color configurations for general-purpose shadows
 * Used in animations, cards, and other UI elements
 */
export const SHADOW_GENERAL_COLORS = {
  /** Black shadow color with various opacity levels */
  BLACK: {
    LIGHT: {
      RGB: EnvLoader.string('SHADOW_BLACK_LIGHT_RGB', '0,0,0'),
      ALPHA: EnvLoader.number('SHADOW_BLACK_LIGHT_ALPHA', 0.05, 0.01, 0.2),
      get RGBA() {
        return `rgba(${this.RGB},${this.ALPHA})`;
      },
      get RGB_SLASH() {
        return `rgb(${this.RGB} / ${this.ALPHA})`;
      },
    },
    NORMAL: {
      RGB: EnvLoader.string('SHADOW_BLACK_NORMAL_RGB', '0,0,0'),
      ALPHA: EnvLoader.number('SHADOW_BLACK_NORMAL_ALPHA', 0.1, 0.05, 0.3),
      get RGBA() {
        return `rgba(${this.RGB},${this.ALPHA})`;
      },
      get RGB_SLASH() {
        return `rgb(${this.RGB} / ${this.ALPHA})`;
      },
    },
    MEDIUM: {
      RGB: EnvLoader.string('SHADOW_BLACK_MEDIUM_RGB', '0,0,0'),
      ALPHA: EnvLoader.number('SHADOW_BLACK_MEDIUM_ALPHA', 0.25, 0.1, 0.5),
      get RGBA() {
        return `rgba(${this.RGB},${this.ALPHA})`;
      },
      get RGB_SLASH() {
        return `rgb(${this.RGB} / ${this.ALPHA})`;
      },
    },
    HEAVY: {
      RGB: EnvLoader.string('SHADOW_BLACK_HEAVY_RGB', '0,0,0'),
      ALPHA: EnvLoader.number('SHADOW_BLACK_HEAVY_ALPHA', 0.3, 0.1, 0.6),
      get RGBA() {
        return `rgba(${this.RGB},${this.ALPHA})`;
      },
      get RGB_SLASH() {
        return `rgb(${this.RGB} / ${this.ALPHA})`;
      },
    },
  },
  /** Brand/primary shadow color */
  BRAND: {
    RGB: EnvLoader.string('SHADOW_BRAND_RGB', '37,99,235'),
    ALPHA_LIGHT: EnvLoader.number('SHADOW_BRAND_ALPHA_LIGHT', 0.4, 0.1, 0.8),
    ALPHA_HEAVY: EnvLoader.string('SHADOW_BRAND_ALPHA_HEAVY', '0.5'),
    get LIGHT_RGBA() {
      return `rgba(${this.RGB},${this.ALPHA_LIGHT})`;
    },
    get HEAVY_RGBA() {
      return `rgba(${this.RGB},${this.ALPHA_HEAVY})`;
    },
  },
} as const;

/**
 * Pre-configured shadow color strings for common use cases
 * These provide ready-to-use rgba() strings for shadows
 */
export const SHADOW_COLOR_PRESETS = {
  /** State shadow colors for form inputs */
  STATE: {
    SUCCESS: SHADOW_STATE_COLORS.SUCCESS.RGBA,
    PRIMARY: SHADOW_STATE_COLORS.PRIMARY.RGBA,
    ERROR: SHADOW_STATE_COLORS.ERROR.RGBA,
    WARNING: SHADOW_STATE_COLORS.WARNING.RGBA,
  },
  /** General shadow colors */
  GENERAL: {
    LIGHT: SHADOW_GENERAL_COLORS.BLACK.LIGHT.RGBA,
    NORMAL: SHADOW_GENERAL_COLORS.BLACK.NORMAL.RGBA,
    MEDIUM: SHADOW_GENERAL_COLORS.BLACK.MEDIUM.RGBA,
    HEAVY: SHADOW_GENERAL_COLORS.BLACK.HEAVY.RGBA,
  },
  /** General shadow colors in rgb() slash syntax format */
  GENERAL_RGB: {
    LIGHT: SHADOW_GENERAL_COLORS.BLACK.LIGHT.RGB_SLASH,
    NORMAL: SHADOW_GENERAL_COLORS.BLACK.NORMAL.RGB_SLASH,
    MEDIUM: SHADOW_GENERAL_COLORS.BLACK.MEDIUM.RGB_SLASH,
    HEAVY: SHADOW_GENERAL_COLORS.BLACK.HEAVY.RGB_SLASH,
  },
  /** Brand shadow colors */
  BRAND: {
    LIGHT: SHADOW_GENERAL_COLORS.BRAND.LIGHT_RGBA,
    HEAVY: SHADOW_GENERAL_COLORS.BRAND.HEAVY_RGBA,
  },
} as const;

export type ShadowStateColors = typeof SHADOW_STATE_COLORS;
export type ShadowGeneralColors = typeof SHADOW_GENERAL_COLORS;
export type ShadowColorPresets = typeof SHADOW_COLOR_PRESETS;
