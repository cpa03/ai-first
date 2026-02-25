/**
 * SEO Configuration
 * Centralizes metadata, OpenGraph, and SEO-related constants
 */

import { APP_CONFIG } from './app';

export const SEO_CONFIG = {
  METADATA: {
    title: {
      default: APP_CONFIG.META.TITLE,
      template: APP_CONFIG.META.TITLE_TEMPLATE,
    },
    description: APP_CONFIG.META.DEFAULT_DESCRIPTION,
    keywords: APP_CONFIG.META.KEYWORDS,
    authors: APP_CONFIG.META.AUTHORS,
    creator: APP_CONFIG.META.CREATOR,
    publisher: APP_CONFIG.META.PUBLISHER,
    category: APP_CONFIG.META.CATEGORY,

    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: APP_CONFIG.URLS.BASE,
      siteName: APP_CONFIG.NAME,
      title: APP_CONFIG.META.TITLE,
      description: APP_CONFIG.META.DEFAULT_DESCRIPTION,
      images: [
        {
          url: `${APP_CONFIG.URLS.BASE}${APP_CONFIG.BRANDING.OG_IMAGE_PATH}`,
          width: 1200,
          height: 630,
          alt: `${APP_CONFIG.NAME} - Preview`,
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: APP_CONFIG.META.TITLE,
      description: APP_CONFIG.META.DEFAULT_DESCRIPTION,
      images: [`${APP_CONFIG.URLS.BASE}${APP_CONFIG.BRANDING.OG_IMAGE_PATH}`],
      creator: APP_CONFIG.CONTACT.TWITTER_HANDLE,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },

    alternates: {
      canonical: APP_CONFIG.URLS.BASE,
    },
  },

  ICONS: {
    icon: APP_CONFIG.BRANDING.FAVICON_PATH,
    shortcut: APP_CONFIG.BRANDING.FAVICON_PATH,
    apple: '/apple-touch-icon.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/apple-touch-icon-precomposed.png',
    },
  },

  MANIFEST: '/manifest.json',
} as const;

export const FONT_CONFIG = {
  INTER: {
    FAMILY: 'Inter',
    WEIGHTS: ['400', '500', '600', '700'] as const,
    SUBSETS: ['latin'] as const,
    DISPLAY: 'swap' as const,
    VARIABLE: '--font-inter',
  },

  MONO: {
    FAMILY: 'JetBrains Mono',
    WEIGHTS: ['400', '500', '600'] as const,
    SUBSETS: ['latin'] as const,
    DISPLAY: 'swap' as const,
    VARIABLE: '--font-mono',
  },
} as const;

export type SeoConfig = typeof SEO_CONFIG;
export type FontConfig = typeof FONT_CONFIG;
