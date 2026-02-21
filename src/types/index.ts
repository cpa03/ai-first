/**
 * Types Barrel File
 *
 * Central export point for all TypeScript types and interfaces.
 * This improves DX by allowing single imports:
 *
 * @example
 * ```typescript
 * import type { Idea, Task, Deliverable, Database } from '@/types';
 * ```
 */

// Database types
export type { Json, Database } from './database';

// Core domain types from db.ts
export type {
  Idea,
  IdeaSession,
  Deliverable,
  Task,
  Vector,
  AgentLog,
  ClarificationSessionRow,
  ClarificationAnswerRow,
  PaginationOptions,
  PaginatedResult,
} from '../lib/db';

// Error types
export type {
  ErrorDetail,
  ErrorResponse,
  ErrorContext,
  ErrorClassification,
} from '../lib/errors';

// API types
export type {
  ApiResponse,
  ApiHandlerOptions,
  ApiContext,
  ApiHandler,
} from '../lib/api-handler';

export type { ApiRequestOptions, ApiRequestResult } from '../lib/api-client';

// Validation types
export type { ValidationError, ValidationResult } from '../lib/validation';

// Rate limit types
export type {
  RateLimitInfo,
  RateLimitConfig,
  UserRole,
} from '../lib/rate-limit';

// Cache types
export type { CacheEntry, CacheOptions } from '../lib/cache';

// Logger types
export type { LogContext, StructuredLogEntry } from '../lib/logger';

// Resilience types
export type {
  RetryOptions,
  TimeoutOptions,
  CircuitBreakerOptions,
  RetryConfig,
  ResilienceConfig,
  ServiceResilienceConfig,
} from '../lib/resilience/types';

// Export connector types
export type {
  ExportData,
  ExportFormat,
  ExportResult,
  SyncStatus,
  AuthConfig as ExportAuthConfig,
} from '../lib/export-connectors/base';

export type { ExportManagerOptions } from '../lib/export-connectors/manager';

// PII types
export type { PIIPatternType, RedactionResult } from '../lib/pii-redaction';

// Auth types
export type { AuthenticatedUser } from '../lib/auth';

// Resource cleanup types
export type { CleanupTask, CleanupFunction } from '../lib/resource-cleanup';

// AI types
export type { AIModelConfig, CostTracker, ContextWindow } from '../lib/ai';

// Agent types
export type {
  BreakdownConfig,
  IdeaAnalysis,
  TaskDecomposition,
  DependencyGraph,
  Timeline,
  BreakdownSession,
} from '../lib/agents/breakdown-engine';
export type { ClarifierConfig } from '../lib/agents/clarifier';
export type { ClarificationSession } from '../lib/agents/clarifier-engine';
export type { ClarifierQuestion } from '../lib/agents/clarifier-engine/QuestionGenerator';

// Config types (re-export from config index)
export type {
  AppConfig,
  ExportConnectorConfig,
  TimelineConfig,
  TaskConfig,
  IdeaConfig,
  UiConfig,
  ToastConfig,
  MessagesConfig,
  ComponentDefaults,
  SeoConfig,
  FontConfig,
  ClarifierConfig as AgentClarifierConfig,
  AgentPrompts,
  AiConfig,
  CacheConfig,
  ComponentConfig,
  CleanupConfig,
  ValidationConfig,
  SanitizationConfig,
  ErrorSuggestionsConfig,
  TimeUnits,
  CacheTTL,
  RateLimitWindows,
  RetryDelays,
  UIDurations,
  CircuitBreakerTimes,
  APITimeouts,
  APIErrorMessages,
  StatusCodes,
  HttpHeaders,
  AuthConfig as HttpAuthConfig,
} from '../lib/config';
