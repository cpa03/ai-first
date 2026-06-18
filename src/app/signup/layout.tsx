import { Metadata } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import LayoutErrorFallback from '@/components/LayoutErrorFallback';
import { SIGNUP_PAGE_CONFIG } from '@/lib/config';

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
        <LayoutErrorFallback
          title="Sign Up Unavailable"
          message="We encountered an issue while loading the sign up page. Please try again."
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
}
