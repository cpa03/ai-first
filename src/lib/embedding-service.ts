/**
 * Embedding Service
 *
 * Provides embedding generation for vector similarity search.
 * Uses OpenAI's text-embedding-3-small model by default (configurable via EMBEDDING_CONFIG).
 */

import 'openai/shims/node';
import OpenAI from 'openai';
import { createLogger } from './logger';
import { EMBEDDING_CONFIG } from './config/embedding-config';
import { API_ERROR_MESSAGES } from './config';

const logger = createLogger('EmbeddingService');

// Singleton OpenAI client
let openaiClient: OpenAI | null = null;

/**
 * Initialize the OpenAI client if not already done
 */
function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(API_ERROR_MESSAGES.PAGE.OPENAI_API_KEY_MISSING);
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  tokens: number;
}

/**
 * Generate embeddings for text using OpenAI's embedding models.
 * Uses text-embedding-3-small by default for best quality/cost ratio.
 *
 * @param text - The text to generate embeddings for
 * @param model - Optional model override (defaults to EMBEDDING_CONFIG.DEFAULT_MODEL)
 * @returns Promise<EmbeddingResult> with embedding vector, model, and token count
 */
export async function generateEmbedding(
  text: string,
  model: string = EMBEDDING_CONFIG.DEFAULT_MODEL
): Promise<EmbeddingResult> {
  if (!text || text.trim().length === 0) {
    throw new Error(API_ERROR_MESSAGES.PAGE.TEXT_EMPTY_EMBEDDING);
  }

  const client = getOpenAIClient();
  const trimmedText = text.trim();

  try {
    const response = await client.embeddings.create({
      model,
      input: trimmedText,
    });

    if (!response || !response.data || response.data.length === 0) {
      throw new Error(API_ERROR_MESSAGES.AI.INVALID_RESPONSE_NO_DATA);
    }

    const embedding = response.data[0].embedding;
    const tokens =
      response.usage?.prompt_tokens ||
      Math.ceil(trimmedText.length / EMBEDDING_CONFIG.CHARS_PER_TOKEN);

    logger.debug('Generated embedding', {
      model,
      tokens,
      textLength: trimmedText.length,
    });

    return {
      embedding,
      model,
      tokens,
    };
  } catch (error) {
    logger.error('Embedding generation failed:', error);
    throw error;
  }
}
