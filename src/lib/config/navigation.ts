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
 * Hamburger Menu Animation Configuration
 * Centralizes hardcoded pixel values for hamburger menu transforms
 * Eliminates hardcoded translate-y-[4px] and translate-y-[2px] in MobileNav
 */
export const HAMBURGER_MENU_CONFIG = {
  /** Translate offset for hamburger line transform (in Tailwind arbitrary value format) */
  TRANSLATE_OFFSET: {
    /** Large offset for main hamburger lines (open state) */
    LARGE: '4px',
    /** Small offset for close icon lines */
    SMALL: '2px',
  },
  /** Line dimensions for hamburger menu */
  LINE: {
    /** Width of hamburger line (Tailwind class) */
    WIDTH_CLASS: 'w-5',
    /** Height of hamburger line (Tailwind class) */
    HEIGHT_CLASS: 'h-0.5',
    /** Width of close icon line (Tailwind class) */
    CLOSE_WIDTH_CLASS: 'w-4',
  },
  /** Container dimensions for hamburger menu */
  CONTAINER: {
    /** Width class */
    WIDTH_CLASS: 'w-6',
    /** Height class */
    HEIGHT_CLASS: 'h-6',
  },
  /** Close button dimensions */
  CLOSE_BUTTON: {
    /** Width/height class */
    SIZE_CLASS: 'w-10 h-10',
    /** Icon container width/height class */
    ICON_SIZE_CLASS: 'w-5 h-5',
  },
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
