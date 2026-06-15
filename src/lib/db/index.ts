// Main service exports
export {
  supabaseClient,
  getSupabaseAdmin,
  DatabaseService,
  dbService,
} from './service';

// Re-export sub-services for direct access
export { IdeaService } from './ideas';
export { DeliverableService } from './deliverables';
export { TaskService } from './tasks';
export { VectorService } from './vectors';
export { ClarificationService } from './clarification';

// Re-export types
export * from './types';

// Re-export ClientProvider interface for custom implementations
export type { ClientProvider } from './ideas';
