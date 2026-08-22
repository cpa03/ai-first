import { EnvLoader } from './environment';

export const INTERSECTION_OBSERVER_CONFIG = {
  SECTION_INDICATOR: {
    ROOT_MARGIN: EnvLoader.string(
      'SECTION_INDICATOR_ROOT_MARGIN',
      '-20% 0px -60% 0px'
    ),
    THRESHOLD: [0, 0.25, 0.5, 0.75, 1] as const,
  },
} as const;

/**
 * Section Indicator Animation Configuration
 * Centralizes CSS transform and transition values for the SectionIndicator component
 * Follows the "Flexy" principle: eliminate hardcoded CSS values
 */
export const SECTION_INDICATOR_ANIMATION = {
  /**
   * Offset when hidden - slides left by 8px
   * Env: SECTION_INDICATOR_HIDDEN_OFFSET_PX (default: -8)
   */
  HIDDEN_OFFSET_PX: EnvLoader.number(
    'SECTION_INDICATOR_HIDDEN_OFFSET_PX',
    -8,
    -20,
    0
  ),

  /**
   * Fast transition duration for reduced motion preference
   * Env: SECTION_INDICATOR_REDUCED_MOTION_DURATION (default: 0.15)
   */
  REDUCED_MOTION_DURATION: EnvLoader.number(
    'SECTION_INDICATOR_REDUCED_MOTION_DURATION',
    0.15,
    0.05,
    0.5
  ),

  /**
   * Normal transition duration
   * Env: SECTION_INDICATOR_NORMAL_DURATION (default: 0.3)
   */
  NORMAL_DURATION: EnvLoader.number(
    'SECTION_INDICATOR_NORMAL_DURATION',
    0.3,
    0.1,
    1.0
  ),
} as const;

export type IntersectionObserverConfig = typeof INTERSECTION_OBSERVER_CONFIG;
export type SectionIndicatorAnimation = typeof SECTION_INDICATOR_ANIMATION;
