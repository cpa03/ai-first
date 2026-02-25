import { APP_CONFIG } from '@/lib/config';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'],
    },
    sitemap: `${APP_CONFIG.URLS.SITE}/sitemap.xml`,
  };
}
