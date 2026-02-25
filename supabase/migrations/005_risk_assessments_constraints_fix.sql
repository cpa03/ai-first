-- Migration: Fix risk_assessments constraints
-- Description: Fix broken confidence_score constraint and add proper risk_score validation
-- Version: 005
-- Date: 2026-02-16
-- Issue: #1134

-- First, drop the broken constraint if it exists (references non-existent confidence_score column)
ALTER TABLE risk_assessments DROP CONSTRAINT IF EXISTS risk_assessments_confidence_score_valid;

-- Add proper CHECK constraint for risk_score range (0-100)
-- This ensures calculated risk scores are within valid bounds
ALTER TABLE risk_assessments
ADD CONSTRAINT risk_assessments_risk_score_valid
CHECK (risk_score >= 0 AND risk_score <= 100);

-- Note: NOT NULL constraints for impact_level and probability_level
-- are handled in migration 004_risk_assessments_not_null_constraints.sql
