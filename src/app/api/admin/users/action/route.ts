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

interface UserActionRequest {
  userId: string;
  action: 'suspend' | 'unsuspend' | 'delete' | 'change_role';
  role?: 'admin' | 'moderator' | 'super_admin';
  expiresAt?: string;
  reason?: string;
}

async function handlePost(context: ApiContext) {
  await requireAdminAuth(context.request);

  const adminClient = getSupabaseAdmin();
  if (!adminClient) {
    throw new Error(API_ERROR_MESSAGES.DB.ADMIN_NOT_INITIALIZED);
  }

  const body: UserActionRequest = await context.request.json();
  const { userId, action, role, expiresAt, reason } = body;

  if (!userId || !action) {
    return standardSuccessResponse(
      { error: 'userId and action are required' },
      context.requestId,
      STATUS_CODES.BAD_REQUEST,
      context.rateLimit
    );
  }

  // Get admin user ID from request (would come from auth context in real implementation)
  const adminUserId = context.userId || 'unknown';

  let result: any = {};

  switch (action) {
    case 'suspend': {
      const { error } = await adminClient.auth.admin.updateUserById(userId, {
        ban_duration: '87600h', // 10 years effectively permanent
      });
      if (error) throw new Error(error.message);

      // Log audit
      await adminClient.from('admin_audit_logs').insert({
        admin_user_id: adminUserId,
        action: 'user_suspend',
        resource_type: 'user',
        resource_id: userId,
        target_user_id: userId,
        details: { reason: reason || 'No reason provided' },
        severity: 'warning',
        request_id: context.requestId,
      });

      result = { message: 'User suspended successfully' };
      break;
    }

    case 'unsuspend': {
      const { error } = await adminClient.auth.admin.updateUserById(userId, {
        ban_duration: 'none',
      });
      if (error) throw new Error(error.message);

      await adminClient.from('admin_audit_logs').insert({
        admin_user_id: adminUserId,
        action: 'user_unsuspend',
        resource_type: 'user',
        resource_id: userId,
        target_user_id: userId,
        details: { reason: reason || 'No reason provided' },
        severity: 'info',
        request_id: context.requestId,
      });

      result = { message: 'User unsuspended successfully' };
      break;
    }

    case 'delete': {
      const { error } = await adminClient.auth.admin.deleteUser(userId);
      if (error) throw new Error(error.message);

      await adminClient.from('admin_audit_logs').insert({
        admin_user_id: adminUserId,
        action: 'user_delete',
        resource_type: 'user',
        resource_id: userId,
        target_user_id: userId,
        details: { reason: reason || 'No reason provided' },
        severity: 'critical',
        request_id: context.requestId,
      });

      result = { message: 'User deleted successfully' };
      break;
    }

    case 'change_role': {
      if (!role) {
        return standardSuccessResponse(
          { error: 'role is required for change_role action' },
          context.requestId,
          STATUS_CODES.BAD_REQUEST,
          context.rateLimit
        );
      }

      // Check if role already exists
      const { data: existingRole } = await adminClient
        .from('admin_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role', role)
        .eq('is_active', true)
        .single();

      if (existingRole) {
        return standardSuccessResponse(
          { error: `User already has role: ${role}` },
          context.requestId,
          STATUS_CODES.CONFLICT,
          context.rateLimit
        );
      }

      const { error } = await adminClient.from('admin_roles').insert({
        user_id: userId,
        role,
        granted_by: adminUserId,
        expires_at: expiresAt || null,
        metadata: { reason: reason || 'No reason provided' },
      });
      if (error) throw new Error(error.message);

      await adminClient.from('admin_audit_logs').insert({
        admin_user_id: adminUserId,
        action: 'role_grant',
        resource_type: 'admin_role',
        resource_id: userId,
        target_user_id: userId,
        details: { role, expires_at: expiresAt, reason: reason || 'No reason provided' },
        severity: 'info',
        request_id: context.requestId,
      });

      result = { message: `Role ${role} granted successfully` };
      break;
    }

    default:
      return standardSuccessResponse(
        { error: `Unknown action: ${action}` },
        context.requestId,
        STATUS_CODES.BAD_REQUEST,
        context.rateLimit
      );
  }

  return standardSuccessResponse(
    result,
    context.requestId,
    STATUS_CODES.OK,
    context.rateLimit
  );
}

export const POST = withApiHandler(handlePost, { rateLimit: 'strict' });