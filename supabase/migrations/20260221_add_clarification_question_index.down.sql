-- Down Migration: Remove clarification_answers question indexes
-- Description: Rollback for 20260221_add_clarification_question_index.sql
-- Author: database-architect specialist
-- Date: 2026-02-21

-- Drop the question_id index
DROP INDEX IF EXISTS idx_clarification_answers_question_id;

-- Drop the composite session_id + question_id index
DROP INDEX IF EXISTS idx_clarification_answers_session_question;
