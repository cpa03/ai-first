import type { Metadata } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import LayoutErrorFallback from '@/components/LayoutErrorFallback';
import { DASHBOARD_PAGE_CONFIG, DASHBOARD_ERROR_FALLBACK } from '@/lib/config';

export const metadata: Metadata = {
  title: DASHBOARD_PAGE_CONFIG.METADATA.title,
  description: DASHBOARD_PAGE_CONFIG.METADATA.description,
  keywords: [...DASHBOARD_PAGE_CONFIG.METADATA.keywords],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: DASHBOARD_PAGE_CONFIG.METADATA.openGraph,
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={
        <LayoutErrorFallback
          title={DASHBOARD_ERROR_FALLBACK.TITLE}
          message={DASHBOARD_ERROR_FALLBACK.MESSAGE}
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
}
