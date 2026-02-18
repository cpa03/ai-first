/**
 * OpenNext Cloudflare Configuration
 *
 * This configuration file sets up the OpenNext adapter for Cloudflare Workers.
 * OpenNext is the recommended approach for deploying Next.js to Cloudflare,
 * replacing the deprecated @cloudflare/next-on-pages package.
 *
 * @see https://opennext.js.org/cloudflare
 */

import { defineCloudflareConfig } from '@opennextjs/cloudflare';

export default defineCloudflareConfig({
  // The default configuration provides sensible defaults for most use cases.
  // Uncomment and configure the options below as needed.
  // Optional: Enable R2 incremental cache for ISR (Incremental Static Regeneration) support
  // incrementalCache: r2IncrementalCache,
  // Optional: Configure the Cloudflare queue for background processing
  // queue: {
  //   binding: "QUEUE",
  // },
  // Optional: Enable additional Cloudflare features
  // cloudflare: {
  //   // Enable D1 database bindings
  //   d1Databases: ["DB"],
  //   // Enable KV namespace bindings
  //   kvNamespaces: ["CACHE"],
  //   // Enable R2 bucket bindings
  //   r2Buckets: ["ASSETS"],
  // },
});
