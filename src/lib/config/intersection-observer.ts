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

export type IntersectionObserverConfig = typeof INTERSECTION_OBSERVER_CONFIG;
