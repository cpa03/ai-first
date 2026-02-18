-- Migration: Add Missing RLS Policies for Breakdown Engine Tables
-- Purpose: Add UPDATE and DELETE policies missing from migration 001_breakdown_engine_extensions
-- Date: 2026-02-18
-- Issues: #1189, #1172
-- Safety: Non-destructive, only adds access restrictions (policies can only restrict, not grant access)
-- Author: database-architect specialist

-- ============================================================================
-- Background
-- ============================================================================
-- The original migration 001_breakdown_engine_extensions.sql created tables with RLS enabled
-- but only included SELECT and INSERT policies for most tables. This migration adds the
-- missing UPDATE and DELETE policies to ensure complete data access control.
--
-- All policies follow the pattern: users can only modify data they own through the idea chain.
-- Service role is always exempted for backend operations.

-- ============================================================================
-- Task Dependencies: UPDATE and DELETE policies
-- ============================================================================

-- Allow users to update task dependencies for their ideas
CREATE POLICY "Users can update task dependencies for their ideas" ON task_dependencies
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM tasks t
            JOIN deliverables d ON t.deliverable_id = d.id
            JOIN ideas i ON d.idea_id = i.id
            WHERE (t.id = predecessor_task_id OR t.id = successor_task_id)
            AND i.user_id = auth.uid()
        ) OR auth.role() = 'service_role'
    );

-- Allow users to delete task dependencies for their ideas
CREATE POLICY "Users can delete task dependencies for their ideas" ON task_dependencies
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM tasks t
            JOIN deliverables d ON t.deliverable_id = d.id
            JOIN ideas i ON d.idea_id = i.id
            WHERE (t.id = predecessor_task_id OR t.id = successor_task_id)
            AND i.user_id = auth.uid()
        ) OR auth.role() = 'service_role'
    );

-- ============================================================================
-- Milestones: DELETE policy (UPDATE already exists in migration 001)
-- ============================================================================

-- Allow users to delete milestones for their ideas
CREATE POLICY "Users can delete milestones for their ideas" ON milestones
    FOR DELETE USING (idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid()) OR auth.role() = 'service_role');

-- ============================================================================
-- Task Assignments: INSERT, UPDATE, and DELETE policies
-- ============================================================================

-- Allow users to create task assignments for their ideas
CREATE POLICY "Users can create task assignments for their ideas" ON task_assignments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM tasks t
            JOIN deliverables d ON t.deliverable_id = d.id
            JOIN ideas i ON d.idea_id = i.id
            WHERE t.id = task_assignments.task_id
            AND i.user_id = auth.uid()
        ) OR auth.role() = 'service_role'
    );

-- Allow users to update task assignments for their ideas
CREATE POLICY "Users can update task assignments for their ideas" ON task_assignments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM tasks t
            JOIN deliverables d ON t.deliverable_id = d.id
            JOIN ideas i ON d.idea_id = i.id
            WHERE t.id = task_assignments.task_id
            AND i.user_id = auth.uid()
        ) OR auth.role() = 'service_role'
    );

-- Allow users to delete task assignments for their ideas
CREATE POLICY "Users can delete task assignments for their ideas" ON task_assignments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM tasks t
            JOIN deliverables d ON t.deliverable_id = d.id
            JOIN ideas i ON d.idea_id = i.id
            WHERE t.id = task_assignments.task_id
            AND i.user_id = auth.uid()
        ) OR auth.role() = 'service_role'
    );

-- ============================================================================
-- Time Tracking: UPDATE and DELETE policies
-- Note: time_tracking uses direct user ownership (user_id = auth.uid())
-- ============================================================================

-- Allow users to update their own time tracking entries
CREATE POLICY "Users can update their own time tracking" ON time_tracking
    FOR UPDATE USING (user_id = auth.uid() OR auth.role() = 'service_role');

-- Allow users to delete their own time tracking entries
CREATE POLICY "Users can delete their own time tracking" ON time_tracking
    FOR DELETE USING (user_id = auth.uid() OR auth.role() = 'service_role');

-- ============================================================================
-- Task Comments: UPDATE and DELETE policies
-- ============================================================================

-- Allow users to update comments for their ideas
CREATE POLICY "Users can update comments for their ideas" ON task_comments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM tasks t
            JOIN deliverables d ON t.deliverable_id = d.id
            JOIN ideas i ON d.idea_id = i.id
            WHERE t.id = task_comments.task_id
            AND i.user_id = auth.uid()
        ) OR auth.role() = 'service_role'
    );

-- Allow users to delete comments for their ideas
CREATE POLICY "Users can delete comments for their ideas" ON task_comments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM tasks t
            JOIN deliverables d ON t.deliverable_id = d.id
            JOIN ideas i ON d.idea_id = i.id
            WHERE t.id = task_comments.task_id
            AND i.user_id = auth.uid()
        ) OR auth.role() = 'service_role'
    );

-- ============================================================================
-- Breakdown Sessions: UPDATE and DELETE policies
-- ============================================================================

-- Allow users to update breakdown sessions for their ideas
CREATE POLICY "Users can update breakdown sessions for their ideas" ON breakdown_sessions
    FOR UPDATE USING (idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid()) OR auth.role() = 'service_role');

-- Allow users to delete breakdown sessions for their ideas
CREATE POLICY "Users can delete breakdown sessions for their ideas" ON breakdown_sessions
    FOR DELETE USING (idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid()) OR auth.role() = 'service_role');

-- ============================================================================
-- Timelines: UPDATE and DELETE policies
-- ============================================================================

-- Allow users to update timelines for their ideas
CREATE POLICY "Users can update timelines for their ideas" ON timelines
    FOR UPDATE USING (idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid()) OR auth.role() = 'service_role');

-- Allow users to delete timelines for their ideas
CREATE POLICY "Users can delete timelines for their ideas" ON timelines
    FOR DELETE USING (idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid()) OR auth.role() = 'service_role');

-- ============================================================================
-- Risk Assessments: UPDATE and DELETE policies
-- ============================================================================

-- Allow users to update risk assessments for their ideas
CREATE POLICY "Users can update risk assessments for their ideas" ON risk_assessments
    FOR UPDATE USING (
        idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid()) OR
        auth.role() = 'service_role'
    );

-- Allow users to delete risk assessments for their ideas
CREATE POLICY "Users can delete risk assessments for their ideas" ON risk_assessments
    FOR DELETE USING (
        idea_id IN (SELECT id FROM ideas WHERE user_id = auth.uid()) OR
        auth.role() = 'service_role'
    );

-- ============================================================================
-- Summary
-- ============================================================================
-- Policies added:
-- - task_dependencies: UPDATE, DELETE (2 policies)
-- - milestones: DELETE (1 policy)
-- - task_assignments: INSERT, UPDATE, DELETE (3 policies)
-- - time_tracking: UPDATE, DELETE (2 policies)
-- - task_comments: UPDATE, DELETE (2 policies)
-- - breakdown_sessions: UPDATE, DELETE (2 policies)
-- - timelines: UPDATE, DELETE (2 policies)
-- - risk_assessments: UPDATE, DELETE (2 policies)
-- Total: 16 policies added
