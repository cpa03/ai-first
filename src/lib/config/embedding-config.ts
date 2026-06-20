/**
 * Embedding Configuration
 *
 * Centralizes embedding model defaults and limits.
 * Follows the "Flexy" principle: eliminate hardcoded values and make
 * everything modular and configurable.
 *
 * Replaces hardcoded 'text-embedding-3-small' in embedding-service.ts
 * and other embedding-related magic values.
 *
 * All values support environment variable overrides via EnvLoader.
 */

import { EnvLoader } from './environment';

/**
 * Embedding service configuration
 * All values have sensible defaults but can be overridden via environment variables
 */
export const EMBEDDING_CONFIG = {
  /**
   * Default embedding model for OpenAI embeddings
   * Env: EMBEDDING_MODEL (default: 'text-embedding-3-small')
   */
  DEFAULT_MODEL: EnvLoader.string('EMBEDDING_MODEL', 'text-embedding-3-small'),

  /**
   * Maximum text length for embedding generation (characters)
   * Prevents sending excessively large texts to the embedding API
   * Env: EMBEDDING_MAX_TEXT_LENGTH (default: 8191)
   */
  MAX_TEXT_LENGTH: EnvLoader.number(
    'EMBEDDING_MAX_TEXT_LENGTH',
    8191,
    100,
    100000
  ),

  /**
   * Default dimension for embedding vectors
   * Used when storing and comparing embeddings
   * Env: EMBEDDING_DIMENSIONS (default: 1536)
   */
  DIMENSIONS: EnvLoader.number('EMBEDDING_DIMENSIONS', 1536, 128, 4096),

  /**
   * Default batch size for bulk embedding operations
   * Env: EMBEDDING_BATCH_SIZE (default: 20)
   */
  BATCH_SIZE: EnvLoader.number('EMBEDDING_BATCH_SIZE', 20, 1, 100),

  /**
   * Fallback characters-per-token ratio when token count unavailable
   * Env: EMBEDDING_CHARS_PER_TOKEN (default: 4)
   */
  CHARS_PER_TOKEN: EnvLoader.number('EMBEDDING_CHARS_PER_TOKEN', 4, 1, 10),
} as const;

export type EmbeddingConfig = typeof EMBEDDING_CONFIG;
