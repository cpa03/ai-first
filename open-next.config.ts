/**
 * OpenNext Cloudflare Configuration
 *
 * This configuration file sets up the OpenNext adapter for Cloudflare Workers.
 * OpenNext is the recommended approach for deploying Next.js to Cloudflare,
 * replacing the deprecated @cloudflare/next-on-pages package.
 *
 * @see https://opennext.js.org/cloudflare
 * @see https://developers.cloudflare.com/workers/
 */

import { defineCloudflareConfig } from '@opennextjs/cloudflare';

export default defineCloudflareConfig({
  /**
   * Cloudflare KV Namespace Configuration
   *
   * KV provides edge caching for improved performance. Used for:
   * - Session data storage
   * - API response caching
   * - Feature flags
   *
   * To enable:
   * 1. Create KV namespace in Cloudflare dashboard: wrangler kv:namespace create "CACHE_KV"
   * 2. Add the ID to wrangler.toml: kv_namespaces = [{ binding = "CACHE_KV", id = "your-id" }]
   * 3. Uncomment the line below
   */
  // kvNamespaces: ['CACHE_KV'],

  /**
   * R2 Bucket Configuration
   *
   * R2 provides object storage for static assets and file uploads.
   * Optional: Enable for ISR (Incremental Static Regeneration) support
   * or large file uploads.
   *
   * @see https://developers.cloudflare.com/r2/
   */
  // r2Buckets: ['ASSETS'],

  /**
   * D1 Database Configuration
   *
   * D1 is Cloudflare's serverless SQL database. Useful for:
   * - Edge-optimized data storage
   * - Session management at the edge
   *
   * @see https://developers.cloudflare.com/d1/
   */
  // d1Databases: ['DB'],

  /**
   * Queue Configuration
   *
   * Cloudflare Queues enable background job processing.
   * Useful for: email sending, data processing, webhook handling.
   *
   * @see https://developers.cloudflare.com/queues/
   */
  // queue: {
  //   binding: 'QUEUE',
  // },
});
