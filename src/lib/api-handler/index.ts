/**
 * API Handler Module
 *
 * Provides modular API handler utilities for Next.js API routes.
 * This module is organized into focused sub-modules:
 *
 * - types: TypeScript interfaces and types
 * - response: Response helper functions
 * - wrapper: Main withApiHandler function
 *
 * For backward compatibility, imports from the main api-handler.ts
 * will continue to work via re-exports.
 */

// Re-export types
export type {
  ApiResponse,
  ApiHandlerOptions,
  ApiContext,
  ApiHandler,
} from './types';

// Re-export response helpers
export {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  standardSuccessResponse,
} from './response';

// Re-export main wrapper
export { withApiHandler } from './wrapper';
