import { EnvLoader } from './environment';

/**
 * Security headers configuration
 * Now supports environment variable overrides
 * Aligned with OWASP recommendations and Issue #1171 security hardening
 */
export const SECURITY_CONFIG = {
  HSTS_MAX_AGE: EnvLoader.number(
    'SECURITY_HSTS_MAX_AGE',
    31536000,
    0,
    63072000
  ),
  HSTS_INCLUDE_SUBDOMAINS: EnvLoader.boolean(
    'SECURITY_HSTS_INCLUDE_SUBDOMAINS',
    true
  ),
  HSTS_PRELOAD: EnvLoader.boolean('SECURITY_HSTS_PRELOAD', true),
  CROSS_ORIGIN_RESOURCE_POLICY: EnvLoader.string(
    'SECURITY_CORP',
    'same-origin'
  ),
  CROSS_ORIGIN_OPENER_POLICY: EnvLoader.string(
    'SECURITY_COOP',
    'same-origin-allow-popups'
  ),
  X_FRAME_OPTIONS: EnvLoader.string('SECURITY_X_FRAME_OPTIONS', 'DENY'),
  X_CONTENT_TYPE_OPTIONS: EnvLoader.string(
    'SECURITY_X_CONTENT_TYPE_OPTIONS',
    'nosniff'
  ),
  X_XSS_PROTECTION: EnvLoader.string('SECURITY_X_XSS_PROTECTION', '0'),
  REFERRER_POLICY: EnvLoader.string(
    'SECURITY_REFERRER_POLICY',
    'strict-origin-when-cross-origin'
  ),
} as const;
