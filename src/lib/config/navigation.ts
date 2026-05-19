/**
 * Navigation Configuration
 * Centralizes navigation items and labels for all nav components
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
 * Footer navigation configuration
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
        { href: '/docs', label: 'Documentation' },
        { href: '/blog', label: 'Blog' },
      ],
    },
    {
      title: 'Company',
      items: [
        { href: '/about', label: 'About' },
        { href: '/contact', label: 'Contact' },
      ],
    },
  ],

  SOCIAL_LINKS: [
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
  ],
} as const;

export type MainNavConfig = typeof MAIN_NAV_CONFIG;
export type MobileNavConfig = typeof MOBILE_NAV_CONFIG;
export type FooterNavConfig = typeof FOOTER_NAV_CONFIG;
