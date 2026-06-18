import { Metadata } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import LayoutErrorFallback from '@/components/LayoutErrorFallback';
import { LOGIN_PAGE_CONFIG } from '@/lib/config';

export const metadata: Metadata = {
  title: LOGIN_PAGE_CONFIG.METADATA.title,
  description: LOGIN_PAGE_CONFIG.METADATA.description,
  keywords: [...LOGIN_PAGE_CONFIG.METADATA.keywords],
  openGraph: LOGIN_PAGE_CONFIG.METADATA.openGraph,
  robots: 'index, follow',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={
        <LayoutErrorFallback
          title="Login Unavailable"
          message="We encountered an issue while loading the login page. Please try again."
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
}
