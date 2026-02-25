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
} as const;

export type AnimationConfig = typeof ANIMATION_CONFIG;
