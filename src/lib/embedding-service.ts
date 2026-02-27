/**
 * Embedding Service
 *
 * Provides embedding generation for vector similarity search.
 * Uses OpenAI's text-embedding-3-small model by default.
 */

import 'openai/shims/node';
import OpenAI from 'openai';
import { createLogger } from './logger';

const logger = createLogger('EmbeddingService');

// Singleton OpenAI client
let openaiClient: OpenAI | null = null;

/**
 * Initialize the OpenAI client if not already done
 */
function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
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
 * @param model - Optional model override (defaults to text-embedding-3-small)
 * @returns Promise<EmbeddingResult> with embedding vector, model, and token count
 */
export async function generateEmbedding(
  text: string,
  model: string = 'text-embedding-3-small'
): Promise<EmbeddingResult> {
  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty for embedding generation');
  }

  const client = getOpenAIClient();
  const trimmedText = text.trim();

  try {
    const response = await client.embeddings.create({
      model,
      input: trimmedText,
    });

    if (!response || !response.data || response.data.length === 0) {
      throw new Error(
        'Invalid response from OpenAI embedding API: no data returned'
      );
    }

    const embedding = response.data[0].embedding;
    const tokens =
      response.usage?.prompt_tokens || Math.ceil(trimmedText.length / 4);

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
