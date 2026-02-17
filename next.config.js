const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: true,
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
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
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
