-- Rollback Migration: Remove Risk Score Index from risk_assessments Table
-- Purpose: Reverse the changes made in 20260221_add_risk_assessments_risk_score_index.sql
-- Date: 2026-02-21
-- Safety: Low risk - removing indexes doesn't modify data
-- Author: database-architect specialist

-- ============================================================================
-- Remove indexes
-- ============================================================================

-- Remove composite index for idea_id + risk_score queries
DROP INDEX IF EXISTS idx_risk_assessments_idea_risk_score;

-- Remove single column index for risk_score sorting
DROP INDEX IF EXISTS idx_risk_assessments_risk_score;

-- ============================================================================
-- Rollback Complete
-- ============================================================================
-- Changes reversed:
-- 1. Removed idx_risk_assessments_idea_risk_score composite index
-- 2. Removed idx_risk_assessments_risk_score index
--
-- Note: Query performance for risk_score operations will revert to
-- full table scans on large datasets.
