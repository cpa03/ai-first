/**
 * Platform Environment Variables Configuration
 * Centralizes all platform detection environment variable names.
 * Used for consistent platform detection across the codebase.
 *
 * Addresses Issue #682: Platform detection missing from environment constants
 *
 * @see src/lib/cloudflare.ts for usage in platform detection
 * @see src/lib/rate-limit.ts for usage in client identification
 * @see src/lib/config/app.ts for environment variable documentation
 */
export const PLATFORM_ENV_VARS = {
  /**
   * Cloudflare Workers and Pages environment variables
   * These are set automatically by Cloudflare runtime
   * @see https://developers.cloudflare.com/workers/runtime-apis/
   * @see https://developers.cloudflare.com/pages/platform/build-configuration/
   */
  CLOUDFLARE: {
    /** Set automatically by Cloudflare Workers runtime */
    CF_WORKER: 'CF_WORKER',
    /** Alternative indicator for Cloudflare environment */
    CLOUDFLARE: 'CLOUDFLARE',
    /** Set by Cloudflare Workers for the request context */
    CLOUDFLARE_WORKERS: 'CLOUDFLARE_WORKERS',
    /** Set when running in Cloudflare Pages environment */
    CF_PAGES: 'CF_PAGES',
    /** Cloudflare Pages branch name */
    CF_PAGES_BRANCH: 'CF_PAGES_BRANCH',
    /** Cloudflare Pages commit SHA */
    CF_PAGES_COMMIT_SHA: 'CF_PAGES_COMMIT_SHA',
    /** Cloudflare Pages deployment URL */
    CF_PAGES_URL: 'CF_PAGES_URL',
    /** Cloudflare account ID */
    CF_ACCOUNT_ID: 'CF_ACCOUNT_ID',
    /** Cloudflare region hint */
    CF_REGION: 'CF_REGION',
  },

  /**
   * Vercel environment variables
   * These are set automatically by Vercel runtime
   * @see https://vercel.com/docs/projects/environment-variables/system-environment-variables
   */
  VERCEL: {
    /** Set by Vercel runtime */
    VERCEL: 'VERCEL',
    /** Vercel deployment URL */
    NEXT_PUBLIC_VERCEL_URL: 'NEXT_PUBLIC_VERCEL_URL',
    /** Vercel region */
    VERCEL_REGION: 'VERCEL_REGION',
  },
} as const;
