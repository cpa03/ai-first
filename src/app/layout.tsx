import '../styles/globals.css';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import ErrorBoundary from '@/components/ErrorBoundary';
import GlobalErrorHandler from '@/components/GlobalErrorHandler';
import MobileNav from '@/components/MobileNav';
import ToastContainer from '@/components/ToastContainer';
import ScrollToTop from '@/components/ScrollToTop';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import ScrollShadow from '@/components/ScrollShadow';
import Link from 'next/link';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { SEO_CONFIG } from '@/lib/config/seo';
import { APP_CONFIG } from '@/lib/config/app';
import { PRECONNECT_URLS } from '@/lib/config/external-api-domains';
import {
  BRAND_COLORS,
  SVG_STROKE_WIDTHS,
  SVG_VIEWBOX,
  Z_INDEX_LAYERS,
  BG_COLOR_CLASSES,
  BORDER_COLOR_CLASSES,
  SHADOW_CLASSES,
  LAYOUT_CLASSES,
  PRIMARY_FOCUS_RING,
} from '@/lib/config/theme';
import { GAP_CLASSES, MT_CLASSES } from '@/lib/config/spacing';
import { ICON_SIZES } from '@/lib/config/icon-sizes';
import { GRAY_CLASSES, ELEMENT_PATTERNS } from '@/lib/config/remaining-styles';
import { FOOTER_NAV_CONFIG } from '@/lib/config/navigation';
import { DASHBOARD_PAGE_CONTENT } from '@/lib/config/pages';
import { PAGE_LAYOUT_CLASSES } from '@/lib/config/page-layout';
import { ROUTES } from '@/lib/config/routes';
import { PAGE_ELEMENT_IDS } from '@/lib/config/element-ids';
import { safeJsonLd } from '@/lib/security/json-ld';
import {
  KeyboardShortcutsProvider,
  KeyboardShortcutsButton,
} from '@/components/KeyboardShortcutsProvider';
import Tooltip from '@/components/Tooltip';
import FooterNav from '@/components/FooterNav';
import { FOOTER_PATTERNS } from '@/lib/config/remaining-styles';
import { REMAINING_PATTERNS } from '@/lib/config/remaining-hardcoded-patterns';

// JSON-LD Structured Data for SEO - Growth: Better search visibility
const jsonLd = {
  '@context': SEO_CONFIG.SCHEMA_ORG.CONTEXT,
  '@type': 'WebApplication',
  name: 'IdeaFlow',
  description: APP_CONFIG.DESCRIPTION,
  url: APP_CONFIG.URLS.BASE,
  applicationCategory: 'ProductivityApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: APP_CONFIG.CURRENCY.CODE,
    availability: SEO_CONFIG.SCHEMA_ORG.IN_STOCK,
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
        {/* Preconnect to external API domains for faster initial connections */}
        {PRECONNECT_URLS.map((url) => (
          <link key={url} rel="preconnect" href={url} />
        ))}
        {/* Preconnect to Google Fonts for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* JSON-LD structured data for SEO - sanitized via safeJsonLd() to prevent XSS */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
        />
      </head>
      <body
        className={`${LAYOUT_CLASSES.MIN_HEIGHT_SCREEN} ${BG_COLOR_CLASSES.PAGE} font-sans`}
      >
        <ErrorBoundary>
          <GlobalErrorHandler />
          <ScrollShadow />
          <KeyboardShortcutsProvider>
            <a href="#main-content" className="skip-link">
              <span className={`flex items-center ${GAP_CLASSES.MD}`}>
                <svg
                  className={ICON_SIZES.MD}
                  fill="none"
                  viewBox={SVG_VIEWBOX.STANDARD}
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
                <kbd
                  className={`hidden sm:inline-flex items-center ${ELEMENT_PATTERNS.KBD_DARK}`}
                >
                  Tab
                </kbd>
              </span>
            </a>
            <div className={REMAINING_PATTERNS.MAIN_CONTENT}>
              <ToastContainer />
              <header
                className={`${BG_COLOR_CLASSES.CARD} ${SHADOW_CLASSES.SMALL} ${BORDER_COLOR_CLASSES.TOP} sticky top-0 z-[${Z_INDEX_LAYERS.OVERLAY}]`}
              >
                <div className={PAGE_LAYOUT_CLASSES.CONTAINER_XL}>
                  <div className={REMAINING_PATTERNS.HEADER}>
                    <div className="flex items-center">
                      <Link
                        href={ROUTES.HOME}
                        className={`text-xl font-semibold ${GRAY_CLASSES.TEXT_900} hover:text-primary-600 transition-colors ${PRIMARY_FOCUS_RING} rounded-md px-2 py-1`}
                      >
                        IdeaFlow
                      </Link>
                    </div>
                    <div className={`flex items-center ${GAP_CLASSES.MD}`}>
                      <KeyboardShortcutsButton />
                      <MobileNav />
                    </div>
                  </div>
                </div>
              </header>
              <main
                id={PAGE_ELEMENT_IDS.MAIN_CONTENT}
                className={REMAINING_PATTERNS.SKIP_LINK_TARGET}
                role="main"
                tabIndex={-1}
              >
                {children}
              </main>
              <footer
                className={FOOTER_PATTERNS.CONTAINER}
                role="contentinfo"
                aria-label={DASHBOARD_PAGE_CONTENT.ARIA_LABELS.SITE_FOOTER}
              >
                <div className={PAGE_LAYOUT_CLASSES.CONTAINER_XL}>
                  <div
                    className={`grid grid-cols-2 md:grid-cols-4 ${GAP_CLASSES.XXXL}`}
                  >
                    {/* Brand column */}
                    <div className="col-span-2 md:col-span-1">
                      <Link
                        href={ROUTES.HOME}
                        className={`text-lg font-semibold ${GRAY_CLASSES.TEXT_900} hover:text-primary-600 transition-colors ${PRIMARY_FOCUS_RING} rounded-md`}
                      >
                        {APP_CONFIG.NAME}
                      </Link>
                      <p className={FOOTER_PATTERNS.BRAND_TEXT}>
                        {APP_CONFIG.TAGLINE}
                      </p>
                      {/* Social links */}
                      <div
                        className={`${MT_CLASSES.XL} flex items-center ${GAP_CLASSES.LG}`}
                      >
                        {FOOTER_NAV_CONFIG.SOCIAL_LINKS.map((link) => (
                          <Tooltip
                            key={link.href}
                            content={link.label}
                            position="top"
                          >
                            <a
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={FOOTER_PATTERNS.ICON_HOVER}
                              aria-label={link.ariaLabel}
                            >
                              {link.label === 'Twitter' ? (
                                <svg
                                  className={ICON_SIZES.LG}
                                  fill="currentColor"
                                  viewBox={SVG_VIEWBOX.STANDARD}
                                  aria-hidden="true"
                                >
                                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                              ) : (
                                <svg
                                  className={ICON_SIZES.LG}
                                  fill="currentColor"
                                  viewBox={SVG_VIEWBOX.STANDARD}
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
                          </Tooltip>
                        ))}
                      </div>
                    </div>

                    {/* Navigation columns - FooterNav highlights the current page */}
                    <FooterNav columns={FOOTER_NAV_CONFIG.COLUMNS} />
                  </div>

                  {/* Bottom bar */}
                  <div className={FOOTER_PATTERNS.BOTTOM_BORDER}>
                    <div
                      className={`flex flex-col sm:flex-row items-center justify-between ${GAP_CLASSES.MD}`}
                    >
                      <p className={FOOTER_PATTERNS.BOTTOM_TEXT}>
                        {APP_CONFIG.BRANDING.COPYRIGHT}
                      </p>
                      <ScrollToTopButton />
                    </div>
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
