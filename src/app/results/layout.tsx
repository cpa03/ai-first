import { Metadata } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import { RESULTS_PAGE_CONFIG } from '@/lib/config';
import Alert from '@/components/Alert';
import Button from '@/components/Button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: RESULTS_PAGE_CONFIG.METADATA.title,
  description: RESULTS_PAGE_CONFIG.METADATA.description,
  keywords: [...RESULTS_PAGE_CONFIG.METADATA.keywords],
  openGraph: RESULTS_PAGE_CONFIG.METADATA.openGraph,
  robots: {
    index: false,
    follow: false,
  },
};
export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <Alert type="error" title="Results Unavailable">
              We couldn&apos;t load your project results. Please try again or
              start a new idea.
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="primary"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
                <Link href="/" passHref>
                  <Button variant="secondary">New Idea</Button>
                </Link>
              </div>
            </Alert>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
