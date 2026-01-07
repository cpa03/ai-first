import '../styles/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IdeaFlow - AI-Powered Project Planning & Task Management Tool',
  description:
    'Transform raw ideas into actionable project plans with AI. Get automated task breakdown, timelines, and roadmaps. Free project planning tool for developers and teams.',
  keywords: [
    'AI project planning',
    'task management',
    'project roadmap',
    'idea to action',
    'automated planning',
    'project management tool',
    'AI task breakdown',
  ],
  authors: [{ name: 'IdeaFlow Team' }],
  creator: 'IdeaFlow',
  publisher: 'IdeaFlow',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://ideaflow.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'IdeaFlow - AI-Powered Project Planning & Task Management',
    description:
      'Transform raw ideas into actionable project plans with AI. Get automated task breakdown, timelines, and roadmaps.',
    url: 'https://ideaflow.ai',
    siteName: 'IdeaFlow',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'IdeaFlow - AI Project Planning Tool',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IdeaFlow - AI-Powered Project Planning',
    description:
      'Transform raw ideas into actionable project plans with AI. Get automated task breakdown, timelines, and roadmaps.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <div className="min-h-screen flex flex-col">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-semibold text-gray-900">
                    IdeaFlow
                  </h1>
                </div>
                <nav className="flex space-x-8">
                  <a
                    href="/"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Home
                  </a>
                  <a
                    href="/clarify"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Clarify
                  </a>
                  <a
                    href="/results"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Results
                  </a>
                </nav>
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <p className="text-center text-sm text-gray-500">
                © 2025 IdeaFlow. Turn ideas into action.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
