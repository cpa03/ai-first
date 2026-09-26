import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SEO_CONFIG } from '@/lib/config';
import dynamic from 'next/dynamic';
import HomePageInteractive from './HomePageInteractive';
import HomePageClientComponents from './HomePageClientComponents';

// Dynamic imports with SSR enabled for SEO - components render on server
const FeatureGrid = dynamic(() => import('@/components/FeatureGrid'), {
  loading: () => (
    <section
      aria-hidden="true"
      className="mt-16 grid md:grid-cols-3 gap-12"
      style={{ minHeight: '300px' }}
    >
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="text-center p-6 rounded-xl bg-white border border-gray-200 flex flex-col items-center justify-center"
        >
          <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse mx-auto mb-4" />
          <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse mx-auto mb-2" />
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse mx-auto" />
        </div>
      ))}
    </section>
  ),
  ssr: true,
});

const WhyChooseSection = dynamic(
  () => import('@/components/WhyChooseSection'),
  {
    loading: () => (
      <section
        aria-hidden="true"
        className="mt-16 bg-gray-50 rounded-lg p-8"
        style={{ minHeight: '400px' }}
      >
        <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse mx-auto mb-6" />
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 rounded-lg bg-white border border-gray-200"
            >
              <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse flex-shrink-0 mt-1" />
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    ),
  }
);

const ShareButton = dynamic(() => import('@/components/ShareButton'), {
  loading: () => <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />,
  ssr: true,
});

export const metadata: Metadata = {
  title: SEO_CONFIG.METADATA.title.default,
  description: SEO_CONFIG.METADATA.description,
  openGraph: {
    title: SEO_CONFIG.METADATA.openGraph.title,
    description: SEO_CONFIG.METADATA.openGraph.description,
    images: [...SEO_CONFIG.METADATA.openGraph.images] as const,
  },
};

export default function HomePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Hero Section - Server Rendered for optimal LCP */}
      <section aria-labelledby="hero-heading" className="text-center mb-16">
        <h1
          id="hero-heading"
          className="text-4xl font-bold text-gray-900 mb-4"
        >
          Turn Ideas into Action
        </h1>
        <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
          Transform your ideas into structured projects with AI-powered planning,
          task breakdown, and export to your favorite tools.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Suspense fallback={<div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />}>
            <ShareButton
              shareTitle="IdeaFlow - Turn Ideas into Action"
              shareText="Transform your ideas into structured projects with AI-powered planning."
              label="Share IdeaFlow"
              ariaLabel="Share IdeaFlow with others"
            />
          </Suspense>
        </div>
      </section>

      {/* Interactive Idea Input - Client Component for form handling */}
      <HomePageInteractive />

      {/* FeatureGrid - SSR enabled */}
      <Suspense
        fallback={
          <section
            aria-hidden="true"
            className="mt-16 grid md:grid-cols-3 gap-12"
            style={{ minHeight: '300px' }}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="text-center p-6 rounded-xl bg-white border border-gray-200 flex flex-col items-center justify-center"
              >
                <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse mx-auto mb-4" />
                <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse mx-auto mb-2" />
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse mx-auto" />
              </div>
            ))}
          </section>
        }
      >
        <FeatureGrid />
      </Suspense>

      {/* WhyChooseSection - SSR enabled */}
      <Suspense
        fallback={
          <section
            aria-hidden="true"
            className="mt-16 bg-gray-50 rounded-lg p-8"
            style={{ minHeight: '400px' }}
          >
            <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse mx-auto mb-6" />
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-lg bg-white border border-gray-200"
                >
                  <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        }
      >
        <WhyChooseSection />
      </Suspense>

      {/* Client-only components (UserOnboarding, KeyboardShortcutHint) */}
      <HomePageClientComponents />
    </div>
  );
}