-- Migration: Fix risk_score data type in risk_assessments table
-- Description: Change DECIMAL(3,2) to DECIMAL(5,2) to properly support 0-100 range
-- Issue: The CHECK constraint allows 0-100 but DECIMAL(3,2) can only store -9.99 to 9.99
-- References: GitHub Issue #1172 (Database Architecture Quality)
-- Date: 2026-02-20

-- Alter the risk_score column data type
-- Using USING clause to safely convert existing data
ALTER TABLE risk_assessments 
ALTER COLUMN risk_score TYPE DECIMAL(5,2) USING risk_score::DECIMAL(5,2);
