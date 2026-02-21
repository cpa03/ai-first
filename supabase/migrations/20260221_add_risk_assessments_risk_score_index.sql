-- Migration: Add Risk Score Index to risk_assessments Table
-- Purpose: Improve query performance for risk score sorting and filtering
-- Date: 2026-02-21
-- Issue: #1189, #1172 (database architecture improvements)
-- Safety: Low risk - adding index doesn't modify data
-- Author: database-architect specialist

-- ============================================================================
-- Background
-- ============================================================================
-- The risk_assessments table has a risk_score column used for:
-- 1. Sorting risks by severity (highest risk first)
-- 2. Filtering risks above/below certain thresholds
-- 3. Dashboard queries showing top risks by score
--
-- Currently, there is no index on the risk_score column, which means:
-- - Queries ordering by risk_score DESC require full table scan
-- - Dashboard queries filtering by risk_score range are inefficient
-- - As risk_assessments grow, query performance degrades
--
-- This migration adds:
-- 1. An index on risk_score for efficient sorting
-- 2. A composite index on (idea_id, risk_score DESC) for common query pattern

-- ============================================================================
-- Add index for risk_score sorting
-- ============================================================================

-- Single column index for risk_score descending order
-- Optimizes: ORDER BY risk_score DESC
-- Also supports: WHERE risk_score > X
CREATE INDEX IF NOT EXISTS idx_risk_assessments_risk_score
ON risk_assessments(risk_score DESC NULLS LAST);

-- ============================================================================
-- Add composite index for idea_id + risk_score queries
-- ============================================================================

-- Composite index for filtering by idea and sorting by risk score
-- Optimizes common dashboard query pattern:
--   SELECT * FROM risk_assessments
--   WHERE idea_id = X
--   ORDER BY risk_score DESC
CREATE INDEX IF NOT EXISTS idx_risk_assessments_idea_risk_score
ON risk_assessments(idea_id, risk_score DESC NULLS LAST);

-- ============================================================================
-- Summary
-- ============================================================================
-- Changes made:
-- 1. Added idx_risk_assessments_risk_score index for risk_score sorting
-- 2. Added idx_risk_assessments_idea_risk_score composite index for
--    idea-filtered risk score queries
--
-- Performance improvements:
-- - Risk dashboard queries can efficiently sort by risk_score DESC
-- - Queries filtering risks by idea_id and sorting by score are optimized
-- - NULL values are sorted last to ensure proper ordering with missing scores
