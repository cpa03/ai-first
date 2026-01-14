-- Migration: Add Data Integrity Constraints
-- Description: Add CHECK constraints to ensure data validity
-- Version: 002
-- Date: 2026-01-08

-- Ensure task estimates are non-negative
ALTER TABLE tasks 
ADD CONSTRAINT tasks_estimate_non_negative 
CHECK (estimate >= 0);

-- Ensure task priority is within reasonable range
ALTER TABLE tasks 
ADD CONSTRAINT tasks_priority_valid 
CHECK (priority >= 0 AND priority <= 100);

-- Ensure deliverable estimate_hours is non-negative
ALTER TABLE deliverables 
ADD CONSTRAINT deliverables_estimate_hours_non_negative 
CHECK (estimate_hours >= 0);

-- Ensure deliverable priority is within reasonable range
ALTER TABLE deliverables 
ADD CONSTRAINT deliverables_priority_valid 
CHECK (priority >= 0 AND priority <= 100);

-- Ensure task allocation_percentage is valid (already exists, but adding explicit constraint for clarity)
ALTER TABLE task_assignments 
ADD CONSTRAINT task_assignments_allocation_percentage_valid 
CHECK (allocation_percentage > 0 AND allocation_percentage <= 100);

-- Ensure time tracking hours_logged is valid (already exists, but adding explicit constraint for clarity)
ALTER TABLE time_tracking 
ADD CONSTRAINT time_tracking_hours_logged_valid 
CHECK (hours_logged > 0);

-- Ensure risk score is within valid range (already exists, but adding explicit constraint for completeness)
ALTER TABLE risk_assessments 
ADD CONSTRAINT risk_assessments_confidence_score_valid 
CHECK (confidence_score >= 0 AND confidence_score <= 1);

-- Ensure task complexity_score is valid (already exists, but adding explicit constraint for completeness)
ALTER TABLE tasks 
ADD CONSTRAINT tasks_complexity_score_valid 
CHECK (complexity_score >= 1 AND complexity_score <= 10);

-- Ensure task priority_score is non-negative
ALTER TABLE tasks 
ADD CONSTRAINT tasks_priority_score_valid 
CHECK (priority_score >= 0);

-- Ensure deliverable completion_percentage is valid (already exists, but adding explicit constraint for completeness)
ALTER TABLE deliverables 
ADD CONSTRAINT deliverables_completion_percentage_valid 
CHECK (completion_percentage >= 0 AND completion_percentage <= 100);

-- Ensure task completion_percentage is valid (already exists, but adding explicit constraint for completeness)
ALTER TABLE tasks 
ADD CONSTRAINT tasks_completion_percentage_valid 
CHECK (completion_percentage >= 0 AND completion_percentage <= 100);

-- Ensure task actual_hours is non-negative
ALTER TABLE tasks 
ADD CONSTRAINT tasks_actual_hours_non_negative 
CHECK (actual_hours >= 0);

-- Ensure deliverable business_value is non-negative
ALTER TABLE deliverables 
ADD CONSTRAINT deliverables_business_value_valid 
CHECK (business_value >= 0);

-- Ensure milestone priority is within reasonable range
ALTER TABLE milestones 
ADD CONSTRAINT milestones_priority_valid 
CHECK (priority >= 0 AND priority <= 100);
