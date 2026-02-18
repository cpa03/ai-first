const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const { initOpenNextCloudflareForDev } = require('@opennextjs/cloudflare');
initOpenNextCloudflareForDev();

/**
 * Security Headers Configuration
 * Values should match those in src/lib/config/constants.ts
 */
const SECURITY_HEADERS = {
  HSTS: {
    MAX_AGE: parseInt(process.env.SECURITY_HSTS_MAX_AGE || '31536000', 10),
    INCLUDE_SUBDOMAINS:
      process.env.SECURITY_HSTS_INCLUDE_SUBDOMAINS !== 'false',
    PRELOAD: process.env.SECURITY_HSTS_PRELOAD !== 'false',
  },
  CSP_DIRECTIVES: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", 'https://vercel.live'],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'font-src': ["'self'", 'data:'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': [],
    'connect-src': ["'self'", 'https://*.supabase.co', 'https://vercel.live'],
    'worker-src': ["'self'"],
    'manifest-src': ["'self'"],
  },
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
  ],
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: true,
  env: {
    SUPPRESS_BUILD_LOGS: 'true',
  },
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  async headers() {
    const { HSTS, CSP_DIRECTIVES, PERMISSIONS_POLICY } = SECURITY_HEADERS;

    const hstsParts = [`max-age=${HSTS.MAX_AGE}`];
    if (HSTS.INCLUDE_SUBDOMAINS) {
      hstsParts.push('includeSubDomains');
    }
    if (HSTS.PRELOAD) {
      hstsParts.push('preload');
    }
    const hstsValue = hstsParts.join('; ');

    const cspValue = Object.entries(CSP_DIRECTIVES)
      .map(([directive, values]) => {
        if (values.length === 0) {
          return directive;
        }
        return `${directive} ${values.join(' ')}`;
      })
      .join('; ');

    const permissionsPolicyValue = PERMISSIONS_POLICY.join(', ');

    return [
      {
        source: '/_next/static/chunks/:path*.map',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspValue,
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: hstsValue,
          },
          {
            key: 'Permissions-Policy',
            value: permissionsPolicyValue,
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ideaflow.ai',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js', 'googleapis', 'openai'],
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },
};

module.exports = withBundleAnalyzer(nextConfig);
