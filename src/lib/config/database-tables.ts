/**
 * Database Tables and RPC Configuration
 *
 * Centralizes all Supabase table names and RPC function names.
 * Follows the "Flexy" principle: eliminate hardcoded values and make
 * everything modular and configurable.
 *
 * Replaces hardcoded table names scattered throughout:
 * - src/lib/db/*.ts (ideas, vectors, tasks, deliverables, etc.)
 * - src/lib/similarity-service.ts
 * - src/lib/ai.ts
 *
 * ## Why Centralize Table Names?
 *
 * While table names are tied to the database schema, centralizing them:
 * 1. Provides a single source of truth for all table references
 * 2. Enables easy refactoring if tables are renamed
 * 3. Prevents typos (TypeScript catches references to centralized constants)
 * 4. Makes schema changes easier to track and audit
 *
 * All values support environment variable overrides via EnvLoader.
 */

import { EnvLoader } from './environment';

/**
 * Database table names
 * All Supabase table names used in the application
 */
export const DB_TABLES = {
  /**
   * Ideas table - stores user project ideas
   * Env: DB_TABLE_IDEAS (default: 'ideas')
   */
  IDEAS: EnvLoader.string('DB_TABLE_IDEAS', 'ideas'),

  /**
   * Idea sessions table - stores clarification sessions for ideas
   * Env: DB_TABLE_IDEA_SESSIONS (default: 'idea_sessions')
   */
  IDEA_SESSIONS: EnvLoader.string('DB_TABLE_IDEA_SESSIONS', 'idea_sessions'),

  /**
   * Deliverables table - stores project deliverables
   * Env: DB_TABLE_DELIVERABLES (default: 'deliverables')
   */
  DELIVERABLES: EnvLoader.string('DB_TABLE_DELIVERABLES', 'deliverables'),

  /**
   * Tasks table - stores individual tasks within deliverables
   * Env: DB_TABLE_TASKS (default: 'tasks')
   */
  TASKS: EnvLoader.string('DB_TABLE_TASKS', 'tasks'),

  /**
   * Vectors table - stores embedding vectors for similarity search
   * Env: DB_TABLE_VECTORS (default: 'vectors')
   */
  VECTORS: EnvLoader.string('DB_TABLE_VECTORS', 'vectors'),

  /**
   * Clarification sessions table - stores clarification flow sessions
   * Env: DB_TABLE_CLARIFICATION_SESSIONS (default: 'clarification_sessions')
   */
  CLARIFICATION_SESSIONS: EnvLoader.string(
    'DB_TABLE_CLARIFICATION_SESSIONS',
    'clarification_sessions'
  ),

  /**
   * Clarification answers table - stores answers to clarification questions
   * Env: DB_TABLE_CLARIFICATION_ANSWERS (default: 'clarification_answers')
   */
  CLARIFICATION_ANSWERS: EnvLoader.string(
    'DB_TABLE_CLARIFICATION_ANSWERS',
    'clarification_answers'
  ),

  /**
   * Agent logs table - stores AI agent action logs
   * Env: DB_TABLE_AGENT_LOGS (default: 'agent_logs')
   */
  AGENT_LOGS: EnvLoader.string('DB_TABLE_AGENT_LOGS', 'agent_logs'),
} as const;

/**
 * Database RPC function names
 * All Supabase RPC function names used in the application
 */
export const DB_RPC = {
  /**
   * Match vectors function - finds similar vectors using embedding similarity
   * Env: DB_RPC_MATCH_VECTORS (default: 'match_vectors')
   */
  MATCH_VECTORS: EnvLoader.string('DB_RPC_MATCH_VECTORS', 'match_vectors'),
} as const;

/**
 * Database reference types
 * Used in the vectors table to distinguish different embedding sources
 */
export const DB_REFERENCE_TYPES = {
  /**
   * Reference type for idea embeddings
   * Env: DB_REF_TYPE_IDEA (default: 'idea')
   */
  IDEA: EnvLoader.string('DB_REF_TYPE_IDEA', 'idea'),
} as const;

/**
 * Database column names that are frequently referenced
 * Centralizes commonly used column names for consistency
 */
export const DB_COLUMNS = {
  ID: 'id',
  IDEA_ID: 'idea_id',
  USER_ID: 'user_id',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
  DELETED_AT: 'deleted_at',
  STATUS: 'status',
  EMBEDDING: 'embedding',
  REFERENCE_TYPE: 'reference_type',
  REFERENCE_ID: 'reference_id',
  VECTOR_DATA: 'vector_data',
  SESSION_ID: 'session_id',
  QUESTION_ID: 'question_id',
  DELIVERABLE_ID: 'deliverable_id',
  AGENT: 'agent',
  ACTION: 'action',
  PAYLOAD: 'payload',
  TIMESTAMP: 'timestamp',
  TITLE: 'title',
  RAW_TEXT: 'raw_text',
} as const;

export type DbTables = typeof DB_TABLES;
export type DbRpc = typeof DB_RPC;
export type DbReferenceTypes = typeof DB_REFERENCE_TYPES;
export type DbColumns = typeof DB_COLUMNS;
