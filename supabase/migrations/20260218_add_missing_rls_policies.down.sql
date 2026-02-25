-- Down Migration: Remove Missing RLS Policies
-- Reverses: 20260218_add_missing_rls_policies.sql
-- Date: 2026-02-18
-- Safety: Safe to run - only removes policies, not data

-- ============================================================================
-- Task Dependencies: Remove UPDATE and DELETE policies
-- ============================================================================
DROP POLICY IF EXISTS "Users can update task dependencies for their ideas" ON task_dependencies;
DROP POLICY IF EXISTS "Users can delete task dependencies for their ideas" ON task_dependencies;

-- ============================================================================
-- Milestones: Remove DELETE policy
-- ============================================================================
DROP POLICY IF EXISTS "Users can delete milestones for their ideas" ON milestones;

-- ============================================================================
-- Task Assignments: Remove INSERT, UPDATE, and DELETE policies
-- ============================================================================
DROP POLICY IF EXISTS "Users can create task assignments for their ideas" ON task_assignments;
DROP POLICY IF EXISTS "Users can update task assignments for their ideas" ON task_assignments;
DROP POLICY IF EXISTS "Users can delete task assignments for their ideas" ON task_assignments;

-- ============================================================================
-- Time Tracking: Remove UPDATE and DELETE policies
-- ============================================================================
DROP POLICY IF EXISTS "Users can update their own time tracking" ON time_tracking;
DROP POLICY IF EXISTS "Users can delete their own time tracking" ON time_tracking;

-- ============================================================================
-- Task Comments: Remove UPDATE and DELETE policies
-- ============================================================================
DROP POLICY IF EXISTS "Users can update comments for their ideas" ON task_comments;
DROP POLICY IF EXISTS "Users can delete comments for their ideas" ON task_comments;

-- ============================================================================
-- Breakdown Sessions: Remove UPDATE and DELETE policies
-- ============================================================================
DROP POLICY IF EXISTS "Users can update breakdown sessions for their ideas" ON breakdown_sessions;
DROP POLICY IF EXISTS "Users can delete breakdown sessions for their ideas" ON breakdown_sessions;

-- ============================================================================
-- Timelines: Remove UPDATE and DELETE policies
-- ============================================================================
DROP POLICY IF EXISTS "Users can update timelines for their ideas" ON timelines;
DROP POLICY IF EXISTS "Users can delete timelines for their ideas" ON timelines;

-- ============================================================================
-- Risk Assessments: Remove UPDATE and DELETE policies
-- ============================================================================
DROP POLICY IF EXISTS "Users can update risk assessments for their ideas" ON risk_assessments;
DROP POLICY IF EXISTS "Users can delete risk assessments for their ideas" ON risk_assessments;
