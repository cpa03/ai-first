/**
 * Cloudflare Early Hints utilities
 *
 * @see https://developers.cloudflare.com/cache/about/early-hints/
 */

import { CLOUDFLARE_HEADERS } from './headers';
import type { EarlyHintsOptions } from './types';

/**
 * Determine the 'as' attribute for preload based on file extension
 */
function getResourceType(resource: string): string | null {
  const ext = resource.split('?')[0].split('.').pop()?.toLowerCase();
  const typeMap: Record<string, string> = {
    css: 'style',
    js: 'script',
    woff: 'font',
    woff2: 'font',
    ttf: 'font',
    otf: 'font',
    eot: 'font',
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    webp: 'image',
    svg: 'image',
    mp4: 'video',
    webm: 'video',
  };
  return ext ? typeMap[ext] || null : null;
}

/**
 * Create Early Hints headers for 103 response
 *
 * Early Hints allow browsers to start loading critical resources
 * before the main response arrives, improving page load performance.
 *
 * @example
 * ```ts
 * const hints = createEarlyHintsHeaders({
 *   preload: ['/styles.css', '/script.js'],
 *   preconnect: ['https://api.example.com']
 * });
 * // Returns: { 'link': '</styles.css>; rel=preload; as=style, </script.js>; rel=preload; as=script, <https://api.example.com>; rel=preconnect' }
 * ```
 */
export function createEarlyHintsHeaders(
  options: EarlyHintsOptions
): Record<string, string> {
  const links: string[] = [];

  if (options.preload) {
    for (const resource of options.preload) {
      const asType = getResourceType(resource);
      links.push(`<${resource}>; rel=preload${asType ? `; as=${asType}` : ''}`);
    }
  }

  if (options.preconnect) {
    for (const origin of options.preconnect) {
      links.push(`<${origin}>; rel=preconnect`);
    }
  }

  if (links.length === 0) {
    return {};
  }

  return {
    link: links.join(', '),
  };
}

/**
 * Check if Early Hints are supported and should be sent
 * Early Hints work best when Cloudflare can cache the Link header
 */
export function shouldSendEarlyHints(request: Request): boolean {
  const cfRay = request.headers.get(CLOUDFLARE_HEADERS.CF_RAY);
  const cacheStatus = request.headers.get(CLOUDFLARE_HEADERS.CF_CACHE_STATUS);

  // Only send Early Hints through Cloudflare with valid caching
  return !!cfRay && cacheStatus !== 'BYPASS';
}
