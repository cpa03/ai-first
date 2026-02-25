import type { Metadata } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import Alert from '@/components/Alert';
import Button from '@/components/Button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard - Your Ideas',
  description:
    'View and manage all your project ideas in one place. Track progress from draft to completion.',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Dashboard - Your Ideas',
    description: 'View and manage all your project ideas in one place.',
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <Alert type="error" title="Dashboard Unavailable">
              We couldn&apos;t load your dashboard. Please try again to see your
              ideas.
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
