import type { Metadata } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import LayoutErrorFallback from '@/components/LayoutErrorFallback';
import { DASHBOARD_PAGE_CONFIG } from '@/lib/config';

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
          title="Dashboard Unavailable"
          message="We couldn't load your dashboard. Please try again to see your ideas."
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
}
