import { Metadata } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import LayoutErrorFallback from '@/components/LayoutErrorFallback';
import { RESULTS_PAGE_CONFIG, RESULTS_ERROR_FALLBACK } from '@/lib/config';

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
        <LayoutErrorFallback
          title={RESULTS_ERROR_FALLBACK.TITLE}
          message={RESULTS_ERROR_FALLBACK.MESSAGE}
          homeLabel={RESULTS_ERROR_FALLBACK.HOME_LABEL}
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
}
