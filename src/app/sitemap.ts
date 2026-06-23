import { APP_CONFIG, SEO_CONFIG } from '@/lib/config';

export default function sitemap() {
  const baseUrl = APP_CONFIG.URLS.SITE;

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: SEO_CONFIG.SITEMAP.PAGES.HOME.CHANGE_FREQUENCY,
      priority: SEO_CONFIG.SITEMAP.PAGES.HOME.PRIORITY,
    },
    {
      url: `${baseUrl}/clarify`,
      lastModified: new Date(),
      changeFrequency: SEO_CONFIG.SITEMAP.PAGES.CLARIFY.CHANGE_FREQUENCY,
      priority: SEO_CONFIG.SITEMAP.PAGES.CLARIFY.PRIORITY,
    },
    {
      url: `${baseUrl}/results`,
      lastModified: new Date(),
      changeFrequency: SEO_CONFIG.SITEMAP.PAGES.RESULTS.CHANGE_FREQUENCY,
      priority: SEO_CONFIG.SITEMAP.PAGES.RESULTS.PRIORITY,
    },
  ];
}
