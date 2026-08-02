import DashboardSkeleton from '@/components/DashboardSkeleton';
import { PAGE_LAYOUT_CLASSES } from '@/lib/config';

/**
 * Route-level loading state for /dashboard.
 *
 * Next.js App Router shows this instantly during route transitions — before
 * the page component mounts — giving users immediate visual feedback that
 * navigation succeeded and content is loading. This is faster than the
 * internal `loading` state in DashboardPage which only activates after
 * the component initializes and calls setLoading(true).
 */
export default function DashboardLoading() {
  return (
    <div className={PAGE_LAYOUT_CLASSES.CONTAINER_LG}>
      <DashboardSkeleton />
    </div>
  );
}
