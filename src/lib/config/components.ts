/**
 * Component Configuration
 * Centralizes hardcoded values for React components
 */

export const COMPONENT_CONFIG = {
  /**
   * AutoSaveIndicator component settings
   */
  AUTO_SAVE: {
    /**
     * Default delay before triggering auto-save (milliseconds)
     */
    DELAY_MS: 1000,

    /**
     * Duration to show "Saved" indicator before hiding (milliseconds)
     */
    HIDE_DELAY_MS: 3000,

    /**
     * Simulated save operation duration (milliseconds)
     */
    SAVE_DURATION_MS: 300,

    /**
     * Progress update interval for animation (milliseconds)
     */
    PROGRESS_INTERVAL_MS: 50,
  } as const,

  /**
   * Loading spinner default timeout
   */
  LOADING: {
    /**
     * Default timeout for loading operations (milliseconds)
     */
    DEFAULT_TIMEOUT_MS: 30000,
  } as const,

  /**
   * Input validation display settings
   */
  INPUT: {
    /**
     * Debounce delay for input validation (milliseconds)
     */
    VALIDATION_DEBOUNCE_MS: 300,

    /**
     * Minimum search characters before triggering search
     */
    MIN_SEARCH_CHARS: 2,
  } as const,

  /**
   * Toast notification settings
   */
  TOAST: {
    /**
     * Short display duration (milliseconds)
     */
    SHORT_DURATION_MS: 3000,

    /**
     * Normal display duration (milliseconds)
     */
    NORMAL_DURATION_MS: 5000,

    /**
     * Long display duration for important messages (milliseconds)
     */
    LONG_DURATION_MS: 8000,

    /**
     * Exit animation duration (milliseconds)
     */
    EXIT_DURATION_MS: 300,
  } as const,

  /**
   * Blueprint generation simulation
   */
  BLUEPRINT: {
    /**
     * Simulated generation delay for UX feedback (milliseconds)
     */
    GENERATION_DELAY_MS: 2000,
  } as const,

  /**
   * Copy feedback duration
   */
  COPY_FEEDBACK: {
    /**
     * How long to show "Copied!" feedback (milliseconds)
     */
    DURATION_MS: 2000,
  } as const,
} as const;

export type ComponentConfig = typeof COMPONENT_CONFIG;
