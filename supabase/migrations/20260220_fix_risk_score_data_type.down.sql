-- Down Migration: Revert risk_score data type in risk_assessments table
-- Description: Revert DECIMAL(5,2) back to DECIMAL(3,2)
-- Warning: This will fail if any risk_score values exceed 9.99
-- Date: 2026-02-20

-- Revert the risk_score column data type
-- Note: This will fail if any values exceed 9.99
ALTER TABLE risk_assessments 
ALTER COLUMN risk_score TYPE DECIMAL(3,2) USING risk_score::DECIMAL(3,2);
