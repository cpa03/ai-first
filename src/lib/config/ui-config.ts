import { EnvLoader } from './environment';

/**
 * UI configuration
 */
export const UI_CONFIG = {
  /**
   * Character count warning threshold (0.0 - 1.0)
   * Shows warning color when character count reaches this percentage of max
   * Env: UI_CHAR_COUNT_WARNING_THRESHOLD (default: 80, converted to 0.8)
   */
  CHAR_COUNT_WARNING_THRESHOLD:
    EnvLoader.number('UI_CHAR_COUNT_WARNING_THRESHOLD', 80, 50, 95) / 100,

  /**
   * Blueprint generation simulated delay (in milliseconds)
   * Used to show loading state while "generating" blueprint
   * Env: UI_BLUEPRINT_GENERATION_DELAY (default: 2000)
   */
  BLUEPRINT_GENERATION_DELAY: EnvLoader.number(
    'UI_BLUEPRINT_GENERATION_DELAY',
    2000,
    0,
    10000
  ),

  /**
   * Toast notification duration (in milliseconds)
   * Env: UI_TOAST_DURATION (default: 3000)
   */
  TOAST_DURATION: EnvLoader.number('UI_TOAST_DURATION', 3000, 1000, 30000),

  /**
   * Tooltip show delay (in milliseconds)
   * Delay before showing tooltip on hover/focus
   * Env: UI_TOOLTIP_DELAY (default: 300)
   */
  TOOLTIP_DELAY: EnvLoader.number('UI_TOOLTIP_DELAY', 300, 50, 2000),

  /**
   * Tooltip touch press duration (in milliseconds)
   * Minimum long-press duration on touch devices to show tooltip
   * Env: UI_TOOLTIP_TOUCH_PRESS_MS (default: 500)
   */
  TOOLTIP_TOUCH_PRESS_MS: EnvLoader.number(
    'UI_TOOLTIP_TOUCH_PRESS_MS',
    500,
    100,
    2000
  ),

  /**
   * Tooltip hide delay after touch release (in milliseconds)
   * How long tooltip stays visible after touch release on mobile
   * Env: UI_TOOLTIP_HIDE_DELAY_MS (default: 1000)
   */
  TOOLTIP_HIDE_DELAY_MS: EnvLoader.number(
    'UI_TOOLTIP_HIDE_DELAY_MS',
    1000,
    200,
    5000
  ),

  /**
   * Copy feedback duration (in milliseconds)
   * How long to show "Copied!" feedback
   * Env: UI_COPY_FEEDBACK_DURATION (default: 2000)
   */
  COPY_FEEDBACK_DURATION: EnvLoader.number(
    'UI_COPY_FEEDBACK_DURATION',
    2000,
    500,
    10000
  ),

  /**
   * Toast progress update interval (in milliseconds)
   * How often to update the progress bar for smooth animation
   * Env: UI_TOAST_PROGRESS_INTERVAL (default: 50)
   */
  TOAST_PROGRESS_INTERVAL: EnvLoader.number(
    'UI_TOAST_PROGRESS_INTERVAL',
    50,
    10,
    500
  ),

  /**
   * Toast progress bar transition duration (in milliseconds)
   * Controls the smoothness of progress bar animation
   * Env: UI_TOAST_PROGRESS_TRANSITION_MS (default: 75)
   */
  TOAST_PROGRESS_TRANSITION_MS: EnvLoader.number(
    'UI_TOAST_PROGRESS_TRANSITION_MS',
    75,
    10,
    200
  ),

  /**
   * Toast swipe dismiss threshold (in pixels)
   * Minimum swipe distance required to dismiss a toast notification
   * Env: UI_TOAST_SWIPE_DISMISS_THRESHOLD (default: 80)
   */
  TOAST_SWIPE_DISMISS_THRESHOLD: EnvLoader.number(
    'UI_TOAST_SWIPE_DISMISS_THRESHOLD',
    80,
    20,
    200
  ),
} as const;
