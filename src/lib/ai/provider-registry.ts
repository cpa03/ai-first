import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import type { AIModelConfig } from './types';
import { AI_ENV_KEYS } from '../config/env-keys';
import { DEFAULT_TIMEOUTS } from '../config/resilience-config';

/**
 * Interface for AI provider clients
 */
export interface AIProviderClient {
  openai: OpenAI | null;
  anthropic: Anthropic | null;
}

/**
 * Registry for AI provider initialization and management.
 * Handles provider-specific client creation and configuration.
 */
export class AIProviderRegistry {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;

  constructor() {
    this.initializeProviders();
  }

  /**
   * Initialize AI provider clients based on environment variables
   */
  private initializeProviders(): void {
    if (process.env[AI_ENV_KEYS.OPENAI_API_KEY]) {
      this.openai = new OpenAI({
        apiKey: process.env[AI_ENV_KEYS.OPENAI_API_KEY],
        timeout: DEFAULT_TIMEOUTS.openai,
      });
    }

    if (process.env[AI_ENV_KEYS.ANTHROPIC_API_KEY]) {
      this.anthropic = new Anthropic({
        apiKey: process.env[AI_ENV_KEYS.ANTHROPIC_API_KEY],
        timeout: DEFAULT_TIMEOUTS.anthropic,
      });
    }
  }

  /**
   * Get the OpenAI client instance
   */
  getOpenAIClient(): OpenAI | null {
    return this.openai;
  }

  /**
   * Get the Anthropic client instance
   */
  getAnthropicClient(): Anthropic | null {
    return this.anthropic;
  }

  /**
   * Check if a provider is available
   */
  isProviderAvailable(provider: 'openai' | 'anthropic'): boolean {
    return provider === 'openai'
      ? this.openai !== null
      : this.anthropic !== null;
  }

  /**
   * Validate that a provider is configured for the given model config
   */
  validateProviderConfig(config: AIModelConfig): void {
    if (config.provider === 'openai' && !this.openai) {
      throw new Error(
        'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.'
      );
    }
    if (config.provider === 'anthropic' && !this.anthropic) {
      throw new Error(
        'Anthropic API key not configured. Please set ANTHROPIC_API_KEY environment variable.'
      );
    }
  }

  /**
   * Get all available providers
   */
  getAvailableProviders(): string[] {
    const providers: string[] = [];
    if (this.openai) providers.push('openai');
    if (this.anthropic) providers.push('anthropic');
    return providers;
  }

  /**
   * Reset providers (useful for testing)
   */
  reset(): void {
    this.openai = null;
    this.anthropic = null;
    this.initializeProviders();
  }
}

/**
 * Factory function for creating AIProviderRegistry instances.
 * Enables dependency injection for testing.
 */
export function createAIProviderRegistry(): AIProviderRegistry {
  return new AIProviderRegistry();
}

/**
 * Default singleton instance for backward compatibility.
 * @deprecated Use createAIProviderRegistry() for new code.
 */
export const defaultProviderRegistry = new AIProviderRegistry();
