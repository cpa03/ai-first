-- Migration: Remove Date Integrity Constraints (Down)
-- Purpose: Rollback 20260219_add_date_integrity_constraints.sql
-- Safe: Drops constraints only, no data modification

ALTER TABLE timelines 
DROP CONSTRAINT IF EXISTS chk_timelines_end_after_start;

ALTER TABLE tasks 
DROP CONSTRAINT IF EXISTS chk_tasks_end_after_start;
