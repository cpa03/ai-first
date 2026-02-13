/**
 * Component Configuration
 * Centralizes hardcoded values for React components
 */

export const COMPONENT_CONFIG = {
  /**
   * AutoSaveIndicator component settings
   */
  AUTO_SAVE: {
    DELAY_MS: 1000,
    HIDE_DELAY_MS: 3000,
    SAVE_DURATION_MS: 300,
    PROGRESS_INTERVAL_MS: 50,
  } as const,

  LOADING: {
    DEFAULT_TIMEOUT_MS: 30000,
    DEFAULT_ARIA_LABEL: 'Loading...',
  } as const,

  INPUT: {
    VALIDATION_DEBOUNCE_MS: 300,
    MIN_SEARCH_CHARS: 2,
  } as const,

  TOAST: {
    SHORT_DURATION_MS: 3000,
    NORMAL_DURATION_MS: 5000,
    LONG_DURATION_MS: 8000,
    EXIT_DURATION_MS: 300,
  } as const,

  BLUEPRINT: {
    GENERATION_DELAY_MS: 2000,
  } as const,

  COPY_FEEDBACK: {
    DURATION_MS: 2000,
  } as const,

  BUTTON: {
    VARIANTS: {
      PRIMARY: 'primary',
      SECONDARY: 'secondary',
      OUTLINE: 'outline',
      GHOST: 'ghost',
    } as const,
    SIZES: {
      SM: 'sm',
      MD: 'md',
      LG: 'lg',
    } as const,
    DEFAULT_VARIANT: 'primary' as const,
    DEFAULT_SIZE: 'md' as const,
    DIMENSIONS: {
      SM: { minHeight: 36, paddingX: 12, paddingY: 6 },
      MD: { minHeight: 44, paddingX: 16, paddingY: 8 },
      LG: { minHeight: 48, paddingX: 24, paddingY: 12 },
    },
    ANIMATION: {
      HOVER_SCALE: 1.02,
      ACTIVE_SCALE: 0.98,
      DURATION_MS: 200,
    },
  } as const,

  SPINNER: {
    SIZES: {
      SM: { width: 16, height: 16 },
      MD: { width: 32, height: 32 },
      LG: { width: 48, height: 48 },
    },
    DEFAULT_SIZE: 'md' as const,
    STROKE_WIDTH: 4,
    VIEWBOX_SIZE: 24,
  } as const,

  STEPPER: {
    STEP_SIZE: 40,
    DOT_SIZE: 12,
    LINE_HEIGHT: 2,
    COMPLETED_ICON_SIZE: 24,
  } as const,

  ARIA: {
    POLITE: 'polite' as const,
    ASSERTIVE: 'assertive' as const,
    STATUS: 'status' as const,
    NAVIGATION: 'navigation' as const,
  } as const,

  MOTION_REDUCE: {
    SCALE: 1,
  },
} as const;

export type ComponentConfig = typeof COMPONENT_CONFIG;
