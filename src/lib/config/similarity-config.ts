/**
 * Similarity Configuration
 * Centralizes similarity search defaults and thresholds
 * Eliminates hardcoded values from similarity-service.ts and API routes
 */

import { EnvLoader } from './environment';

/**
 * Similarity search configuration
 * All values have sensible defaults but can be overridden via environment variables
 */
export const SIMILARITY_CONFIG = {
  /** Default number of similar ideas to return - Default: 5 */
  DEFAULT_LIMIT: EnvLoader.number('SIMILARITY_DEFAULT_LIMIT', 5, 1, 50),

  /** Maximum number of similar ideas allowed - Default: 20 */
  MAX_LIMIT: EnvLoader.number('SIMILARITY_MAX_LIMIT', 20, 1, 100),

  /** Minimum number of similar ideas allowed - Default: 1 */
  MIN_LIMIT: EnvLoader.number('SIMILARITY_MIN_LIMIT', 1, 1, 10),

  /** Default similarity threshold (0-1) - Default: 0.7 */
  DEFAULT_THRESHOLD: EnvLoader.number(
    'SIMILARITY_DEFAULT_THRESHOLD',
    0.7,
    0,
    1
  ),

  /** Minimum similarity threshold (0-1) - Default: 0.1 */
  MIN_THRESHOLD: EnvLoader.number('SIMILARITY_MIN_THRESHOLD', 0.1, 0, 1),

  /** Maximum similarity threshold (0-1) - Default: 0.99 */
  MAX_THRESHOLD: EnvLoader.number('SIMILARITY_MAX_THRESHOLD', 0.99, 0, 1),

  /** Buffer count for vector search (excludes current idea) - Default: 1 */
  SEARCH_BUFFER: EnvLoader.number('SIMILARITY_SEARCH_BUFFER', 1, 0, 10),
} as const;

export type SimilarityConfig = typeof SIMILARITY_CONFIG;
