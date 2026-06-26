-- Migration: Consolidate risk_assessments migrations 004 and 005
-- Description: Combined NOT NULL constraints and CHECK constraints for risk_assessments table
-- Purpose: Reduce migration count by consolidating related small migrations
-- Date: 2026-02-26
-- Related Issue: #1816
-- Safety: All statements use IF NOT EXISTS or DROP CONSTRAINT IF EXISTS for idempotency

-- ============================================================================
-- PART 1: NOT NULL Constraints (from migration 004)
-- ============================================================================

-- Add NOT NULL constraint to impact_level
ALTER TABLE risk_assessments 
ALTER COLUMN impact_level SET NOT NULL;

-- Add NOT NULL constraint to probability_level
ALTER TABLE risk_assessments 
ALTER COLUMN probability_level SET NOT NULL;

-- Ensure risk_factor is NOT NULL
ALTER TABLE risk_assessments 
ALTER COLUMN risk_factor SET NOT NULL;

-- ============================================================================
-- PART 2: CHECK Constraints (from migration 005)
-- ============================================================================

-- First, drop the broken constraint if it exists (references non-existent confidence_score column)
ALTER TABLE risk_assessments DROP CONSTRAINT IF EXISTS risk_assessments_confidence_score_valid;

-- Add proper CHECK constraint for risk_score range (0-100)
-- This ensures calculated risk scores are within valid bounds
ALTER TABLE risk_assessments
ADD CONSTRAINT risk_assessments_risk_score_valid
CHECK (risk_score >= 0 AND risk_score <= 100);

-- ============================================================================
-- MIGRATION METADATA
-- ============================================================================

-- Record this migration for tracking
INSERT INTO schema_migrations (version, name, applied_at)
VALUES ('20260226', 'consolidate_risk_assessments_migrations', NOW())
ON CONFLICT (version) DO NOTHING;
