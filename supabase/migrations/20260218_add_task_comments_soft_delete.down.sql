-- Down Migration: Remove Soft Delete Support from task_comments Table
-- Purpose: Rollback migration 20260218_add_task_comments_soft_delete.sql
-- Reverses: Adds deleted_at column and index

-- =====================================================
-- Remove deleted_at column and index
-- =====================================================

-- Drop index first (depends on column)
DROP INDEX IF EXISTS idx_task_comments_deleted_at;

-- Drop column
ALTER TABLE task_comments 
DROP COLUMN IF EXISTS deleted_at;

-- =====================================================
-- Notes
-- =====================================================

-- WARNING: This will permanently remove soft delete data
-- Any records with non-NULL deleted_at will lose their deletion status
-- Consider data backup before running this down migration
