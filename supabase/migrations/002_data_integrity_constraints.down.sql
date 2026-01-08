-- Down Migration: Remove Data Integrity Constraints
-- Description: Remove CHECK constraints added in migration 002
-- Version: 002
-- Date: 2026-01-08

-- Remove task constraints
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_estimate_non_negative;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_priority_valid;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_complexity_score_valid;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_priority_score_valid;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_completion_percentage_valid;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_actual_hours_non_negative;

-- Remove deliverable constraints
ALTER TABLE deliverables DROP CONSTRAINT IF EXISTS deliverables_estimate_hours_non_negative;
ALTER TABLE deliverables DROP CONSTRAINT IF EXISTS deliverables_priority_valid;
ALTER TABLE deliverables DROP CONSTRAINT IF EXISTS deliverables_completion_percentage_valid;
ALTER TABLE deliverables DROP CONSTRAINT IF EXISTS deliverables_business_value_valid;

-- Remove task_assignments constraints
ALTER TABLE task_assignments DROP CONSTRAINT IF EXISTS task_assignments_allocation_percentage_valid;

-- Remove time_tracking constraints
ALTER TABLE time_tracking DROP CONSTRAINT IF EXISTS time_tracking_hours_logged_valid;

-- Remove risk_assessments constraints
ALTER TABLE risk_assessments DROP CONSTRAINT IF EXISTS risk_assessments_confidence_score_valid;

-- Remove milestones constraints
ALTER TABLE milestones DROP CONSTRAINT IF EXISTS milestones_priority_valid;
