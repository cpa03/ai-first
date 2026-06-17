import { Metadata } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import { SIGNUP_PAGE_CONFIG } from '@/lib/config';
import Alert from '@/components/Alert';
import Button from '@/components/Button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: SIGNUP_PAGE_CONFIG.METADATA.title,
  description: SIGNUP_PAGE_CONFIG.METADATA.description,
  keywords: [...SIGNUP_PAGE_CONFIG.METADATA.keywords],
  openGraph: SIGNUP_PAGE_CONFIG.METADATA.openGraph,
  robots: 'index, follow',
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <Alert type="error" title="Sign Up Unavailable">
              We encountered an issue while loading the sign up page. Please try
              again.
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
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
