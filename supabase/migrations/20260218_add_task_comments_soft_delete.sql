-- Migration: Add Soft Delete Support to task_comments Table
-- Purpose: Add deleted_at column for soft delete capability
-- Reference: Issue #1172 - Database Architecture Schema Quality
-- Safe: Non-destructive, adds new column with default NULL
-- Reversible: Down migration removes the column and index

-- =====================================================
-- Add deleted_at column for soft delete support
-- =====================================================

-- Add deleted_at column to task_comments table
-- This enables soft delete pattern consistent with other tables
ALTER TABLE task_comments 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Add index for soft delete queries (common pattern: WHERE deleted_at IS NULL)
CREATE INDEX IF NOT EXISTS idx_task_comments_deleted_at 
ON task_comments(deleted_at);

-- =====================================================
-- Comments
-- =====================================================

-- The deleted_at column enables soft delete pattern:
-- - NULL = record is active
-- - TIMESTAMP = record is soft-deleted
-- 
-- This is consistent with:
-- - ideas table (deleted_at column)
-- - deliverables table (deleted_at column)
-- - tasks table (deleted_at column)
--
-- Benefits:
-- 1. Data recovery capability
-- 2. Audit trail preservation
-- 3. Cascade behavior control
-- 4. Compliance with data retention policies
