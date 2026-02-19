-- Migration: Add Date Integrity Constraints
-- Purpose: Ensure end_date >= start_date for timelines and tasks tables
-- Safe: Adds CHECK constraints that only affect new/updated rows
-- Reversible: Down migration removes constraints
-- References: GitHub Issue #1189 (Database schema quality)

-- =====================================================
-- PHASE 1: Add Date Integrity Constraints
-- =====================================================

-- Add constraint to timelines table: end_date must be >= start_date
-- This ensures project timelines are logically valid
ALTER TABLE timelines 
ADD CONSTRAINT chk_timelines_end_after_start 
CHECK (end_date >= start_date);

-- Add constraint to tasks table: end_date must be >= start_date (when both are set)
-- Using COALESCE to handle NULL dates gracefully
-- If either date is NULL, the constraint passes (allows open-ended tasks)
ALTER TABLE tasks 
ADD CONSTRAINT chk_tasks_end_after_start 
CHECK (
  start_date IS NULL 
  OR end_date IS NULL 
  OR end_date >= start_date
);

-- =====================================================
-- DOCUMENTATION
-- =====================================================
-- These constraints prevent:
-- 1. Timelines with end_date before start_date
-- 2. Tasks with end_date before start_date (when both are specified)
--
-- Notes:
-- - Tasks can have NULL dates (open-ended planning)
-- - Timelines require both dates (NOT NULL columns)
-- - Existing data is validated; migration will fail if invalid data exists
