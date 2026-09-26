import {
  withApiHandler,
  ApiContext,
  standardSuccessResponse,
} from '@/lib/api-handler';
import { requireAdminAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/db';
import { STATUS_CODES } from '@/lib/config/http';
import { API_ERROR_MESSAGES } from '@/lib/config/error-messages';

async function handleGet(context: ApiContext) {
  await requireAdminAuth(context.request);

  const adminClient = getSupabaseAdmin();
  if (!adminClient) {
    throw new Error(API_ERROR_MESSAGES.DB.ADMIN_NOT_INITIALIZED);
  }

  // Get various system metrics.
  // NOTE: auth.users lives in the auth schema and is NOT exposed via PostgREST,
  // so `from('auth.users')` always fails. User counts are derived from the
  // PostgREST-safe `admin_user_view` (see supabase/migrations/20260919_add_admin_tables.sql),
  // with a fallback to the Auth Admin API (listUsers) when the view is missing.
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const countUsersSince = async (
    since?: string
  ): Promise<number | null> => {
    try {
      let q = adminClient
        .from('admin_user_view')
        .select('id', { count: 'exact', head: true });
      if (since) q = q.gte('user_created_at', since);
      const { count, error } = await q;
      if (!error && typeof count === 'number') return count;
    } catch {
      // fall through to Auth Admin API
    }
    try {
      const { data, error } = await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 1,
      });
      if (error || !data) return null;
      if (!since) return data.total ?? (data.users?.length ?? 0);
      // Auth Admin listUsers has no server-side created_at filter; page through
      // (capped) and filter in memory as a best-effort fallback.
      const perPage = 1000;
      let page = 1;
      let recent = 0;
      for (;;) {
        const res = await adminClient.auth.admin.listUsers({ page, perPage });
        if (res.error || !res.data?.users?.length) break;
        recent += res.data.users.filter((u) => (u.created_at ?? '') >= since).length;
        if (res.data.users.length < perPage || page >= 10) break;
        page += 1;
      }
      return recent;
    } catch {
      return null;
    }
  };

  const [
    totalUsers,
    { count: totalIdeas },
    { count: totalTasks },
    { count: activeAdmins },
    { count: totalAuditLogs },
    { data: dbStats },
  ] = await Promise.all([
    countUsersSince(),
    adminClient.from('ideas').select('id', { count: 'exact', head: true }),
    adminClient.from('tasks').select('id', { count: 'exact', head: true }),
    adminClient
      .from('admin_roles')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString()),
    adminClient.from('admin_audit_logs').select('id', { count: 'exact', head: true }),
    (async () => {
      try {
        const { data } = await adminClient.rpc('pg_database_size', {
          db_name: 'postgres',
        });
        return { data };
      } catch {
        return { data: null };
      }
    })(),
  ]);

  // Get recent activity (last 24 hours)
  const [
    newUsers24h,
    { count: newIdeas24h },
    { count: newAuditLogs24h },
  ] = await Promise.all([
    countUsersSince(yesterday),
    adminClient
      .from('ideas')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', yesterday),
    adminClient
      .from('admin_audit_logs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', yesterday),
  ]);

  // Get database size
  const dbSize = dbStats ?? 0;

  // Get role distribution
  const { data: roleDistribution } = await adminClient
    .from('admin_roles')
    .select('role')
    .eq('is_active', true)
    .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

  const roleCounts = (roleDistribution || []).reduce((acc: Record<string, number>, r) => {
    acc[r.role] = (acc[r.role] || 0) + 1;
    return acc;
  }, {});

  return standardSuccessResponse(
    {
      timestamp: new Date().toISOString(),
      overview: {
        totalUsers: totalUsers || 0,
        totalIdeas: totalIdeas || 0,
        totalTasks: totalTasks || 0,
        activeAdmins: activeAdmins || 0,
        totalAuditLogs: totalAuditLogs || 0,
        databaseSizeBytes: dbSize,
      },
      activity24h: {
        newUsers: newUsers24h || 0,
        newIdeas: newIdeas24h || 0,
        adminActions: newAuditLogs24h || 0,
      },
      roleDistribution: roleCounts,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
    },
    context.requestId,
    STATUS_CODES.OK,
    context.rateLimit
  );
}

export const GET = withApiHandler(handleGet, { rateLimit: 'strict' });