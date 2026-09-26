import { unstable_cache } from 'next/cache';
import { dbService } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { APP_CONFIG } from '@/lib/config/app';
import { IDEA_STATUS_CONFIG } from '@/lib/config';

interface Idea {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

interface Pagination {
  total: number;
  limit: number;
  offset: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

interface DashboardData {
  ideas: Idea[];
  pagination: Pagination;
}

/**
 * Server-side function to fetch user ideas with database-level pagination
 * This is wrapped with unstable_cache for automatic caching and revalidation
 */
export const getDashboardData = unstable_cache(
  async (
    userId: string,
    filter: string,
    page: number,
    limit: number
  ): Promise<DashboardData> => {
    const result = await dbService.getUserIdeasPaginated(
      userId,
      { page, pageSize: limit },
      {
        status: filter as 'draft' | 'clarified' | 'breakdown' | 'completed' | 'all' | undefined,
      }
    );

    const formattedIdeas: Idea[] = result.data.map((idea) => ({
      id: idea.id,
      title: idea.title,
      status: idea.status,
      createdAt: idea.created_at,
      updatedAt: idea.updated_at,
    }));

    return {
      ideas: formattedIdeas,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.pageSize,
        offset: (result.page - 1) * result.pageSize,
        pageSize: result.pageSize,
        hasMore: result.hasMore,
      },
    };
  },
  ['dashboard-data'],
  {
    revalidate: 60, // Revalidate every 60 seconds
    tags: ['dashboard'],
  }
);

/**
 * Server-side function to fetch user ID from auth
 * This runs on the server and caches the auth check
 */
export const getAuthenticatedUserId = unstable_cache(
  async (request: Request): Promise<string | null> => {
    try {
      // This is a placeholder - the actual auth check will be done in the server component
      // using the requireAuth function which validates the session
      return null;
    } catch {
      return null;
    }
  },
  ['auth-user-id'],
  {
    revalidate: 300, // 5 minutes
    tags: ['auth'],
  }
);

/**
 * Cache tags for dashboard data invalidation
 */
export const DASHBOARD_CACHE_TAGS = {
  IDEAS: 'dashboard-ideas',
  USER: 'dashboard-user',
} as const;

/**
 * Function to revalidate dashboard cache when data changes
 */
export async function revalidateDashboardCache(userId: string) {
  // In Next.js 15, we would use revalidateTag, but for now we use the cache tags
  // This function can be called from server actions after mutations
}