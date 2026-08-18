/**
 * Cloudflare cache control utilities
 *
 * @see https://developers.cloudflare.com/cache/about/cache-control/
 */

import { CF_CACHE_TTL } from '../config/cloudflare-config';
import type { CacheControlOptions } from './types';

/**
 * Cloudflare cache TTL presets
 * @see https://developers.cloudflare.com/cache/about/cache-control/
 * @see ./config/cloudflare-config.ts
 */
export { CF_CACHE_TTL } from '../config/cloudflare-config';

/**
 * Create Cache-Control header value from options
 */
export function createCacheControlHeaders(
  options: CacheControlOptions
): string {
  const directives: string[] = [];

  if (options.noStore) {
    directives.push('no-store');
    return directives.join(', ');
  }

  if (options.public) {
    directives.push('public');
  } else if (options.private) {
    directives.push('private');
  }

  if (options.noCache) {
    directives.push('no-cache');
  }

  if (options.maxAge !== undefined) {
    directives.push(`max-age=${options.maxAge}`);
  }

  if (options.sMaxAge !== undefined) {
    directives.push(`s-maxage=${options.sMaxAge}`);
  }

  if (options.staleWhileRevalidate !== undefined) {
    directives.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
  }

  if (options.staleIfError !== undefined) {
    directives.push(`stale-if-error=${options.staleIfError}`);
  }

  if (options.immutable) {
    directives.push('immutable');
  }

  if (directives.length === 0) {
    directives.push('no-store');
  }

  return directives.join(', ');
}

/**
 * Generate a cache key for a URL with optional variants
 */
export function getCacheKey(
  url: string,
  variants?: Record<string, string>
): string {
  try {
    const urlObj = new URL(url);
    const baseKey = `cache:${urlObj.hostname}${urlObj.pathname}`;

    if (!variants || Object.keys(variants).length === 0) {
      return baseKey;
    }

    const variantParts = Object.entries(variants)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join(':');

    return `${baseKey}:${variantParts}`;
  } catch {
    return `cache:${url}`;
  }
}
