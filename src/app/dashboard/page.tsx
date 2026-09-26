import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DASHBOARD_PAGE_CONFIG, DASHBOARD_ERROR_FALLBACK } from '@/lib/config';
import DashboardContent from './DashboardContent';
import DashboardSkeleton from '@/components/DashboardSkeleton';
import ErrorBoundary from '@/components/ErrorBoundary';
import LayoutErrorFallback from '@/components/LayoutErrorFallback';

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

export default function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; page?: string }>;
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
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContentWrapper searchParams={searchParams} />
      </Suspense>
    </ErrorBoundary>
  );
}

async function DashboardContentWrapper({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; page?: string }>;
}) {
  const params = await searchParams;
  const filter = params.filter || 'all';
  const page = parseInt(params.page || '1', 10);

  return <DashboardContent filter={filter} page={page} />;
}