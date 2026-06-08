/**
 * Proxy/Middleware Configuration
 * Configuration values for Next.js proxy (middleware)
 * Addresses hardcoded values in proxy.ts
 */
import { EnvLoader } from './environment';

export const PROXY_CONFIG = {
  /**
   * CSP Report-To header max_age in seconds
   * Env: PROXY_CSP_REPORT_MAX_AGE (default: 10886400 = ~4 months)
   */
  CSP_REPORT_MAX_AGE: EnvLoader.number(
    'PROXY_CSP_REPORT_MAX_AGE',
    10886400,
    0,
    31536000
  ),

  /**
   * Vercel Live script URL for CSP allowlist
   * Env: PROXY_VERCEL_LIVE_URL (default: 'https://vercel.live')
   */
  VERCEL_LIVE_URL: EnvLoader.string(
    'PROXY_VERCEL_LIVE_URL',
    'https://vercel.live'
  ),

  /**
   * CSP Report endpoint path
   * Env: PROXY_CSP_REPORT_PATH (default: '/api/csp-report')
   */
  CSP_REPORT_PATH: EnvLoader.string('PROXY_CSP_REPORT_PATH', '/api/csp-report'),
} as const;

export type ProxyConfig = typeof PROXY_CONFIG;
