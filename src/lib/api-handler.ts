/**
 * API Handler - Backward Compatibility Wrapper
 *
 * DEPRECATED: This file is maintained for backward compatibility.
 * Please import from @/lib/api-handler instead.
 *
 * The functionality has been split into focused modules:
 * - @/lib/api-handler/types - TypeScript interfaces and types
 * - @/lib/api-handler/response - Response helper functions
 * - @/lib/api-handler/wrapper - Main withApiHandler function
 * - @/lib/api-handler - Main export (index.ts)
 *
 * @deprecated Import from @/lib/api-handler for new code
 */

// Re-export everything from the new modular structure for backward compatibility
export * from './api-handler/index';
