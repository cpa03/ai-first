import '../styles/globals.css';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import ErrorBoundary from '@/components/ErrorBoundary';
import GlobalErrorHandler from '@/components/GlobalErrorHandler';
import MobileNav from '@/components/MobileNav';
import ToastContainer from '@/components/ToastContainer';
import ScrollToTop from '@/components/ScrollToTop';
import Link from 'next/link';
import { Inter, JetBrains_Mono } from 'next/font/google';
import {
  SEO_CONFIG,
  APP_CONFIG,
  BRAND_COLORS,
  SVG_STROKE_WIDTHS,
  Z_INDEX_LAYERS,
  FOOTER_NAV_CONFIG,
  DASHBOARD_PAGE_CONTENT,
  PAGE_LAYOUT_CLASSES,
} from '@/lib/config';
import { safeJsonLd } from '@/lib/security/json-ld';
import {
  KeyboardShortcutsProvider,
  KeyboardShortcutsButton,
} from '@/components/KeyboardShortcutsProvider';

// JSON-LD Structured Data for SEO - Growth: Better search visibility
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'IdeaFlow',
  description: APP_CONFIG.DESCRIPTION,
  url: APP_CONFIG.URLS.BASE,
  applicationCategory: 'ProductivityApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
  creator: {
    '@type': 'Organization',
    name: 'IdeaFlow',
    url: APP_CONFIG.URLS.BASE,
  },
  featureList: [
    'AI-powered idea clarification',
    'Automatic task breakdown',
    'Project roadmap generation',
    'Export to popular tools',
  ],
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: SEO_CONFIG.METADATA.title.default,
  description: SEO_CONFIG.METADATA.description,
  keywords: [...SEO_CONFIG.METADATA.keywords],
  authors: [...SEO_CONFIG.METADATA.authors],
  creator: SEO_CONFIG.METADATA.creator,
  publisher: SEO_CONFIG.METADATA.publisher,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(APP_CONFIG.URLS.BASE),
  alternates: SEO_CONFIG.METADATA.alternates,
  openGraph: {
    title: SEO_CONFIG.METADATA.openGraph.title,
    description: SEO_CONFIG.METADATA.openGraph.description,
    url: SEO_CONFIG.METADATA.openGraph.url,
    siteName: SEO_CONFIG.METADATA.openGraph.siteName,
    images: [
      {
        url: SEO_CONFIG.METADATA.openGraph.images[0].url,
        width: SEO_CONFIG.METADATA.openGraph.images[0].width,
        height: SEO_CONFIG.METADATA.openGraph.images[0].height,
        alt: SEO_CONFIG.METADATA.openGraph.images[0].alt,
      },
    ],
    locale: SEO_CONFIG.METADATA.openGraph.locale,
    type: SEO_CONFIG.METADATA.openGraph.type,
  },
  twitter: {
    card: SEO_CONFIG.METADATA.twitter.card,
    title: SEO_CONFIG.METADATA.twitter.title,
    description: SEO_CONFIG.METADATA.twitter.description,
    images: [...SEO_CONFIG.METADATA.twitter.images],
  },
  robots: SEO_CONFIG.METADATA.robots,
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': APP_CONFIG.NAME,
    'msapplication-TileColor': BRAND_COLORS.PRIMARY,
    'theme-color': BRAND_COLORS.PRIMARY,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') || undefined;

  return (
    <html
      lang="en"
      nonce={nonce}
      suppressHydrationWarning
      className={`${inter.variable} ${jetBrainsMono.variable}`}
      data-scroll-behavior="smooth"
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-gray-50 font-sans">
        <ErrorBoundary>
          <GlobalErrorHandler />
          <KeyboardShortcutsProvider>
            <a href="#main-content" className="skip-link">
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
                Skip to main content
                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 bg-white/30 rounded text-xs font-sans">
                  Tab
                </kbd>
              </span>
            </a>
            <div className="min-h-screen flex flex-col">
              <ToastContainer />
              <header
                className={`bg-white shadow-sm border-b border-gray-200 sticky top-0 z-[${Z_INDEX_LAYERS.OVERLAY}]`}
              >
                <div className={PAGE_LAYOUT_CLASSES.CONTAINER_XL}>
                  <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                      <Link
                        href="/"
                        className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-md px-2 py-1"
                      >
                        IdeaFlow
                      </Link>
                    </div>
                    <div className="flex items-center gap-2">
                      <KeyboardShortcutsButton />
                      <MobileNav />
                    </div>
                  </div>
                </div>
              </header>
              <main
                id="main-content"
                className="flex-1 focus:outline-none"
                role="main"
                tabIndex={-1}
              >
                {children}
              </main>
              <footer
                className="bg-gray-50 border-t border-gray-200"
                role="contentinfo"
                aria-label={DASHBOARD_PAGE_CONTENT.ARIA_LABELS.SITE_FOOTER}
              >
                <div className={PAGE_LAYOUT_CLASSES.CONTAINER_XL}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Brand column */}
                    <div className="col-span-2 md:col-span-1">
                      <Link
                        href="/"
                        className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-md"
                      >
                        {APP_CONFIG.NAME}
                      </Link>
                      <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                        {APP_CONFIG.TAGLINE}
                      </p>
                      {/* Social links */}
                      <div className="mt-4 flex items-center gap-3">
                        {FOOTER_NAV_CONFIG.SOCIAL_LINKS.map((link) => (
                          <a
                            key={link.href}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-gray-900 hover:scale-110 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-md p-1.5 hover:bg-gray-100"
                            aria-label={link.ariaLabel}
                          >
                            {link.label === 'Twitter' ? (
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                              </svg>
                            ) : (
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 12.017C20 6.484 15.523 2 12 2z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Navigation columns */}
                    {FOOTER_NAV_CONFIG.COLUMNS.map((column) => (
                      <div key={column.title}>
                        <p className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                          {column.title}
                        </p>
                        <ul className="mt-4 space-y-3">
                          {column.items.map((item) => (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                className="text-sm text-gray-600 hover:text-primary-600 hover:translate-x-1 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-md inline-block"
                              >
                                {item.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Bottom bar */}
                  <div className="mt-10 pt-6 border-t border-gray-200">
                    <p className="text-center text-sm text-gray-500">
                      {APP_CONFIG.BRANDING.COPYRIGHT}
                    </p>
                  </div>
                </div>
              </footer>
              <ScrollToTop />
            </div>
          </KeyboardShortcutsProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
