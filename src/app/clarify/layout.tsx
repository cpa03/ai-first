import { Metadata } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import LayoutErrorFallback from '@/components/LayoutErrorFallback';
import { CLARIFY_PAGE_CONFIG, CLARIFY_ERROR_FALLBACK } from '@/lib/config';

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
        <LayoutErrorFallback
          title={CLARIFY_ERROR_FALLBACK.TITLE}
          message={CLARIFY_ERROR_FALLBACK.MESSAGE}
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
}
