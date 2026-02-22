-- Up Migration
-- Description: Add composite index for risk_assessments(status, risk_score DESC) to optimize
-- the common query pattern of filtering by status and ordering by risk score.
-- This addresses GitHub Issue #1189 and #1172 (Database schema quality improvements).
--
-- Query Pattern Optimized:
-- SELECT * FROM risk_assessments WHERE status = 'open' ORDER BY risk_score DESC;
--
-- Performance Impact:
-- - Before: Uses idx_risk_assessments_status for filtering, then sorts in memory
-- - After: Uses composite index for both filtering AND ordering (no sort needed)
-- - Estimated improvement: 30-50% faster for risk dashboard queries

-- Create composite index for status + risk_score queries
-- Uses NULLS LAST to ensure NULL risk_scores appear at the end
CREATE INDEX IF NOT EXISTS idx_risk_assessments_status_risk_score
    ON risk_assessments(status, risk_score DESC NULLS LAST);

-- Add comment documenting the index purpose
COMMENT ON INDEX idx_risk_assessments_status_risk_score IS
    'Composite index for efficient queries filtering by status and ordering by risk_score. Optimizes risk dashboard queries like "show all open risks ordered by severity".';
