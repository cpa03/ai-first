-- Migration: Add index on clarification_answers.question_id
-- Description: Improves query performance when filtering answers by question type
-- Related Issues: #1189, #1172
-- Author: database-architect specialist
-- Date: 2026-02-21

-- Add index for question_id lookups
-- This is a common query pattern when filtering clarification answers by question type
-- Example query: SELECT * FROM clarification_answers WHERE question_id = 'project_scope'
CREATE INDEX IF NOT EXISTS idx_clarification_answers_question_id 
    ON clarification_answers(question_id);

-- Add composite index for session_id + question_id queries
-- This optimizes the common pattern of looking up specific questions within a session
-- Example query: SELECT * FROM clarification_answers WHERE session_id = X AND question_id = Y
CREATE INDEX IF NOT EXISTS idx_clarification_answers_session_question 
    ON clarification_answers(session_id, question_id);
