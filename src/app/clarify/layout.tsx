import { Metadata } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import LayoutErrorFallback from '@/components/LayoutErrorFallback';
import { CLARIFY_PAGE_CONFIG } from '@/lib/config';

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
          title="Clarification Unavailable"
          message="We encountered an issue while loading the clarification flow. Your progress has been saved."
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
}
