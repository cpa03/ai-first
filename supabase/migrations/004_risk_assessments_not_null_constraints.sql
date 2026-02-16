-- Migration: Add NOT NULL constraints to risk_assessments table
-- Description: Add NOT NULL constraints for impact_level and probability_level
-- Version: 004
-- Date: 2026-02-16

-- Add NOT NULL constraint to impact_level
ALTER TABLE risk_assessments 
ALTER COLUMN impact_level SET NOT NULL;

-- Add NOT NULL constraint to probability_level
ALTER TABLE risk_assessments 
ALTER COLUMN probability_level SET NOT NULL;

-- Ensure risk_factor is NOT NULL
ALTER TABLE risk_assessments 
ALTER COLUMN risk_factor SET NOT NULL;
