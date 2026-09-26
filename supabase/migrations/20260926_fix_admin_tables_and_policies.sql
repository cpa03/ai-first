-- Migration: Fix admin tables and policies deployed by 20260919_add_admin_tables
-- Date: 2026-09-26
-- Purpose: Align already-deployed DBs (which ran 20260919_add_admin_tables.sql)
--   with the corrected canonical DDL now in supabase/schema.sql.
-- Source: sync from supabase/schema.sql (admin RBAC + audit section).
-- Idempotent: safe to re-apply (DO-guards + DROP POLICY IF EXISTS).
-- Fixes vs 20260919:
--   1. admin_audit_logs.admin_user_id was NOT NULL ... ON DELETE SET NULL
--      (contradictory: deletes would fail instead of NULL-ing; audit trail
--      would not survive admin deletion). Now nullable.
--   2. SECURITY DEFINER helpers were GRANTed without REVOKE from PUBLIC;
--      now REVOKE ALL FROM PUBLIC + GRANT EXECUTE to authenticated, service_role.
--   3. The 5 parity policies used inline EXISTS on admin_roles, which
--      self-recurses under RLS ("infinite recursion detected in policy");
--      now they call the SECURITY DEFINER helpers.
--   4. admin_user_view was GRANTed to authenticated, exposing all users'
--      emails (security_invoker=on, no row filter); now service-role-only.
-- NOTE: No CREATE TABLE here — tables already exist on deployed DBs.

-- ============================================================================
-- 1. Drop NOT NULL on admin_audit_logs.admin_user_id (guarded, re-apply safe)
-- ============================================================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'admin_audit_logs'
          AND column_name = 'admin_user_id'
          AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE admin_audit_logs ALTER COLUMN admin_user_id DROP NOT NULL;
    END IF;
END
$$;

-- ============================================================================
-- 2. Lock down SECURITY DEFINER helpers (guarded by function existence)
-- ============================================================================
DO $$
BEGIN
    IF to_regprocedure('public.is_admin(uuid)') IS NOT NULL THEN
        REVOKE ALL ON FUNCTION is_admin(UUID) FROM PUBLIC;
        GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated, service_role;
    END IF;
    IF to_regprocedure('public.is_super_admin(uuid)') IS NOT NULL THEN
        REVOKE ALL ON FUNCTION is_super_admin(UUID) FROM PUBLIC;
        GRANT EXECUTE ON FUNCTION is_super_admin(UUID) TO authenticated, service_role;
    END IF;
    IF to_regprocedure('public.is_moderator_or_admin(uuid)') IS NOT NULL THEN
        REVOKE ALL ON FUNCTION is_moderator_or_admin(UUID) FROM PUBLIC;
        GRANT EXECUTE ON FUNCTION is_moderator_or_admin(UUID) TO authenticated, service_role;
    END IF;
END
$$;

-- ============================================================================
-- 3. Parity policies (exact definitions from supabase/schema.sql — bodies call
--    the SECURITY DEFINER helpers to avoid RLS self-recursion).
--    DROP IF EXISTS first so re-apply is safe.
-- ============================================================================
DROP POLICY IF EXISTS "Super admins can manage admin_roles" ON admin_roles;
CREATE POLICY "Super admins can manage admin_roles" ON admin_roles
    FOR INSERT WITH CHECK (
        auth.role() = 'service_role' OR is_super_admin(auth.uid())
    );

DROP POLICY IF EXISTS "Super admins can update admin_roles" ON admin_roles;
CREATE POLICY "Super admins can update admin_roles" ON admin_roles
    FOR UPDATE USING (
        auth.role() = 'service_role' OR is_super_admin(auth.uid())
    );

DROP POLICY IF EXISTS "Super admins can delete admin_roles" ON admin_roles;
CREATE POLICY "Super admins can delete admin_roles" ON admin_roles
    FOR DELETE USING (
        auth.role() = 'service_role' OR is_super_admin(auth.uid())
    );

DROP POLICY IF EXISTS "Users can view own admin_roles" ON admin_roles;
CREATE POLICY "Users can view own admin_roles" ON admin_roles
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can insert admin_audit_logs" ON admin_audit_logs;
CREATE POLICY "Admins can insert admin_audit_logs" ON admin_audit_logs
    FOR INSERT WITH CHECK (
        auth.role() = 'service_role' OR is_moderator_or_admin(auth.uid())
    );

-- ============================================================================
-- 4. admin_user_view: service-role-only SELECT + security_invoker
-- ============================================================================
DO $$
BEGIN
    IF to_regclass('public.admin_user_view') IS NOT NULL THEN
        REVOKE SELECT ON admin_user_view FROM PUBLIC, authenticated;
        GRANT SELECT ON admin_user_view TO service_role;
    END IF;
END
$$;

-- RLS on the view must be enforced as the querying role (mirrors 20260919).
ALTER VIEW admin_user_view SET (security_invoker = on);
