/**
 * Animation Configuration
 * Centralizes all animation timing values for UI components
 * Supports environment variable overrides for fine-tuning
 */

import { EnvLoader } from './environment';

export const ANIMATION_CONFIG = {
  /**
   * Fast animation duration (ms)
   * Env: UI_ANIMATION_FAST (default: 200)
   */
  FAST: EnvLoader.number('UI_ANIMATION_FAST', 200, 50, 1000),

  /**
   * Standard animation duration (ms)
   * Env: UI_ANIMATION_STANDARD (default: 300)
   */
  STANDARD: EnvLoader.number('UI_ANIMATION_STANDARD', 300, 50, 2000),

  /**
   * Slow animation duration (ms)
   * Env: UI_ANIMATION_SLOW (default: 500)
   */
  SLOW: EnvLoader.number('UI_ANIMATION_SLOW', 500, 100, 5000),

  /**
   * Toast exit animation duration (ms)
   * Env: UI_ANIMATION_TOAST_EXIT (default: 300)
   */
  TOAST_EXIT: EnvLoader.number('UI_ANIMATION_TOAST_EXIT', 300, 50, 2000),

  /**
   * Input focus delay (ms)
   * Env: UI_ANIMATION_INPUT_FOCUS_DELAY (default: 50)
   */
  INPUT_FOCUS_DELAY: EnvLoader.number(
    'UI_ANIMATION_INPUT_FOCUS_DELAY',
    50,
    10,
    500
  ),

  /**
   * Error reload delay (ms)
   * Env: UI_ANIMATION_ERROR_RELOAD_DELAY (default: 3000)
   */
  ERROR_RELOAD_DELAY: EnvLoader.number(
    'UI_ANIMATION_ERROR_RELOAD_DELAY',
    3000,
    1000,
    30000
  ),

  /**
   * Alert exit animation duration (ms)
   * Env: UI_ANIMATION_ALERT_EXIT (default: 200)
   */
  ALERT_EXIT: EnvLoader.number('UI_ANIMATION_ALERT_EXIT', 200, 50, 1000),

  /**
   * Step transition delay (ms)
   * Delay between step transitions in multi-step flows (clarification, onboarding)
   * Env: UI_ANIMATION_STEP_TRANSITION_DELAY (default: 300)
   */
  STEP_TRANSITION: EnvLoader.number(
    'UI_ANIMATION_STEP_TRANSITION_DELAY',
    300,
    50,
    2000
  ),

  /**
   * Component mounting animation delay (ms)
   * Delay before starting mount animations
   * Env: UI_ANIMATION_MOUNT_DELAY (default: 200)
   */
  MOUNT_DELAY: EnvLoader.number('UI_ANIMATION_MOUNT_DELAY', 200, 50, 1000),

  /**
   * Dashboard row stagger delay (ms)
   * Delay between each row's animation in dashboard
   * Env: UI_ANIMATION_DASHBOARD_STAGGER_DELAY (default: 50)
   */
  DASHBOARD_STAGGER_DELAY: EnvLoader.number(
    'UI_ANIMATION_DASHBOARD_STAGGER_DELAY',
    50,
    10,
    200
  ),

  /**
   * Dashboard row animation duration (ms)
   * Duration of each row's fade-in animation
   * Env: UI_ANIMATION_DASHBOARD_ROW_DURATION (default: 400)
   */
  DASHBOARD_ROW_DURATION: EnvLoader.number(
    'UI_ANIMATION_DASHBOARD_ROW_DURATION',
    400,
    100,
    2000
  ),

  /**
   * Number of dashboard rows to animate
   * Maximum number of stagger delay classes to generate
   * Env: UI_ANIMATION_DASHBOARD_ROW_COUNT (default: 10)
   */
  DASHBOARD_ROW_COUNT: EnvLoader.number(
    'UI_ANIMATION_DASHBOARD_ROW_COUNT',
    10,
    1,
    20
  ),

  /**
   * Dashboard keyboard hint delay (ms)
   * Delay before showing keyboard shortcut hint to user
   * Env: UI_ANIMATION_DASHBOARD_KEYBOARD_HINT_DELAY (default: 1500)
   */
  DASHBOARD_KEYBOARD_HINT_DELAY: EnvLoader.number(
    'UI_ANIMATION_DASHBOARD_KEYBOARD_HINT_DELAY',
    1500,
    500,
    5000
  ),

  /**
   * Onboarding celebration delay with reduced motion (ms)
   * Shorter delay for users who prefer reduced motion
   * Env: UI_ANIMATION_ONBOARDING_CELEBRATION_REDUCED (default: 1200)
   */
  ONBOARDING_CELEBRATION_REDUCED: EnvLoader.number(
    'UI_ANIMATION_ONBOARDING_CELEBRATION_REDUCED',
    1200,
    500,
    5000
  ),

  /**
   * Onboarding celebration delay without reduced motion (ms)
   * Standard delay for full animation experience
   * Env: UI_ANIMATION_ONBOARDING_CELEBRATION_STANDARD (default: 2000)
   */
  ONBOARDING_CELEBRATION_STANDARD: EnvLoader.number(
    'UI_ANIMATION_ONBOARDING_CELEBRATION_STANDARD',
    2000,
    500,
    5000
  ),

  /**
   * Typing Indicator Animation Values
   * Centralizes timing for the typing indicator component
   */
  TYPING_INDICATOR: {
    /** Delay in ms before the indicator disappears after typing stops */
    /** Env: UI_ANIMATION_TYPING_HIDE_DELAY (default: 300) */
    HIDE_DELAY: EnvLoader.number(
      'UI_ANIMATION_TYPING_HIDE_DELAY',
      300,
      50,
      2000
    ),
    /** Delay between each dot's animation (stagger) */
    /** Env: UI_ANIMATION_TYPING_DOT_STAGGER (default: 150) */
    DOT_STAGGER: EnvLoader.number(
      'UI_ANIMATION_TYPING_DOT_STAGGER',
      150,
      50,
      500
    ),
    /** Duration for the typing state transition */
    /** Env: UI_ANIMATION_TYPING_STATE_DURATION (default: 200) */
    STATE_DURATION: EnvLoader.number(
      'UI_ANIMATION_TYPING_STATE_DURATION',
      200,
      50,
      1000
    ),
  } as const,

  /**
   * Task Management Animation Values
   * Centralizes animation durations and delays for task management components
   */
  TASK_MANAGEMENT: {
    /** Duration for progress animation (ms) */
    PROGRESS_DURATION: EnvLoader.number(
      'UI_ANIMATION_TASK_PROGRESS_DURATION',
      800,
      100,
      2000
    ),
    /** Delay for progress animation (ms) */
    PROGRESS_DELAY: EnvLoader.number(
      'UI_ANIMATION_TASK_PROGRESS_DELAY',
      200,
      0,
      1000
    ),
    /** Duration for stats animation (ms) */
    STATS_DURATION: EnvLoader.number(
      'UI_ANIMATION_TASK_STATS_DURATION',
      600,
      100,
      2000
    ),
    /** Delay for completed tasks animation (ms) */
    COMPLETED_TASKS_DELAY: EnvLoader.number(
      'UI_ANIMATION_TASK_COMPLETED_DELAY',
      300,
      0,
      1000
    ),
    /** Delay for completed hours animation (ms) */
    COMPLETED_HOURS_DELAY: EnvLoader.number(
      'UI_ANIMATION_TASK_HOURS_DELAY',
      400,
      0,
      1000
    ),
  },

  /**
   * Progress Stepper Animation Values
   * Centralizes animation durations for the ProgressStepper component
   */
  PROGRESS_STEPPER: {
    /** Duration for progress bar animation (ms) */
    /** Env: UI_ANIMATION_STEPPER_PROGRESS_DURATION (default: 400) */
    PROGRESS_DURATION: EnvLoader.number(
      'UI_ANIMATION_STEPPER_PROGRESS_DURATION',
      400,
      100,
      1000
    ),
  },

  /**
   * Not Found Page Animation Values
   * Centralizes animation delays for the not-found page keyboard hints
   */
  NOT_FOUND_PAGE: {
    /** First keyboard hint animation delay (ms) */
    /** Env: UI_ANIMATION_NOT_FOUND_FIRST_HINT_DELAY (default: 500) */
    FIRST_HINT_DELAY: EnvLoader.number(
      'UI_ANIMATION_NOT_FOUND_FIRST_HINT_DELAY',
      500,
      100,
      2000
    ),
    /** Second keyboard hint animation delay (ms) */
    /** Env: UI_ANIMATION_NOT_FOUND_SECOND_HINT_DELAY (default: 1000) */
    SECOND_HINT_DELAY: EnvLoader.number(
      'UI_ANIMATION_NOT_FOUND_SECOND_HINT_DELAY',
      1000,
      200,
      3000
    ),
  },

  /**
   * Feature Grid Animation Values
   * Centralizes stagger timing for feature card entrance animations
   */
  FEATURE_GRID: {
    /** Base delay for first card (ms) */
    /** Env: UI_ANIMATION_FEATURE_GRID_BASE_DELAY (default: 300) */
    BASE_DELAY: EnvLoader.number(
      'UI_ANIMATION_FEATURE_GRID_BASE_DELAY',
      300,
      100,
      1000
    ),
    /** Stagger delay between cards (ms) */
    /** Env: UI_ANIMATION_FEATURE_GRID_STAGGER (default: 200) */
    STAGGER: EnvLoader.number(
      'UI_ANIMATION_FEATURE_GRID_STAGGER',
      200,
      50,
      500
    ),
  },

  /**
   * Mobile Navigation Animation Values
   * Centralizes animation timing for mobile navigation components
   */
  MOBILE_NAV: {
    /** Delay before showing keyboard shortcut hint (ms) */
    /** Env: UI_ANIMATION_MOBILE_NAV_HINT_DELAY (default: 200) */
    HINT_DELAY: EnvLoader.number(
      'UI_ANIMATION_MOBILE_NAV_HINT_DELAY',
      200,
      50,
      1000
    ),
  },

  /**
   * Progress Bar Animation Values
   * Centralizes animation timing for progress bars and indicators
   */
  PROGRESS: {
    /** Transition duration for progress bar updates (ms) */
    /** Env: UI_ANIMATION_PROGRESS_TRANSITION (default: 75) */
    TRANSITION: EnvLoader.number(
      'UI_ANIMATION_PROGRESS_TRANSITION',
      75,
      10,
      500
    ),
  },

  /**
   * SVG Checkmark Animation Values
   * Centralizes CSS transition values for SVG checkmark animations
   */
  CHECKMARK: {
    /** CSS transition for stroke-dashoffset animation */
    /** Env: UI_ANIMATION_CHECKMARK_STROKE (default: 'stroke-dashoffset 0.4s ease-out 0.1s') */
    STROKE_TRANSITION: EnvLoader.string(
      'UI_ANIMATION_CHECKMARK_STROKE',
      'stroke-dashoffset 0.4s ease-out 0.1s'
    ),
  },

  /**
   * Shadow Animation Values
   * Centralizes CSS shadow blur values for celebration animations
   */
  SHADOW_BLUR: {
    /** Drop shadow blur radius (px) */
    /** Env: UI_ANIMATION_SHADOW_DROP_BLUR (default: 6) */
    DROP: EnvLoader.number('UI_ANIMATION_SHADOW_DROP_BLUR', 6, 0, 20),
    /** Box shadow blur radius (px) */
    /** Env: UI_ANIMATION_SHADOW_BOX_BLUR (default: 8) */
    BOX: EnvLoader.number('UI_ANIMATION_SHADOW_BOX_BLUR', 8, 0, 20),
  },

  /**
   * Animation State Values
   * Centralizes hardcoded opacity, scale, translate, and rotate values
   * Eliminates magic numbers scattered across components
   */
  STATES: {
    /**
     * Opacity values for animation states
     */
    OPACITY: {
      HIDDEN: 'opacity-0',
      VERY_LOW: 'opacity-30',
      LOW: 'opacity-40',
      MEDIUM_LOW: 'opacity-50',
      MEDIUM: 'opacity-60',
      MEDIUM_HIGH: 'opacity-75',
      HIGH: 'opacity-80',
      VERY_HIGH: 'opacity-90',
      FULL: 'opacity-100',
    } as const,

    /**
     * Scale values for animation states
     */
    SCALE: {
      SMALL: 'scale-50',
      MEDIUM: 'scale-75',
      LARGE: 'scale-90',
      EXTRA_LARGE: 'scale-95',
      NORMAL: 'scale-100',
      UP_SMALL: 'scale-105',
      UP_MEDIUM: 'scale-110',
      UP_LARGE: 'scale-125',
      UP_EXTRA_LARGE: 'scale-150',
      UP_XXL: 'scale-175',
      ZERO: 'scale-0',
    } as const,

    /**
     * X-axis scale values
     */
    SCALE_X: {
      ZERO: 'scale-x-0',
      NORMAL: 'scale-x-100',
    } as const,

    /**
     * Translate values for animation states
     */
    TRANSLATE: {
      UP_XS: '-translate-y-0.5',
      UP_SM: '-translate-y-1',
      UP_MD: '-translate-y-2',
      UP_LG: '-translate-y-4',
      NONE: 'translate-y-0',
      DOWN_XS: 'translate-y-0.5',
      DOWN_SM: 'translate-y-1',
      DOWN_MD: 'translate-y-2',
      DOWN_LG: 'translate-y-4',
      LEFT_MD: '-translate-x-2',
      RIGHT_FULL: 'translate-x-full',
      X_NONE: 'translate-x-0',
    } as const,

    /**
     * Rotate values for animation states
     */
    ROTATE: {
      MINUS_90: '-rotate-90',
      MINUS_45: '-rotate-45',
      NONE: 'rotate-0',
      PLUS_45: 'rotate-45',
      PLUS_90: 'rotate-90',
      PLUS_180: 'rotate-180',
    } as const,

    /**
     * Predefined animation state combinations
     */
    COMBINATIONS: {
      HIDDEN: 'opacity-0',
      VISIBLE: 'opacity-100',
      FADE_IN: {
        FROM: 'opacity-0',
        TO: 'opacity-100',
      },
      SCALE_IN: {
        FROM: 'scale-95',
        TO: 'scale-100',
      },
      SCALE_OUT: {
        FROM: 'scale-100',
        TO: 'scale-95',
      },
      SLIDE_UP: {
        FROM: 'translate-y-4',
        TO: 'translate-y-0',
      },
      SLIDE_DOWN: {
        FROM: 'translate-y-0',
        TO: 'translate-y-4',
      },
      MODAL_ENTER: 'opacity-0 scale-95 translate-y-4',
      MODAL_EXIT: 'opacity-100 scale-100 translate-y-0',
      TOAST_ENTER: 'translate-x-full opacity-0',
      TOAST_EXIT: 'translate-x-0 opacity-100',
      CHECKMARK_HIDDEN: 'opacity-0 scale-75 -rotate-45',
      CHECKMARK_VISIBLE: 'opacity-100 scale-100 rotate-0',
      CHECKMARK_EXIT: 'opacity-0 scale-75 rotate-45',
    } as const,
  },
} as const;

export type AnimationConfig = typeof ANIMATION_CONFIG;
