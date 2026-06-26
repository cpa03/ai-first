/**
 * Navigation Configuration
 * Centralizes navigation items and labels for all nav components
 * Supports environment variable overrides for social links
 */

import { EnvLoader } from './environment';

export interface NavItem {
  href: string;
  label: string;
  ariaLabel: string;
}

const DEFAULT_MAIN_NAV: NavItem[] = [
  { href: '/', label: 'Home', ariaLabel: 'Navigate to home page' },
  {
    href: '/dashboard',
    label: 'Dashboard',
    ariaLabel: 'Navigate to dashboard',
  },
  { href: '/clarify', label: 'Clarify', ariaLabel: 'Navigate to clarify page' },
  { href: '/results', label: 'Results', ariaLabel: 'Navigate to results page' },
];

/**
 * Main navigation items
 * Env: MAIN_NAV_ITEMS (JSON string of nav items)
 */
export const MAIN_NAV_CONFIG = {
  ITEMS: (() => {
    const envItems = EnvLoader.string('MAIN_NAV_ITEMS', '');
    if (envItems) {
      try {
        return JSON.parse(envItems) as NavItem[];
      } catch {
        return DEFAULT_MAIN_NAV;
      }
    }
    return DEFAULT_MAIN_NAV;
  })(),

  ARIA_LABEL: 'Main navigation',
} as const;

/**
 * Mobile navigation configuration
 */
export const MOBILE_NAV_CONFIG = {
  ...MAIN_NAV_CONFIG,

  CLOSE_ARIA_LABEL: 'Close navigation menu',
  TOGGLE_ARIA_LABEL: (isOpen: boolean) =>
    isOpen ? 'Close navigation menu' : 'Open navigation menu',
} as const;

/**
 * Default social links
 */
const DEFAULT_SOCIAL_LINKS: NavItem[] = [
  {
    href: 'https://twitter.com/ideaflowai',
    label: 'Twitter',
    ariaLabel: 'Follow us on Twitter',
  },
  {
    href: 'https://github.com/cpa03/ai-first',
    label: 'GitHub',
    ariaLabel: 'View on GitHub',
  },
];

/**
 * Footer navigation configuration
 * Social links are configurable via environment variables
 */
export const FOOTER_NAV_CONFIG = {
  COLUMNS: [
    {
      title: 'Product',
      items: [
        { href: '/', label: 'Home' },
        { href: '/clarify', label: 'Get Started' },
        { href: '/dashboard', label: 'Dashboard' },
      ],
    },
    {
      title: 'Resources',
      items: [
        {
          href: 'https://github.com/cpa03/ai-first',
          label: 'GitHub',
          ariaLabel: 'View source code on GitHub',
        },
      ],
    },
  ],

  /**
   * Social links for footer
   * Env: FOOTER_SOCIAL_LINKS (JSON string of nav items)
   */
  SOCIAL_LINKS: (() => {
    const envLinks = EnvLoader.string('FOOTER_SOCIAL_LINKS', '');
    if (envLinks) {
      try {
        return JSON.parse(envLinks) as NavItem[];
      } catch {
        return DEFAULT_SOCIAL_LINKS;
      }
    }
    return DEFAULT_SOCIAL_LINKS;
  })(),
} as const;

export type MainNavConfig = typeof MAIN_NAV_CONFIG;
export type MobileNavConfig = typeof MOBILE_NAV_CONFIG;
export type FooterNavConfig = typeof FOOTER_NAV_CONFIG;
