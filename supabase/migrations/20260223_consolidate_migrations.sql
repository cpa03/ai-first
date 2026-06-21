-- Migration: 20260223_consolidate_migrations
-- Description: Additional performance indexes (beyond 20260222 consolidation)
-- Purpose: Add remaining indexes not covered in 20260222
-- Date: 2026-02-23
-- Related Issue: #1816
-- Note: Base consolidation already applied in 20260222_consolidate_performance_indexes
-- Safety: All statements use IF NOT EXISTS for idempotency

-- ============================================================================
-- ADDITIONAL PERFORMANCE INDEXES (not in 20260222)
-- ============================================================================

-- User activity query optimization
CREATE INDEX IF NOT EXISTS idx_ideas_user_created
ON ideas(user_id, created_at DESC);

-- Task filtering by deliverable and status
CREATE INDEX IF NOT EXISTS idx_tasks_deliverable_status
ON tasks(deliverable_id, status);

-- Deliverable priority sorting
CREATE INDEX IF NOT EXISTS idx_deliverables_idea_priority
ON deliverables(idea_id, priority DESC);

-- Agent log queries by agent
CREATE INDEX IF NOT EXISTS idx_agent_logs_agent_timestamp
ON agent_logs(agent, timestamp DESC);

-- ============================================================================
-- MIGRATION METADATA
-- ============================================================================
-- This migration adds indexes not covered in 20260222_consolidate_performance_indexes
-- Safe to apply after 20260222 migration
