import { Metadata } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import { CLARIFY_PAGE_CONFIG } from '@/lib/config';
import Alert from '@/components/Alert';
import Button from '@/components/Button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: CLARIFY_PAGE_CONFIG.METADATA.title,
  description: CLARIFY_PAGE_CONFIG.METADATA.description,
  keywords: [...CLARIFY_PAGE_CONFIG.METADATA.keywords],
  openGraph: CLARIFY_PAGE_CONFIG.METADATA.openGraph,
  robots: {
    index: false,
    follow: false,
  },
};
export default function ClarifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <Alert type="error" title="Clarification Unavailable">
              We encountered an issue while loading the clarification flow. Your
              progress has been saved.
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="primary"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
                <Link href="/" passHref>
                  <Button variant="secondary">Back to Home</Button>
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
