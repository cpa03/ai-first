-- Migration: Add Admin Tables for RBAC and Audit Logging
-- Date: 2026-09-19

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Admin Roles Table
-- ============================================================================
CREATE TABLE admin_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'moderator', 'super_admin')),
    granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    UNIQUE(user_id, role)
);

-- Indexes for admin_roles
CREATE INDEX idx_admin_roles_user_id ON admin_roles(user_id);
CREATE INDEX idx_admin_roles_role ON admin_roles(role);
CREATE INDEX idx_admin_roles_active ON admin_roles(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_admin_roles_expires_at ON admin_roles(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================================================
-- Admin Audit Logs Table
-- ============================================================================
CREATE TABLE admin_audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    request_id TEXT,
    correlation_id TEXT,
    severity TEXT DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for admin_audit_logs
CREATE INDEX idx_admin_audit_logs_admin_user_id ON admin_audit_logs(admin_user_id);
CREATE INDEX idx_admin_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX idx_admin_audit_logs_resource_type ON admin_audit_logs(resource_type);
CREATE INDEX idx_admin_audit_logs_resource_id ON admin_audit_logs(resource_id);
CREATE INDEX idx_admin_audit_logs_target_user_id ON admin_audit_logs(target_user_id);
CREATE INDEX idx_admin_audit_logs_created_at ON admin_audit_logs(created_at DESC);
CREATE INDEX idx_admin_audit_logs_severity ON admin_audit_logs(severity);
CREATE INDEX idx_admin_audit_logs_request_id ON admin_audit_logs(request_id);
CREATE INDEX idx_admin_audit_logs_correlation_id ON admin_audit_logs(correlation_id);

-- Composite indexes for common query patterns
CREATE INDEX idx_admin_audit_logs_admin_created ON admin_audit_logs(admin_user_id, created_at DESC);
CREATE INDEX idx_admin_audit_logs_resource_created ON admin_audit_logs(resource_type, created_at DESC);
CREATE INDEX idx_admin_audit_logs_target_created ON admin_audit_logs(target_user_id, created_at DESC);

-- ============================================================================
-- Enable Row Level Security (RLS)
-- ============================================================================
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies for admin_roles
-- ============================================================================
-- Service role has full access
CREATE POLICY "Service role full access admin_roles" ON admin_roles
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Admins can view all roles
CREATE POLICY "Admins can view admin_roles" ON admin_roles
    FOR SELECT USING (
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM admin_roles ar
            WHERE ar.user_id = auth.uid()
            AND ar.role IN ('admin', 'super_admin')
            AND ar.is_active = TRUE
            AND (ar.expires_at IS NULL OR ar.expires_at > NOW())
        )
    );

-- Super admins can manage roles
CREATE POLICY "Super admins can manage admin_roles" ON admin_roles
    FOR INSERT WITH CHECK (
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM admin_roles ar
            WHERE ar.user_id = auth.uid()
            AND ar.role = 'super_admin'
            AND ar.is_active = TRUE
            AND (ar.expires_at IS NULL OR ar.expires_at > NOW())
        )
    );

CREATE POLICY "Super admins can update admin_roles" ON admin_roles
    FOR UPDATE USING (
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM admin_roles ar
            WHERE ar.user_id = auth.uid()
            AND ar.role = 'super_admin'
            AND ar.is_active = TRUE
            AND (ar.expires_at IS NULL OR ar.expires_at > NOW())
        )
    );

CREATE POLICY "Super admins can delete admin_roles" ON admin_roles
    FOR DELETE USING (
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM admin_roles ar
            WHERE ar.user_id = auth.uid()
            AND ar.role = 'super_admin'
            AND ar.is_active = TRUE
            AND (ar.expires_at IS NULL OR ar.expires_at > NOW())
        )
    );

-- Users can view their own roles
CREATE POLICY "Users can view own admin_roles" ON admin_roles
    FOR SELECT USING (user_id = auth.uid());

-- ============================================================================
-- RLS Policies for admin_audit_logs
-- ============================================================================
-- Service role has full access
CREATE POLICY "Service role full access admin_audit_logs" ON admin_audit_logs
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Admins can view all audit logs
CREATE POLICY "Admins can view admin_audit_logs" ON admin_audit_logs
    FOR SELECT USING (
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM admin_roles ar
            WHERE ar.user_id = auth.uid()
            AND ar.role IN ('admin', 'moderator', 'super_admin')
            AND ar.is_active = TRUE
            AND (ar.expires_at IS NULL OR ar.expires_at > NOW())
        )
    );

-- Admins can insert audit logs
CREATE POLICY "Admins can insert admin_audit_logs" ON admin_audit_logs
    FOR INSERT WITH CHECK (
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM admin_roles ar
            WHERE ar.user_id = auth.uid()
            AND ar.role IN ('admin', 'moderator', 'super_admin')
            AND ar.is_active = TRUE
            AND (ar.expires_at IS NULL OR ar.expires_at > NOW())
        )
    );

-- ============================================================================
-- Triggers for updated_at (if we add it later)
-- ============================================================================
-- Note: admin_roles and admin_audit_logs don't have updated_at by design
-- (audit logs are immutable, roles are granted once with expiry)

-- ============================================================================
-- Function to check if user has admin role
-- ============================================================================
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    has_role BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM admin_roles
        WHERE admin_roles.user_id = is_admin.user_id
        AND admin_roles.role IN ('admin', 'super_admin')
        AND admin_roles.is_active = TRUE
        AND (admin_roles.expires_at IS NULL OR admin_roles.expires_at > NOW())
    ) INTO has_role;
    RETURN has_role;
END;
$$;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    has_role BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM admin_roles
        WHERE admin_roles.user_id = is_super_admin.user_id
        AND admin_roles.role = 'super_admin'
        AND admin_roles.is_active = TRUE
        AND (admin_roles.expires_at IS NULL OR admin_roles.expires_at > NOW())
    ) INTO has_role;
    RETURN has_role;
END;
$$;

-- Function to check if user is moderator or higher
CREATE OR REPLACE FUNCTION is_moderator_or_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    has_role BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM admin_roles
        WHERE admin_roles.user_id = is_moderator_or_admin.user_id
        AND admin_roles.role IN ('moderator', 'admin', 'super_admin')
        AND admin_roles.is_active = TRUE
        AND (admin_roles.expires_at IS NULL OR admin_roles.expires_at > NOW())
    ) INTO has_role;
    RETURN has_role;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_admin TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION is_super_admin TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION is_moderator_or_admin TO authenticated, service_role;

-- ============================================================================
-- View for easy admin user listing
-- ============================================================================
CREATE OR REPLACE VIEW admin_user_view AS
SELECT
    u.id,
    u.email,
    u.created_at as user_created_at,
    u.last_sign_in_at,
    u.email_confirmed_at,
    u.banned_until,
    COALESCE(ARRAY_AGG(ar.role) FILTER (WHERE ar.is_active = TRUE AND (ar.expires_at IS NULL OR ar.expires_at > NOW())), '{}') as active_roles,
    MAX(ar.expires_at) FILTER (WHERE ar.role = 'super_admin' AND ar.is_active = TRUE) as super_admin_expires,
    MAX(ar.expires_at) FILTER (WHERE ar.role = 'admin' AND ar.is_active = TRUE) as admin_expires,
    MAX(ar.expires_at) FILTER (WHERE ar.role = 'moderator' AND ar.is_active = TRUE) as moderator_expires
FROM auth.users u
LEFT JOIN admin_roles ar ON u.id = ar.user_id
GROUP BY u.id, u.email, u.created_at, u.last_sign_in_at, u.email_confirmed_at, u.banned_until;

-- Grant access to view
GRANT SELECT ON admin_user_view TO authenticated, service_role;

-- RLS on the view inherits from underlying tables
ALTER VIEW admin_user_view SET (security_invoker = on);