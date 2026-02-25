-- Down Migration: Revert risk_assessments constraint fixes
-- Description: Remove risk_score constraint and restore broken confidence_score constraint placeholder
-- Version: 005
-- Date: 2026-02-16

-- Remove the risk_score constraint
ALTER TABLE risk_assessments DROP CONSTRAINT IF EXISTS risk_assessments_risk_score_valid;
