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
 * Centralizes content for WhyChooseSection component
 * Eliminates hardcoded strings, styles, and SVG paths
 */
export const WHY_CHOOSE_CONFIG = {
  TITLE: EnvLoader.string(
    'LANDING_PAGE_WHY_TITLE',
    'Why Choose IdeaFlow for Project Planning?'
  ),

  SECTION_STYLES: {
    CONTAINER: 'mt-16 bg-gray-50 rounded-lg p-8',
    HEADING: 'text-2xl font-bold text-gray-900 mb-6 text-center',
    GRID: 'grid md:grid-cols-2 gap-6',
  },

  BENEFITS: (() => {
    const envBenefits = EnvLoader.string('LANDING_PAGE_WHY_BENEFITS', '');
    if (envBenefits) {
      return envBenefits.split(',').map((s) => s.trim());
    }
    return DEFAULT_BENEFITS;
  })(),

  ARTICLES: [
    {
      id: 'ai-powered',
      TITLE: 'AI-Powered Intelligence',
      DESCRIPTION:
        'Advanced AI algorithms analyze your ideas and generate comprehensive project plans',
      ICON_BG: 'bg-green-100',
      ICON_HOVER_BG: 'group-hover:bg-green-200',
      ICON_COLOR: 'text-green-700',
      SVG_PATH:
        'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z',
      HOVER_BORDER: 'hover:border-green-200',
      HOVER_BG: 'hover:bg-green-50/30',
    },
    {
      id: 'time-saving',
      TITLE: 'Time-Saving Automation',
      DESCRIPTION:
        'Reduce planning time by 80% with automated task breakdown and timeline generation',
      ICON_BG: 'bg-green-100',
      ICON_HOVER_BG: 'group-hover:bg-green-200',
      ICON_COLOR: 'text-green-700',
      SVG_PATH:
        'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z',
      HOVER_BORDER: 'hover:border-green-200',
      HOVER_BG: 'hover:bg-green-50/30',
    },
    {
      id: 'developer-friendly',
      TITLE: 'Developer-Friendly',
      DESCRIPTION:
        'Export plans to GitHub, Notion, and other tools your team already uses',
      ICON_BG: 'bg-green-100',
      ICON_HOVER_BG: 'group-hover:bg-green-200',
      ICON_COLOR: 'text-green-700',
      SVG_PATH:
        'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z',
      HOVER_BORDER: 'hover:border-green-200',
      HOVER_BG: 'hover:bg-green-50/30',
    },
    {
      id: 'collaborative',
      TITLE: 'Collaborative Planning',
      DESCRIPTION:
        'Share blueprints with your team and iterate on plans in real-time',
      ICON_BG: 'bg-green-100',
      ICON_HOVER_BG: 'group-hover:bg-green-200',
      ICON_COLOR: 'text-green-700',
      SVG_PATH:
        'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z',
      HOVER_BORDER: 'hover:border-green-200',
      HOVER_BG: 'hover:bg-green-50/30',
    },
  ],

  ARTICLE_STYLES: {
    CONTAINER:
      'flex items-start space-x-3 p-4 rounded-lg bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-out motion-reduce:transition-none',
    ICON_CONTAINER:
      'rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1 transition-all duration-200 group-hover:scale-110',
    ICON_SVG: 'w-4 h-4',
    TITLE:
      'font-semibold text-gray-900 mb-1 group-hover:text-green-800 transition-colors duration-200',
    DESCRIPTION: 'text-gray-700 text-sm',
  },
} as const;

export type FeatureConfig = typeof FEATURE_CONFIG;
export type HeroConfig = typeof HERO_CONFIG;
export type WhyChooseConfig = typeof WHY_CHOOSE_CONFIG;
