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
} as const;

export type AnimationConfig = typeof ANIMATION_CONFIG;
