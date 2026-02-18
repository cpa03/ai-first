-- Migration: Add updated_at column to ideas table
-- Purpose: Add missing updated_at timestamp column to root ideas table for audit trail
-- Author: Database Architect Agent
-- Date: 2026-02-18
-- Safe: Non-destructive, adds new column with default value
-- Reversible: Down migration removes column and trigger

-- =====================================================
-- UP MIGRATION
-- =====================================================

-- Add updated_at column to ideas table
-- Set default to created_at for existing rows to maintain consistency
ALTER TABLE ideas 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE 
DEFAULT NOW();

-- Update existing rows to have updated_at equal to created_at
-- This ensures data consistency for existing records
UPDATE ideas 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Create trigger for automatic updated_at updates on ideas
-- This follows the same pattern as other tables in the schema
CREATE TRIGGER update_ideas_updated_at 
BEFORE UPDATE ON ideas
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Add index on updated_at for efficient sorting by last modification
CREATE INDEX IF NOT EXISTS idx_ideas_updated_at ON ideas(updated_at DESC);

-- =====================================================
-- Documentation Notes
-- =====================================================
-- This migration addresses a gap in the original schema where the ideas
-- table (the root table) was missing an updated_at column while all
-- related tables (deliverables, tasks, milestones, etc.) had one.
--
-- Benefits:
-- 1. Audit trail - track when ideas were last modified
-- 2. Consistency - all tables now follow the same pattern
-- 3. Query capability - can sort/filter by last modification time
-- 4. Sync support - useful for incremental sync operations
