/**
 * SEO Configuration
 * Centralizes metadata, OpenGraph, sitemap, robots, and SEO-related constants
 * Eliminates hardcoded values in sitemap.ts and robots.ts
 */

import { APP_CONFIG } from './app';
import { EnvLoader } from './env-loader';

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

  /**
   * Sitemap configuration
   * Centralizes page priorities and change frequencies for sitemap generation
   * Eliminates hardcoded values in sitemap.ts
   */
  SITEMAP: {
    PAGES: {
      HOME: {
        PRIORITY: EnvLoader.number('SITEMAP_HOME_PRIORITY', 1, 0, 1),
        CHANGE_FREQUENCY: EnvLoader.string('SITEMAP_HOME_CHANGE_FREQ', 'daily'),
      },
      CLARIFY: {
        PRIORITY: EnvLoader.number('SITEMAP_CLARIFY_PRIORITY', 0.8, 0, 1),
        CHANGE_FREQUENCY: EnvLoader.string(
          'SITEMAP_CLARIFY_CHANGE_FREQ',
          'weekly'
        ),
      },
      RESULTS: {
        PRIORITY: EnvLoader.number('SITEMAP_RESULTS_PRIORITY', 0.8, 0, 1),
        CHANGE_FREQUENCY: EnvLoader.string(
          'SITEMAP_RESULTS_CHANGE_FREQ',
          'weekly'
        ),
      },
    },
  } as const,

  /**
   * Robots.txt configuration
   * Centralizes allowed/disallowed paths for search engine crawlers
   * Eliminates hardcoded values in robots.ts
   */
  ROBOTS: {
    USER_AGENT: '*',
    ALLOW: EnvLoader.string('ROBOTS_ALLOW', '/'),
    DISALLOW: (() => {
      const envDisallow = EnvLoader.string('ROBOTS_DISALLOW', '');
      if (envDisallow) {
        return envDisallow.split(',').map((p) => p.trim());
      }
      return ['/api/', '/admin/'] as readonly string[];
    })(),
  } as const,

  /**
   * Schema.org URLs for structured data
   * Centralizes schema.org context and type URLs
   */
  SCHEMA_ORG: {
    CONTEXT: 'https://schema.org',
    IN_STOCK: 'https://schema.org/InStock',
    ARTICLE: 'https://schema.org/Article',
    BREADCRUMB_LIST: 'https://schema.org/BreadcrumbList',
    LIST_ITEM: 'https://schema.org/ListItem',
    WEB_APPLICATION: 'https://schema.org/WebApplication',
  } as const,

  /**
   * Structured Data Templates
   * Reusable templates for JSON-LD structured data
   */
  STRUCTURED_DATA: {
    /**
     * Article schema for results page - represents the generated blueprint/project plan
     */
    ARTICLE: (params: {
      headline: string;
      description: string;
      url: string;
      datePublished: string;
      dateModified: string;
      authorName: string;
      publisherName: string;
      publisherLogo: string;
      imageUrl: string;
    }) => ({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: params.headline,
      description: params.description,
      url: params.url,
      datePublished: params.datePublished,
      dateModified: params.dateModified,
      author: {
        '@type': 'Person',
        name: params.authorName,
      },
      publisher: {
        '@type': 'Organization',
        name: params.publisherName,
        logo: {
          '@type': 'ImageObject',
          url: params.publisherLogo,
        },
      },
      image: params.imageUrl,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': params.url,
      },
    }),

    /**
     * BreadcrumbList schema for clarify page - shows navigation hierarchy
     */
    BREADCRUMB_LIST: (items: Array<{ name: string; url: string; position: number }>) => ({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item) => ({
        '@type': 'ListItem',
        position: item.position,
        name: item.name,
        item: item.url,
      })),
    }),
  } as const,
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
