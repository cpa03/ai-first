-- Down Migration
-- Description: Rollback the composite index for risk_assessments(status, risk_score DESC)
-- This is safe to run as it only removes the index, not any data.

DROP INDEX IF EXISTS idx_risk_assessments_status_risk_score;
