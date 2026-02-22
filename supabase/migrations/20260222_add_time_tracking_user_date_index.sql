-- Migration: Add composite index for time_tracking user_id + date_logged
-- Purpose: Optimize queries filtering by user and ordering by date
-- Addresses: GitHub Issues #1189 and #1172 (Database schema quality)
-- Author: database-architect specialist
-- Date: 2026-02-22
-- Safe: Non-destructive, adds index only
-- Reversible: Down migration removes the index

-- ============================================================================
-- Performance Enhancement
-- ============================================================================

-- Add composite index for time_tracking queries filtering by user and date
-- This optimizes common query patterns:
-- 1. "Show all time entries for a user, ordered by date"
-- 2. "Get user's recent time entries"
-- 3. "Generate user time reports by date"
-- 4. "Calculate daily/weekly totals for a user"
--
-- Example queries optimized:
-- SELECT * FROM time_tracking WHERE user_id = X ORDER BY date_logged DESC;
-- SELECT SUM(hours_logged) FROM time_tracking WHERE user_id = X AND date_logged >= Y;
-- SELECT * FROM time_tracking WHERE user_id = X ORDER BY date_logged DESC LIMIT 10;
--
-- Note: Using DESC ordering on date_logged because most queries want recent entries first
-- The existing idx_time_tracking_date_logged already supports this pattern globally,
-- but this composite index is more efficient for user-scoped queries.

CREATE INDEX IF NOT EXISTS idx_time_tracking_user_date 
    ON time_tracking(user_id, date_logged DESC);

-- Add comment to document the index purpose
COMMENT ON INDEX idx_time_tracking_user_date IS 
    'Composite index for optimizing time_tracking queries filtering by user and ordering by date - supports user time reports and recent entries';
