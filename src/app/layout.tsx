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
import { SEO_CONFIG, APP_CONFIG } from '@/lib/config';
import {
  KeyboardShortcutsProvider,
  KeyboardShortcutsButton,
} from '@/components/KeyboardShortcutsProvider';

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
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
                Skip to main content
                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 bg-primary-700 rounded text-xs font-sans">
                  Tab
                </kbd>
              </span>
            </a>
            <div className="min-h-screen flex flex-col">
              <ToastContainer />
              <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <main id="main-content" className="flex-1" role="main">
                {children}
              </main>
              <footer className="bg-white border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                  <p className="text-center text-sm text-gray-500">
                    © 2025 IdeaFlow. Turn ideas into action.
                  </p>
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
