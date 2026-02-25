-- Migration: Rollback NOT NULL constraints on risk_assessments table
-- Description: Remove NOT NULL constraints for impact_level, probability_level, and risk_factor
-- Version: 004 (down)
-- Date: 2026-02-18

-- Remove NOT NULL constraint from risk_factor
ALTER TABLE risk_assessments 
ALTER COLUMN risk_factor DROP NOT NULL;

-- Remove NOT NULL constraint from probability_level
ALTER TABLE risk_assessments 
ALTER COLUMN probability_level DROP NOT NULL;

-- Remove NOT NULL constraint from impact_level
ALTER TABLE risk_assessments 
ALTER COLUMN impact_level DROP NOT NULL;
