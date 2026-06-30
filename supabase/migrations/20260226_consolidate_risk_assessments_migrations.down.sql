-- Rollback: Consolidate risk_assessments migrations 004 and 005
-- Description: Reverts the consolidated NOT NULL and CHECK constraints
-- Date: 2026-02-26

-- ============================================================================
-- PART 1: Remove CHECK Constraints (from migration 005)
-- ============================================================================

-- Remove risk_score CHECK constraint
ALTER TABLE risk_assessments 
DROP CONSTRAINT IF EXISTS risk_assessments_risk_score_valid;

-- ============================================================================
-- PART 2: Remove NOT NULL Constraints (from migration 004)
-- ============================================================================

-- Remove NOT NULL constraint from risk_factor
ALTER TABLE risk_assessments 
ALTER COLUMN risk_factor DROP NOT NULL;

-- Remove NOT NULL constraint from probability_level
ALTER TABLE risk_assessments 
ALTER COLUMN probability_level DROP NOT NULL;

-- Remove NOT NULL constraint from impact_level
ALTER TABLE risk_assessments 
ALTER COLUMN impact_level DROP NOT NULL;

-- Remove migration metadata
DELETE FROM schema_migrations WHERE version = '20260226';
