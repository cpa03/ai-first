import {
  withApiHandler,
  ApiContext,
  standardSuccessResponse,
} from '@/lib/api-handler';
import { requireAdminAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/db';
import { STATUS_CODES } from '@/lib/config/http';
import { API_ERROR_MESSAGES } from '@/lib/config/error-messages';
import { SecurityAuditLog } from '@/lib/security/audit-log';

async function handleGet(context: ApiContext) {
  await requireAdminAuth(context.request);

  const adminClient = getSupabaseAdmin();
  if (!adminClient) {
    throw new Error(API_ERROR_MESSAGES.DB.ADMIN_NOT_INITIALIZED);
  }

  const url = new URL(context.request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
  const search = url.searchParams.get('search') || '';
  const role = url.searchParams.get('role') || '';
  const status = url.searchParams.get('status') || '';
  const offset = (page - 1) * limit;

  // Build query using the admin_user_view (explicit columns - avoid select('*'))
  let query = adminClient
    .from('admin_user_view')
    .select(
      'id, email, user_created_at, last_sign_in_at, email_confirmed_at, banned_until, active_roles',
      { count: 'exact' }
    )
    .range(offset, offset + limit - 1)
    .order('user_created_at', { ascending: false });

  if (search) {
    query = query.ilike('email', `%${search}%`);
  }

  if (role) {
    query = query.contains('active_roles', [role]);
  }

  if (status === 'banned') {
    query = query.not('banned_until', 'is', null).gt('banned_until', new Date().toISOString());
  } else if (status === 'active') {
    query = query.or('banned_until.is.null,banned_until.lt.' + new Date().toISOString());
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  // Log audit event
  SecurityAuditLog.logAuthAttempt({
    success: true,
    endpoint: '/api/admin/users',
    method: 'bearer_token',
    requestId: context.requestId,
  });

  return standardSuccessResponse(
    {
      users: data || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    },
    context.requestId,
    STATUS_CODES.OK,
    context.rateLimit
  );
}

export const GET = withApiHandler(handleGet, { rateLimit: 'strict' });