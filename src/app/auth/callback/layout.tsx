import { Metadata } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import LayoutErrorFallback from '@/components/LayoutErrorFallback';
import {
  AUTH_CALLBACK_PAGE_CONFIG,
  AUTH_CALLBACK_ERROR_FALLBACK,
} from '@/lib/config';

export const metadata: Metadata = {
  title: AUTH_CALLBACK_PAGE_CONFIG.METADATA.title,
  description: AUTH_CALLBACK_PAGE_CONFIG.METADATA.description,
  keywords: [...AUTH_CALLBACK_PAGE_CONFIG.METADATA.keywords],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: AUTH_CALLBACK_PAGE_CONFIG.METADATA.openGraph,
};

export default function AuthCallbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={
        <LayoutErrorFallback
          title={AUTH_CALLBACK_ERROR_FALLBACK.TITLE}
          message={AUTH_CALLBACK_ERROR_FALLBACK.MESSAGE}
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
}
