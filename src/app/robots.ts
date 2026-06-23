import { APP_CONFIG, SEO_CONFIG } from '@/lib/config';

export default function robots() {
  return {
    rules: {
      userAgent: SEO_CONFIG.ROBOTS.USER_AGENT,
      allow: SEO_CONFIG.ROBOTS.ALLOW,
      disallow: [...SEO_CONFIG.ROBOTS.DISALLOW],
    },
    sitemap: `${APP_CONFIG.URLS.SITE}/sitemap.xml`,
  };
}
