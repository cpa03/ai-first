import {
  withApiHandler,
  ApiContext,
  standardSuccessResponse,
} from '@/lib/api-handler';
import { requireAdminAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/db';
import { STATUS_CODES } from '@/lib/config/http';
import { API_ERROR_MESSAGES } from '@/lib/config/error-messages';
import { DB_TABLES } from '@/lib/config/database-tables';

async function handleGet(context: ApiContext) {
  await requireAdminAuth(context.request);

  const adminClient = getSupabaseAdmin();
  if (!adminClient) {
    throw new Error(API_ERROR_MESSAGES.DB.ADMIN_NOT_INITIALIZED);
  }

  const url = new URL(context.request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
  const action = url.searchParams.get('action') || '';
  const resourceType = url.searchParams.get('resource_type') || '';
  const adminUserId = url.searchParams.get('admin_user_id') || '';
  const targetUserId = url.searchParams.get('target_user_id') || '';
  const severity = url.searchParams.get('severity') || '';
  const startDate = url.searchParams.get('start_date') || '';
  const endDate = url.searchParams.get('end_date') || '';
  const offset = (page - 1) * limit;

  let query = adminClient
    .from(DB_TABLES.ADMIN_AUDIT_LOGS)
    .select(
      'id, admin_user_id, action, resource_type, resource_id, target_user_id, details, ip_address, user_agent, request_id, correlation_id, severity, created_at',
      { count: 'exact' }
    )
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  if (action) {
    query = query.eq('action', action);
  }

  if (resourceType) {
    query = query.eq('resource_type', resourceType);
  }

  if (adminUserId) {
    query = query.eq('admin_user_id', adminUserId);
  }

  if (targetUserId) {
    query = query.eq('target_user_id', targetUserId);
  }

  if (severity) {
    query = query.eq('severity', severity);
  }

  if (startDate) {
    query = query.gte('created_at', startDate);
  }

  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return standardSuccessResponse(
    {
      logs: data || [],
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
