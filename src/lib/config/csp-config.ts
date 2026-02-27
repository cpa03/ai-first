/**
 * Content Security Policy (CSP) Configuration
 *
 * Centralizes CSP directives and permissions policy for the application.
 * Supports environment variable overrides for flexible deployment.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta}
 */

/**
 * Content Security Policy configuration
 *
 * Defines which resources can be loaded and from where.
 * Aligned with OWASP security recommendations.
 */
export const CSP_CONFIG = {
  /**
   * CSP directives for controlling resource loading
   */
  DIRECTIVES: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'nonce-placeholder'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'font-src': ["'self'", 'data:'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': [],
    'connect-src': [
      "'self'",
      'https://*.supabase.co',
      'https://api.openai.com',
      'https://api.anthropic.com',
    ],
    'worker-src': ["'self'"],
    'manifest-src': ["'self'"],
  } as const,

  /**
   * Permissions Policy directives
   *
   * Controls which browser features and APIs can be used
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy}
   */
  PERMISSIONS_POLICY: [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'browsing-topics=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
  ] as const,
} as const;

/**
 * Type for CSP_CONFIG
 */
export type CspConfig = typeof CSP_CONFIG;
