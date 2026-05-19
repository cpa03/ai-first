/**
 * Landing Page Configuration
 * Centralizes content for landing page components
 * Eliminates hardcoded strings from components
 */

import { EnvLoader } from './environment';

/**
 * Default feature descriptions when not overridden by environment
 */
function getDefaultDescription(index: number): string {
  const descriptions = [
    'Share your concept in natural language - no technical knowledge required',
    'Our AI clarifies requirements and breaks down complex projects into manageable tasks',
    'Receive detailed blueprints, timelines, and prioritized task lists ready for execution',
  ];
  return descriptions[index] || '';
}

const DEFAULT_FEATURES = [
  {
    step: 1,
    title: 'Input Your Idea',
    description:
      'Share your concept in natural language - no technical knowledge required',
  },
  {
    step: 2,
    title: 'AI Analysis',
    description:
      'Our AI clarifies requirements and breaks down complex projects into manageable tasks',
  },
  {
    step: 3,
    title: 'Action Plan',
    description:
      'Receive detailed blueprints, timelines, and prioritized task lists ready for execution',
  },
] as const;

const DEFAULT_BENEFITS = [
  'AI-Powered Planning',
  'Task Breakdown',
  'Export to Your Favorite Tools',
  'Project Timeline Generation',
  'Priority Matrix',
];

/**
 * Feature section configuration
 * Used by FeatureGrid component
 */
export const FEATURE_CONFIG = {
  FEATURES: (() => {
    const envFeatures = EnvLoader.string('LANDING_PAGE_FEATURES', '');
    if (envFeatures) {
      const titles = envFeatures.split(',').map((s) => s.trim());
      return titles.map((title, index) => ({
        step: index + 1,
        title,
        description: getDefaultDescription(index),
      }));
    }
    return DEFAULT_FEATURES;
  })(),

  OBSERVER_THRESHOLD: EnvLoader.number(
    'LANDING_PAGE_FEATURE_THRESHOLD',
    0.2,
    0.1,
    1.0
  ),

  OBSERVER_ROOT_MARGIN: EnvLoader.string(
    'LANDING_PAGE_FEATURE_ROOT_MARGIN',
    '0px 0px -50px 0px'
  ),

  ANIMATION_DELAYS: {
    STEP_1: 'delay-100',
    STEP_2: 'delay-200',
    STEP_3: 'delay-300',
  } as const,
} as const;

/**
 * Hero section configuration
 * Used by hero/CTA components
 */
export const HERO_CONFIG = {
  HEADLINE: EnvLoader.string(
    'LANDING_PAGE_HERO_HEADLINE',
    'Turn Ideas into Action'
  ),

  SUBHEADLINE: EnvLoader.string(
    'LANDING_PAGE_HERO_SUBHEADLINE',
    'Transform your ideas into structured projects with AI-powered planning'
  ),

  CTA_TEXT: EnvLoader.string('LANDING_PAGE_HERO_CTA_TEXT', 'Get Started Free'),

  SECONDARY_CTA_TEXT: EnvLoader.string(
    'LANDING_PAGE_HERO_SECONDARY_CTA_TEXT',
    'See How It Works'
  ),
} as const;

/**
 * Why choose section configuration
 */
export const WHY_CHOOSE_CONFIG = {
  TITLE: EnvLoader.string('LANDING_PAGE_WHY_TITLE', 'Why Choose IdeaFlow?'),

  BENEFITS: (() => {
    const envBenefits = EnvLoader.string('LANDING_PAGE_WHY_BENEFITS', '');
    if (envBenefits) {
      return envBenefits.split(',').map((s) => s.trim());
    }
    return DEFAULT_BENEFITS;
  })(),
} as const;

export type FeatureConfig = typeof FEATURE_CONFIG;
export type HeroConfig = typeof HERO_CONFIG;
export type WhyChooseConfig = typeof WHY_CHOOSE_CONFIG;
