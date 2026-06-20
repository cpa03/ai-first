/**
 * Component Configuration
 * Centralizes hardcoded values for React components
 * Now supports environment variable overrides via EnvLoader for timing values
 */
import { EnvLoader } from './environment';

export const COMPONENT_CONFIG = {
  /**
   * AutoSaveIndicator component settings
   */
  AUTO_SAVE: {
    /** Env: COMPONENT_AUTOSAVE_DELAY_MS (default: 1000) */
    DELAY_MS: EnvLoader.number('COMPONENT_AUTOSAVE_DELAY_MS', 1000, 100, 10000),
    /** Env: COMPONENT_AUTOSAVE_HIDE_DELAY_MS (default: 3000) */
    HIDE_DELAY_MS: EnvLoader.number(
      'COMPONENT_AUTOSAVE_HIDE_DELAY_MS',
      3000,
      500,
      30000
    ),
    /** Env: COMPONENT_AUTOSAVE_DURATION_MS (default: 300) */
    SAVE_DURATION_MS: EnvLoader.number(
      'COMPONENT_AUTOSAVE_DURATION_MS',
      300,
      50,
      2000
    ),
    /** Env: COMPONENT_AUTOSAVE_PROGRESS_INTERVAL_MS (default: 50) */
    PROGRESS_INTERVAL_MS: EnvLoader.number(
      'COMPONENT_AUTOSAVE_PROGRESS_INTERVAL_MS',
      50,
      10,
      500
    ),
  } as const,

  LOADING: {
    /** Env: COMPONENT_LOADING_DEFAULT_TIMEOUT_MS (default: 30000) */
    DEFAULT_TIMEOUT_MS: EnvLoader.number(
      'COMPONENT_LOADING_DEFAULT_TIMEOUT_MS',
      30000,
      1000,
      120000
    ),
    DEFAULT_ARIA_LABEL: 'Loading...',
  } as const,

  INPUT: {
    /** Env: COMPONENT_INPUT_VALIDATION_DEBOUNCE_MS (default: 300) */
    VALIDATION_DEBOUNCE_MS: EnvLoader.number(
      'COMPONENT_INPUT_VALIDATION_DEBOUNCE_MS',
      300,
      50,
      2000
    ),
    /** Env: COMPONENT_INPUT_MIN_SEARCH_CHARS (default: 2) */
    MIN_SEARCH_CHARS: EnvLoader.number(
      'COMPONENT_INPUT_MIN_SEARCH_CHARS',
      2,
      1,
      10
    ),
  } as const,

  TOAST: {
    /** Env: COMPONENT_TOAST_SHORT_DURATION_MS (default: 3000) */
    SHORT_DURATION_MS: EnvLoader.number(
      'COMPONENT_TOAST_SHORT_DURATION_MS',
      3000,
      1000,
      10000
    ),
    /** Env: COMPONENT_TOAST_NORMAL_DURATION_MS (default: 5000) */
    NORMAL_DURATION_MS: EnvLoader.number(
      'COMPONENT_TOAST_NORMAL_DURATION_MS',
      5000,
      1000,
      30000
    ),
    /** Env: COMPONENT_TOAST_LONG_DURATION_MS (default: 8000) */
    LONG_DURATION_MS: EnvLoader.number(
      'COMPONENT_TOAST_LONG_DURATION_MS',
      8000,
      2000,
      60000
    ),
    /** Env: COMPONENT_TOAST_EXIT_DURATION_MS (default: 300) */
    EXIT_DURATION_MS: EnvLoader.number(
      'COMPONENT_TOAST_EXIT_DURATION_MS',
      300,
      50,
      2000
    ),
  } as const,

  BLUEPRINT: {
    /** Env: COMPONENT_BLUEPRINT_GENERATION_DELAY_MS (default: 2000) */
    GENERATION_DELAY_MS: EnvLoader.number(
      'COMPONENT_BLUEPRINT_GENERATION_DELAY_MS',
      2000,
      0,
      10000
    ),
  } as const,

  COPY_FEEDBACK: {
    /** Env: COMPONENT_COPY_FEEDBACK_DURATION_MS (default: 2000) */
    DURATION_MS: EnvLoader.number(
      'COMPONENT_COPY_FEEDBACK_DURATION_MS',
      2000,
      500,
      10000
    ),
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
      /** Env: COMPONENT_BUTTON_ANIMATION_DURATION_MS (default: 200) */
      DURATION_MS: EnvLoader.number(
        'COMPONENT_BUTTON_ANIMATION_DURATION_MS',
        200,
        50,
        1000
      ),
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
    /** Env: COMPONENT_SPINNER_ANIMATION_MS (default: 750) */
    ANIMATION_MS: EnvLoader.number(
      'COMPONENT_SPINNER_ANIMATION_MS',
      750,
      100,
      3000
    ),
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

  IDEA_READY_INDICATOR: {
    /** Delay before showing checkmark animation (ms) - Env: COMPONENT_IDEA_READY_DELAY_MS (default: 150) */
    DELAY_MS: EnvLoader.number('COMPONENT_IDEA_READY_DELAY_MS', 150, 50, 1000),
  } as const,

  INPUT_VALIDATION: {
    /** Duration for success flash animation (ms) - Env: COMPONENT_INPUT_SUCCESS_FLASH_MS (default: 1500) */
    SUCCESS_FLASH_DURATION_MS: EnvLoader.number(
      'COMPONENT_INPUT_SUCCESS_FLASH_MS',
      1500,
      200,
      5000
    ),
  } as const,

  ONBOARDING: {
    /** Env: COMPONENT_ONBOARDING_DELAY_MS (default: 1500) */
    DELAY_MS: EnvLoader.number(
      'COMPONENT_ONBOARDING_DELAY_MS',
      1500,
      500,
      10000
    ),
    STEP_TRANSITION_MS: EnvLoader.number(
      'COMPONENT_ONBOARDING_STEP_TRANSITION_MS',
      200,
      50,
      1000
    ),
    TOOLTIP: {
      /** Tooltip width in pixels - Env: COMPONENT_ONBOARDING_TOOLTIP_WIDTH (default: 300) */
      WIDTH: EnvLoader.number(
        'COMPONENT_ONBOARDING_TOOLTIP_WIDTH',
        300,
        200,
        600
      ),
      /** Tooltip height in pixels - Env: COMPONENT_ONBOARDING_TOOLTIP_HEIGHT (default: 150) */
      HEIGHT: EnvLoader.number(
        'COMPONENT_ONBOARDING_TOOLTIP_HEIGHT',
        150,
        80,
        400
      ),
      /** Gap between tooltip and target element (px) - Env: COMPONENT_ONBOARDING_TOOLTIP_GAP (default: 12) */
      GAP: EnvLoader.number('COMPONENT_ONBOARDING_TOOLTIP_GAP', 12, 4, 40),
      /** Viewport padding (px) - Env: COMPONENT_ONBOARDING_TOOLTIP_VIEWPORT_PADDING (default: 10) */
      VIEWPORT_PADDING: EnvLoader.number(
        'COMPONENT_ONBOARDING_TOOLTIP_VIEWPORT_PADDING',
        10,
        0,
        50
      ),
    },
  },

  ALERT: {
    /** Auto-dismiss delay for success alerts (ms) - Env: COMPONENT_ALERT_SUCCESS_DISMISS_MS (default: 5000) */
    SUCCESS_DISMISS_MS: EnvLoader.number(
      'COMPONENT_ALERT_SUCCESS_DISMISS_MS',
      5000,
      1000,
      30000
    ),
    /** Auto-dismiss delay for info alerts (ms) - Env: COMPONENT_ALERT_INFO_DISMISS_MS (default: 3000) */
    INFO_DISMISS_MS: EnvLoader.number(
      'COMPONENT_ALERT_INFO_DISMISS_MS',
      3000,
      1000,
      30000
    ),
    /** Default fallback dismiss delay (ms) - Env: COMPONENT_ALERT_DEFAULT_DISMISS_MS (default: 5000) */
    DEFAULT_DISMISS_MS: EnvLoader.number(
      'COMPONENT_ALERT_DEFAULT_DISMISS_MS',
      5000,
      1000,
      30000
    ),
    /** Progress bar update interval (ms) - Env: COMPONENT_ALERT_PROGRESS_INTERVAL_MS (default: 50) */
    PROGRESS_INTERVAL_MS: EnvLoader.number(
      'COMPONENT_ALERT_PROGRESS_INTERVAL_MS',
      50,
      10,
      200
    ),
  },
} as const;

export type ComponentConfig = typeof COMPONENT_CONFIG;
