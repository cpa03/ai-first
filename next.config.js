const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const { initOpenNextCloudflareForDev } = require('@opennextjs/cloudflare');
initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  // Suppress build-time logs that cause Lighthouse best-practices issues
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
    // Base security headers applied to all routes
    // Aligned with OWASP recommendations and Issue #1171 security hardening
    const securityHeaders = [
      // Prevent clickjacking attacks
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      // Prevent MIME type sniffing
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      // Control referrer information
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      // XSS Protection - explicitly disabled to follow modern security standards
      // Modern browsers rely on CSP; legacy auditors can introduce new vulnerabilities
      {
        key: 'X-XSS-Protection',
        value: '0',
      },
      // Restrict browser features
      {
        key: 'Permissions-Policy',
        value:
          'camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
      },
      // Cross-Origin-Resource-Policy - prevents cross-origin resource leaks
      // 'same-origin' is safest but 'same-site' may be needed for subdomain resources
      {
        key: 'Cross-Origin-Resource-Policy',
        value: 'same-origin',
      },
      // Cross-Origin-Opener-Policy - isolates browsing context, prevents cross-origin attacks
      // 'same-origin-allow-popups' allows popup windows while protecting the opener
      {
        key: 'Cross-Origin-Opener-Policy',
        value: 'same-origin-allow-popups',
      },
      // Content Security Policy - comprehensive protection against XSS
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          // Scripts: self + inline (needed for Next.js)
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          // Styles: self + inline (needed for Tailwind/CSS-in-JS)
          "style-src 'self' 'unsafe-inline'",
          // Images: self + data URIs + HTTPS sources
          "img-src 'self' data: https: blob:",
          // Fonts: self + data URIs
          "font-src 'self' data:",
          // Connect: self + API endpoints
          "connect-src 'self' https://*.supabase.co https://api.openai.com https://api.anthropic.com wss://*.supabase.co",
          // Frame: deny all framing
          "frame-src 'none'",
          // Object/embed: deny
          "object-src 'none'",
          // Worker sources: restrict web worker scripts (security hardening)
          "worker-src 'self'",
          // Manifest sources: restrict web app manifests (security hardening)
          "manifest-src 'self'",
          // Base URI: self only
          "base-uri 'self'",
          // Form action: self only
          "form-action 'self'",
          // Report URI: CSP violation reporting endpoint (Issue #891)
          'report-uri /api/csp-report',
          // Upgrade insecure requests in production
          process.env.NODE_ENV === 'production'
            ? 'upgrade-insecure-requests'
            : '',
        ]
          .filter(Boolean)
          .join('; '),
      },
    ];

    // Add HSTS only in production (requires HTTPS)
    // Values are configurable via environment variables (see SECURITY_CONFIG in constants.ts)
    if (process.env.NODE_ENV === 'production') {
      const hstsMaxAge = process.env.SECURITY_HSTS_MAX_AGE || '31536000';
      const hstsIncludeSubdomains =
        process.env.SECURITY_HSTS_INCLUDE_SUBDOMAINS !== 'false';
      const hstsPreload = process.env.SECURITY_HSTS_PRELOAD !== 'false';

      const hstsValue = [
        `max-age=${hstsMaxAge}`,
        hstsIncludeSubdomains ? 'includeSubDomains' : '',
        hstsPreload ? 'preload' : '',
      ]
        .filter(Boolean)
        .join('; ');

      securityHeaders.push({
        key: 'Strict-Transport-Security',
        value: hstsValue,
      });
    }

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
        headers: securityHeaders,
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
