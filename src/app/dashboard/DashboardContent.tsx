import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getDashboardData } from '@/lib/dashboard-data';
import { APP_CONFIG } from '@/lib/config/app';
import DashboardClient from './DashboardClient';
import DashboardSkeleton from '@/components/DashboardSkeleton';
import { PAGE_LAYOUT_CLASSES } from '@/lib/config/page-layout';

interface DashboardContentProps {
  filter?: string;
  page?: number;
}

/**
 * Server Component: Fetches dashboard data and passes to client component
 * This runs on the server with caching via unstable_cache
 */
export default async function DashboardContent({
  filter = 'all',
  page = 1,
}: DashboardContentProps) {
  const cookieStore = await cookies();
  
  // Create Supabase server client for auth
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  // If not authenticated, return client component with auth loading state
  if (authError || !user) {
    return (
      <DashboardClient
        initialIdeas={[]}
        initialPagination={null}
        initialLoading={false}
        initialError="Please sign in to view your dashboard"
        filter={filter}
        page={page}
        isAuthenticated={false}
      />
    );
  }

  // Fetch dashboard data with server-side caching
  const data = await getDashboardData(
    user.id,
    filter,
    page,
    APP_CONFIG.PAGINATION.DEFAULT_LIMIT
  );

  return (
    <DashboardClient
      initialIdeas={data.ideas}
      initialPagination={data.pagination}
      initialLoading={false}
      initialError={null}
      filter={filter}
      page={page}
      isAuthenticated={true}
      userId={user.id}
    />
  );
}